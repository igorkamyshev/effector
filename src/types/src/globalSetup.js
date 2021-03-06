const {resolve, relative, parse, sep, join, extname, basename} = require('path')
const execa = require('execa')
const {
  readFile,
  copy,
  outputJSON,
  outputFile,
  ensureDir,
  readdir,
} = require('fs-extra')

const WRITE_RAW_REPORTS = false

async function syncDirs(from, to, filter) {
  const fromRoot = from
  const toRoot = to
  async function writeFileOnChange(from, to, map) {
    try {
      const [source, target] = await Promise.all([
        readFile(from, 'utf8'),
        readFile(to, 'utf8').catch(err => 'ERROR'),
      ])
      const mappedSource = map(source)
      if (target === 'ERROR' || mappedSource !== target) {
        await outputFile(to, mappedSource, 'utf8')
      }
    } catch (err) {
      console.log(err)
      return
    }
  }
  // @ts-expect-error
  const reqs = []
  async function readDirRec(dir) {
    const relativeSuffix = relative(fromRoot, dir)
    const targetDir = resolve(toRoot, relativeSuffix)
    const dirents = await readdir(dir, {withFileTypes: true})
    for (const dirent of dirents) {
      const name = dirent.name
      const fullName = resolve(dir, name)
      const fullTargetName = resolve(targetDir, name)
      if (dirent.isFile()) {
        if (filter(fullName, fullTargetName)) {
          reqs.push(
            writeFileOnChange(fullName, fullTargetName, code =>
              code.replace(/\@ts\-expect\-error/gm, ''),
            ),
          )
        }
      } else {
        reqs.push(readDirRec(fullName))
      }
    }
  }
  reqs.push(readDirRec(from))
  await Promise.all(reqs)
}

module.exports = async function() {
  const reportPath = resolve(
    __dirname,
    '..',
    '.reports',
    'type-report-full.json',
  )
  const testsDir = resolve(__dirname, '..', '__tests__')
  const flowTestDir = resolve(__dirname, '..', '__fixtures__', '.flow')
  const tsTestDir = resolve(__dirname, '..', '__fixtures__', '.typescript')
  const flowTemplateDir = resolve(__dirname, '..', '__fixtures__', 'flow')
  const tsTemplateDir = resolve(__dirname, '..', '__fixtures__', 'typescript')
  const [{files: testFiles, dirs}] = await Promise.all([
    getTestFiles(testsDir),
    ensureDir(tsTestDir),
  ])
  await Promise.all([
    copy(tsTemplateDir, tsTestDir, {
      overwrite: true,
      errorOnExist: false,
      recursive: false,
    }),
    syncDirs(testsDir, tsTestDir, (filePath, to) => {
      if (extname(filePath) === '') return true
      const fileMeta = testFiles.find(file => file.fullPath === filePath)
      if (!fileMeta) return false
      return fileMeta.type === 'ts'
    }),
  ])
  const tsReport = await runTypeScript(testFiles)
  const fileTypes = {
    ts: [],
    both: [],
  }
  for (const {fullPath, type} of testFiles) {
    const rel = relative(testsDir, fullPath)
    fileTypes[type].push(rel)
  }
  await outputJSON(reportPath, {ts: tsReport, fileTypes}, {spaces: 2})
}

