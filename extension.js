// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode')
const path = require('path')
const { generate } = require('./lib/generate')
const { diff } = require('./lib/diff')
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "lb-vue2i18n" is now active!')

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    'extension.lbVue2i18n',
    function() {
      // The code you place here will be executed every time your command is executed
      // /Users/rwt/gitlab/stock-activity/pages/index.vue
      const currentlyOpenTabfilePath =
        vscode.window.activeTextEditor.document.fileName
      if (
        !path
          .extname(currentlyOpenTabfilePath)
          .toLowerCase()
          .includes('vue')
      ) {
        vscode.window.showInformationMessage('只能提取vue文件')
        return false
      }
      // /Users/rwt/gitlab/stock-activity
      const rootPath = vscode.workspace.workspaceFolders[0].uri.path
      const hasReplaced = generate(currentlyOpenTabfilePath, rootPath)
      const msg = hasReplaced
        ? '成功提取中文到{projectRoot}/lang/zh-CN.json内'
        : '没有需要提取的内容'
      vscode.window.showInformationMessage(msg)
    }
  )

  let disposable2 = vscode.commands.registerCommand(
    'extension.lbDiffCNWithEN',
    function() {
      // /Users/rwt/gitlab/stock-activity
      const rootPath = vscode.workspace.workspaceFolders[0].uri.path
      const cnObj = require(path.join(rootPath, 'lang/zh-CN.json'))
      const enObj = require(path.join(rootPath, 'lang/en.json'))
      const diffObj = diff(cnObj, enObj)
      const newFile = vscode.Uri.parse(
        'untitled:' + path.join(rootPath, 'lang/diff.json')
      )
      vscode.workspace.openTextDocument(newFile).then(document => {
        const edit = new vscode.WorkspaceEdit()
        edit.insert(
          newFile,
          new vscode.Position(0, 0),
          JSON.stringify(diffObj, null, '\t')
        )
        return vscode.workspace.applyEdit(edit).then(success => {
          if (success) {
            vscode.window.showTextDocument(document)
          } else {
            vscode.window.showInformationMessage('Error!')
          }
        })
      })
    }
  )

  context.subscriptions.concat([disposable, disposable2])
}
exports.activate = activate

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
}
