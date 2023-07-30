//비교 규칙
const k8sLocalDomain = /(.*)(\.dev)(\.svc\.cluster\.local.*)/;
const publicDomain   = /(.*)(dev)(.*)(\.)(softcamp\.co\.kr)(.*)/;
const k8sshieldinfoLocalDomain = /(.*)(\.shieldinfo-dev)(\.svc\.cluster\.local.*)/;

//namespace에 따라 환경에 맞는 값 맵핑
/* 
shieldinfo 조건
1. shieldinfo-dev namespace 를 참조하는 /(.*)(\.shieldinfo-dev)(\.svc\.cluster\.local.*)/; 조건일 경우 shieldinfo-dev->lms-sta O
2. dev namespace 를 참조하는 경우는 const publicDomain(외부도메인) 그대로 참조 O
3. /(.*)(\.dev)(\.svc\.cluster\.local.*)/; 조건일 경우 dev -> ds2 로 변경되어야함 X
4. 일본 환경은 running comfigmap 리포지토리에 jp 폴더를 참조 
shieldgate 조건
1. dev -> sta, or 각 namespace 가 들어가는 경우가 있음 ??
*/
export default (targetString, targetNamespace) => {
  let public_prefix = "";
  let public_domain = "security365.com";
  switch (targetNamespace) {
    case 'ds2':
      public_prefix = 'sta';
      break;
    case 'security365':
      public_prefix = '';
      public_domain = 'security365.co.kr';
      break;
    case 'sk':
      public_prefix = 'sk';
      break;
    case 'shieldgate-sta' :
      public_prefix = 'sta';
      break;
    case 'shieldgate' :
      public_prefix = '';
      break;
    case 'shieldgate-sk' :
      public_prefix = 'sk'
      break;
    case 'lms-sta' :
      public_prefix = 'sta';
      if(targetString.match(k8sLocalDomain)) {
        targetNamespace = 'ds2';
      }
      break;
    case 'lms' :
      public_prefix = '';
      public_domain = 'security365.co.kr';
      if(targetString.match(k8sLocalDomain)) {
        targetNamespace = 'security365';
      }
      break;
    case 'lms-sk' :
      public_prefix = 'sk';
      if(targetString.match(k8sLocalDomain)) {
        targetNamespace = 'sk';
      }
      break;
    case 'jp' :
      public_prefix = 'j';
      if(targetString.match(k8sLocalDomain)) {
        targetNamespace = 'security365';
      }
      break;
    case 'shieldgate-jp' :
      public_prefix = 'j'    
      break;  
    default:
      break;
  }
  //'비교 규칙' 에 양식에 맞게 해당 하는 값으로 저장
  if(targetString.match(k8sLocalDomain)) {
    return targetString.replace(k8sLocalDomain, `$1.${targetNamespace}$3`);
  } else if (targetString.match(publicDomain)){
      if(public_prefix === 'j'){
        return targetString.replace(publicDomain, `$1$3${public_prefix}$4${public_domain}$6`);
      }
    return targetString.replace(publicDomain, `$1${public_prefix}$3$4${public_domain}$6`);
  } else if (targetString.match(k8sshieldinfoLocalDomain)) {
    return targetString.replace(k8sshieldinfoLocalDomain, `$1.${targetNamespace}$3`);
  }

   else {
    return targetString;
  }
}
