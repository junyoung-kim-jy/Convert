// import { diffChars } from "diff";

import urlConverter from "./urlConverter.js";

export default (dev_mass, dst_mass, dst_ns, file_name) => {
//개행 문자열 제거
  let splited_dev_mass = dev_mass.replaceAll(':\n', ': ').split('\n');
  let splited_dst_mass = dst_mass.split('\n');

  let dev_parsed_contents = {};
  let dst_parsed_contents = {};

  const re = /"?(.*)"?/

  let converted_cm = ''
  
  splited_dev_mass.forEach(element => {
    if (element.includes(': ')) {
      var this_line = element.split(/:\s/);
      var key = this_line[0].trim();
      var value = this_line[1].trim().replaceAll('"', '').replace(/,?$/, '');
      dev_parsed_contents[key] = value;
    }
  });

  splited_dst_mass.forEach(element => {
    if (element.includes(': ')) {
      var this_line = element.split(/:\s/);
      var key = this_line[0].trim();
      var value = this_line[1].trim().replaceAll('"', '').replace(/,?$/, '');

      dst_parsed_contents[key] = value;
      console.log(dst_parsed_contents)
    }
  });

  for (const key in dev_parsed_contents) {
    if (Object.hasOwnProperty.call(dev_parsed_contents, key)) {
      const element = dev_parsed_contents[key];
      if (!dst_parsed_contents.hasOwnProperty(key)) {
        dst_parsed_contents[key] = urlConverter(element, dst_ns);
      }
    }
  }
//Configmap 형태가 다른 SHIELDrive-web 분기처리
if(file_name === 'shieldrive-web-config_cm.yaml') {
//JSON.stringify를 사용하면 강제로 쌍따옴표가 씌워짐 -> value는 쌍따옴표로 묶고, key 는 그룹핑해서 찾은다음 ':' 만 붙여서 반환
  converted_cm = `var config = (() => {    
    return ` + JSON.stringify(dst_parsed_contents, undefined, 6, function(key,value) {
      if (typeof value === "string") {
        return value;
      }
      return value;
    }, 2).replace(/"(\w+)":/g, '$1:') + ';\n' + '})();';
}
else {
  converted_cm = 'var config = ' + JSON.stringify(dst_parsed_contents, undefined, 4, function(key,value) {
      if (typeof value === "string") {
        return value;
      }
      return value;
    }, 2).replace(/"(\w+)":/g, '$1:') + ';';
}

  return converted_cm;
}
/*
1. 한줄인 부분 개선 -> 
2. var config 다른거 일때 -> shieldrive directory cm -> if var config~~ 변경
*/