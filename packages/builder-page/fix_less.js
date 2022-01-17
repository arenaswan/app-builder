const globby = require('globby');
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const filePatten = [
    path.join('./dist/**', "*.less"),
]

/**
 * 排除：
 * packages\builder-page\src\assets\less\inc\less-plugins\for.less
 * packages\builder-page\src\assets\less\inc\mixins.less、
 * packages\builder-page\src\assets\less\inc\variables.less
 * packages\builder-page\src\components\ApplicationArea\ApplicationLayout\index.less
 * inc、redash 下所有都不加范围
 * packages\builder-page\src\assets\less\global.less
 * packages\builder-page\src\assets\less\ant.less
 */
const matchedPaths = globby.sync(filePatten);
_.each(matchedPaths, (matchedPath)=>{
    const parsePath = path.parse(matchedPath);
    if(
        (parsePath.dir.endsWith('less-plugins') && parsePath.base === 'for.less')
      ||parsePath.dir.endsWith('inc')
      ||parsePath.dir.endsWith('redash')
      ||parsePath.base === 'material-design-iconic-font.less'
      ||(parsePath.dir.endsWith('less') && parsePath.base === 'global.less')
      ||(parsePath.dir.endsWith('less') && parsePath.base === 'ant.less')
      ||(parsePath.dir.endsWith('ApplicationLayout') && parsePath.base === 'index.less')
        || (parsePath.dir.endsWith('components') && parsePath.base === 'ParameterMappingInput.less')
    ){
        console.log(`fix less ignore`, matchedPath);
    }else{
        let data = fs.readFileSync(matchedPath, 'utf8').normalize('NFC')
        fs.writeFileSync(matchedPath, `
.steedos-page{
  ${data}
}
`)
    }
   
})