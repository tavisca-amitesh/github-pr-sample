
console.log('Start - hello world');

import {commentIfDataFilesChanged} from './github-pr';


async function addComment(){
    let commentObj: any;
    try{
    commentObj = await commentIfDataFilesChanged({owner: "tavisca-amitesh", repo: "github-pr-sample", pullNumber: 1});
    console.log('commentObj =>');
    console.log(JSON.stringify(commentObj, null, '\t'));
    }catch(error: any){
        console.log('Got error while calling comment api =>', error);
    }
    console.log('Done');
    return commentObj;
    
}

addComment();
    