const PRINT_FOREIGN_FILE_NAME = false
const TEST_DIR = 'types'
async function getTestFiles(root) {
  const {files, dirs} = await readTypeDir(root)
  const result = []
  for (const file of files) {
    if (file.isJSFile) {
      const hasTSSibling = files.some(
        ({relativeDir, baseName, isJSFile}) =>
          relativeDir === file.relativeDir &&
          baseName === file.baseName &&
          !isJSFile,
      )
      result.push({
        fullPath: file.fullPath,
        type: hasTSSibling ? 'flow' : 'both',
        relativePath: relative(root, file.fullPath),
        ext: file.ext,
      })
    } else {
      result.push({
        fullPath: file.fullPath,
        type: 'ts',
        relativePath: relative(root, file.fullPath),
        ext: file.ext,
      })
    }
  }
  return {files: result, dirs}
  async function readTypeDir(dir) {
    const dirents = await readdir(dir, {withFileTypes: true})
    const files = []
    const reqs = []
    const dirs = []
    for (const dirent of dirents) {
      const name = dirent.name
      if (dirent.isFile()) {
        const fullPath = resolve(dir, name)
        const ext = extname(name)
        const isTSFile = ext === '.ts' || ext === '.tsx'
        const isJSFile = ext === '.js' || ext === '.jsx'
        if (!isTSFile && !isJSFile) continue
        files.push({
          baseName: basename(name, ext),
          relativeDir: relative(root, dir),
          fullPath,
          isJSFile,
          ext,
        })
      } else {
        dirs.push(resolve(dir, name))
        reqs.push(readTypeDir(resolve(dir, name)))
      }
    }
    const subdirs = await Promise.all(reqs)
    for (const subdir of subdirs) {
      files.push(...subdir.files)
      dirs.push(...subdir.dirs)
    }
    return {files, dirs}
  }
}
async function runTypeScript(testFiles) {
  testFiles = testFiles.filter(({type}) => type === 'ts' || type === 'both')
  const testsDir = resolve(__dirname, '..', '__tests__')
  const repoRoot = resolve(__dirname, '..', '..', '..')
  const tsTestDir = resolve(__dirname, '..', '__fixtures__', '.typescript')
  const reportPath = resolve(__dirname, '..', '.reports', 'type-report-ts-raw')
  const importPaths = testFiles.map(
    ({fullPath}) => `import './${relative(testsDir, fullPath)}'`,
  )

  // await outputFile(resolve(tsTestDir, 'index.tsx'), importPaths.join(`\n`))
  const version = await execa('npx', ['tsc', '-v'])
  try {
    const result = await execa('npx', [
      'tsc',
      '-p',
      join('src', 'types', '__fixtures__', '.typescript'),
    ])
    console.warn('no errors found by typescript typecheck', result)
    return ''
  } catch (err) {
    const cleanedMessage = err.message.replace(/error TS\d+: /gm, '')
    if (WRITE_RAW_REPORTS) {
      await outputFile(reportPath, cleanedMessage)
    }
    return normalizeTSReport(cleanedMessage)
  }
  function normalizeTSReport(report) {
    let current = {
      pos: {line: -1, col: -1},
      lines: [],
      file: '',
    }
    const tsProcessed = []
    for (const line of report.split(/\n/).slice(2)) {
      if (line.startsWith(' ')) {
        current.lines.push(line)
      } else {
        const match = line.match(
          /src\/types\/__fixtures__\/\.typescript\/(.+)\((\d+),(\d+)\): (.+)/,
        )
        if (match) {
          const file = match[1]
          const x = +match[3]
          const y = +match[2]
          const message = match[4]
          tsProcessed.push(current)
          current = {
            pos: {line: y, col: x},
            lines: [message],
            file,
          }
        } else {
          current.lines.push(line)
        }
      }
    }
    tsProcessed.push(current)
    const tsReport = tsProcessed.slice(1).map(({pos, lines, file}) => ({
      pos,
      message: lines.join(`\n`),
      file: recontructFileName(file),
    }))
    return tsReport
  }
  function recontructFileName(file) {
    file = resolve(testsDir, file)
      .replace('.tsx', '')
      .replace('.ts', '')
      .replace('.jsx', '')
      .replace('.js', '')
    const {ext} = testFiles.find(({fullPath, type}) => {
      if (type === 'flow') return false
      fullPath = fullPath
        .replace('.tsx', '')
        .replace('.ts', '')
        .replace('.jsx', '')
        .replace('.js', '')
      return fullPath === file
    })
    return relative(testsDir, `${file}${ext}`)
  }
}
