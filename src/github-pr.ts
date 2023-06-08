import { Octokit } from "octokit";
import fs from 'fs';
import path from 'path';

const tokenData = require('./github-token');

const octokit = new Octokit({ 
  auth: tokenData.token,
});

interface IChangedFilesArgs {
  owner: string,
  repo: string,
  pullNumber: number
}

function getCommentData(){
  const filePath = path.resolve(__dirname, './../markdowns/sample-report-comment.md');
  // console.log(filePath);
  const fileData = fs.readFileSync(filePath, 'utf-8');
  return fileData;
}

export async function getChangedFiles({owner, repo, pullNumber}: IChangedFilesArgs): Promise<Array<string>> {
  let filesChanged: Array<string> = []

  try {
    const iterator = octokit.paginate.iterator("GET /repos/{owner}/{repo}/pulls/{pull_number}/files", {
      owner: owner,
      repo: repo,
      pull_number: pullNumber,
      per_page: 100,
      headers: {
        "x-github-api-version": "2022-11-28",
      },
    } as any);

    for await (const {data} of iterator) {
      filesChanged = [...filesChanged, ...data.map(fileData => fileData.filename)];
    }
  } catch (error: any) {
    if (error.response) {
      console.error(`Error! Status: ${error.response.status}. Message: ${error.response.data.message}`)
    }
    console.error(error)
  }

  return filesChanged
}

export async function commentIfDataFilesChanged({owner, repo, pullNumber}: IChangedFilesArgs) {
  const changedFiles = await getChangedFiles({owner, repo, pullNumber});

  const filePathRegex = new RegExp(/\/data\//, "i");
  // if (!changedFiles.some(fileName => filePathRegex.test(fileName))) {
  //   return;
  // }

  try {
    let commentMessage = `It looks like you changed a data file. These files are auto-generated. \n\nYou must revert any changes to data files before your pull request will be reviewed.`;
        commentMessage = '**Test comment** message added at ' + (new Date().toISOString());
        commentMessage = getCommentData() + '\n\n At - ' + (new Date().toISOString());

        // console.log(getCommentData());

    const {data: comment} = await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
      owner: owner,
      repo: repo,
      issue_number: pullNumber,
      body: commentMessage,
      headers: {
        "x-github-api-version": "2022-11-28",
      },
    });

    return comment;
  } catch (error: any) {
    if (error.response) {
      console.error(`Error! Status: ${error.response.status}. Message: ${error.response.data.message}`)
    }
    console.error(error)
  }
}

//await commentIfDataFilesChanged({owner: "github", repo: "docs", pullNumber: 191});