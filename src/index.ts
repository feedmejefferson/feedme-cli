import * as minimist from 'minimist';
import { buildBaskets } from './tree-splitter'

const args = minimist(process.argv.slice(2), {
//    string: 'lang',           // --lang xml
//    boolean: ['version', 'stuff'],     // --version
//    alias: { v: 'version', s: 'stuff' } 
  });
  
const command = args._[0]; // split
// depending on import or export, the source and target are either a firestore
// collection or a local folder
const source = args._[1]; 
const target = args._[2]; 

if (command==='split') {
  buildBaskets(source, target);
} else {
  console.log("Usage: feedme split <input-directory> <output-directory>");
}