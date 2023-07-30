import { readdir, readFile } from 'node:fs/promises';

import YAML from 'yaml';
//
import directoryTree from 'directory-tree';
import { writeFile } from 'node:fs';

import urlConverter from "./urlConverter.js";
import multiLineCMParser from "./multiLineCMParser.js";

//Azure Repos 에 있는 Configmap경로 지정
const dev_dir = '../idc_cm/dev';
const dev_tree = directoryTree(dev_dir);
const dst_dir = '../dst_cm';
const dst_tree = directoryTree(dst_dir, { exclude: /\.git|README.md/ });

//경로 내 모든 Configmap파일을 전부 비교(namespace 별 configmap 전부 비교)
for (const dev_file of dev_tree.children) {
  for (const namespace of dst_tree.children) {
    var result = namespace.children.find(item => item.name === dev_file.name);
    if (result) {

      console.log(`  ${namespace.name} has ${result.name}`);
      //파일의 경로 및 파일 내용 지정
      const dev_file_content = await readFile(dev_file.path);
      const dev_parsed_content = YAML.parse(dev_file_content.toString('utf-8'));
      console.log(dev_file_content.toString('utf-8'));
      console.log(dev_parsed_content);

      const dst_file_content = await readFile(result.path);
      const dst_parsed_content = YAML.parse(dst_file_content.toString('utf-8'));
      //console.log(dst_parsed_content);
      //파일 내 모든 key, value 값 비교
      for (const file_dev_key in dev_parsed_content.data) {
        if (file_dev_key === 'config.js') {
          console.log( `${dev_file.name} : I hate multi-line values in ${file_dev_key}`);
           console.log(dev_parsed_content.data[file_dev_key]);
          dst_parsed_content.data[file_dev_key] = multiLineCMParser(dev_parsed_content.data[file_dev_key], dst_parsed_content.data[file_dev_key], namespace.name, dev_file.name);//파일 이름 받기
          // console.log(dst_parsed_content.data[file_dev_key])
        }
        else if (Object.hasOwnProperty.call(dev_parsed_content.data, file_dev_key)) {
          const file_dev_element = dev_parsed_content.data[file_dev_key];
          //원본(dev)와 다른 부분이 있으면 converet
          if (!dst_parsed_content.data.hasOwnProperty(file_dev_key)) {
            dst_parsed_content.data[file_dev_key] = urlConverter(file_dev_element, namespace.name)
          }
        }
      }
      //변경된 내용 저장
      const dst_stringified_file = YAML.stringify(dst_parsed_content);
      console.log(namespace.name + ': ' + result.name);
      console.log(dst_stringified_file + '\n');
      writeFile(result.path, dst_stringified_file, (err) => {
        if (err) {
          console.log(err);
        }
      });
    } else {

      // console.log(`  ${namespace.name} has not`);

    }
  }
}
