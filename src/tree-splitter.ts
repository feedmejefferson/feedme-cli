import { expandTree, splitTree, validateTree } from "feedme-trees";
import { readFile as rf, writeFile as wf } from "fs";
import { promisify } from "util";

const readFile = promisify(rf);
const writeFile = promisify(wf);
const appName = "adam";
let inputTree;
let separated;

export async function buildBaskets(source: string, target: string) {
  readFile(`${source}/food-tree.${appName}.json`, "UTF8")
    .then(data => JSON.parse(data))
    .then(tree => {
      console.log("Validating input tree");
      if(validateTree(tree)) {
        console.log("The input tree was valid");
        inputTree={...tree};
        return tree;
      } 
      throw new Error("The input tree was not valid");
    })
    .then(tree => {
      console.log("Separating Input Tree into Baskets")
      separated = splitTree(tree, 2, 2)
      return {...separated};
    }) 
    .then(split => {
      console.log("Validating Input Tree can be Recreated from Separated Tree")
      const sep = {...split}
      let reconstituted = {...split.core};
      delete(sep.core)
      Object.keys(sep)
        .map(k=>parseInt(k))
        .sort((a,b)=>(a-b)) // sort numerically instead of lexographically
        .forEach(k=>{reconstituted = expandTree(reconstituted,sep[k])})
      console.log("Validating reconstituted tree is same as original")
      // TODO: check for deep equality here
      const valid = (Object.keys(reconstituted).length === Object.keys(inputTree).length);
      if(!valid) {
  //      writeFile(`output/tree.reconstituted.json`,JSON.stringify(reconstituted))
        throw new Error("The original tree could not be reconstituted")
      }
      console.log("The separated tree is valid")
      return split;
    })
    .then(split => {
      readFile(`${source}/attributions.${appName}.json`,"UTF8")
        .then(data => JSON.parse(data))
        .then(attr => {
          const obj = {};
          attr.forEach(v=>obj[v.id]=v);
          return obj;
        })
        .then(attr => {
          // build the basket ids
          const basketIds = {...split};
          delete(basketIds.core);
          Object.keys(basketIds).forEach(key=>{
            basketIds[key]=`${key}`;
          });
          Object.keys(split)
            .forEach(k=>{
              const basket: any = {};
              basket.tree = split[k]
              const attributions = {};
              if(k==="core") {
                Object.keys(basket.tree).map(k2=>basket.tree[k2]).forEach(k3=>{attributions[k3]=attr[k3]})
                basket.baskets = basketIds;
              } else {
                // TODO: refactor to cleanup and remove attributions already
                // included in parent baskets
                Object.keys(basket.tree).forEach(k2=>{
                  const v2 = basket.tree[k2];
                  Object.keys(v2).map(k3=>v2[k3])
                    .forEach(k4=>{attributions[k4]=attr[k4]})
                })
                basket.id = basketIds[k];
              }
              basket.attributions = attributions;
              console.log(`Writing out basket file for ${k}.`)
              writeFile(`${target}/basket.${k}.json`,JSON.stringify(basket))
            })
    
        })
    });
  }