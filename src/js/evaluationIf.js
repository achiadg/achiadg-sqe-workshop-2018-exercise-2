export {processEvaluation};

function processEvaluation(stringsToEval,argsValues,evaluation) {
    let mappingValueParams = mapParams(evaluation,argsValues);
    let res = [];
    let j = 0;
    while(j<stringsToEval.length){
        if(stringsToEval[j].includes('if'))
            res = handleIfEval(mappingValueParams ,stringsToEval[j],j,res);
        j++;
    }
    return res;
}


function handleIfEval(mappingValueParams ,stringToEval,j,res) {
    let brackets = stringToEval.split(')');
    let afterBrackets = brackets[0].split('(');
    let toEval = afterBrackets[afterBrackets.length-1];
    let stringToEvaluation = '';
    if(mappingValueParams.length <= 0)
        return [];
    for(let element of mappingValueParams){
        stringToEvaluation = stringToEvaluation + 'var ' + element.variable + ' = ' + element.value + ';\n';
    }
    stringToEvaluation = stringToEvaluation + toEval + ';\n';
    if(eval(stringToEvaluation)){
        res.push({color: 'green' , index: j});
        return res;
    }else{
        res.push({color: 'red' , index: j});
        return res;
    }
}

function mapParams(evaluation,argsValues) {
    let i = 0;
    let mappingValueParams = [];
    if(argsValues[0] === '')
        return mappingValueParams;
    for(let element of evaluation){
        if(element.type === 'variable declaration' && element.value === ''){
            mappingValueParams.push({variable: element.name , value: argsValues[i]});
            i++;
        }
    }
    return mappingValueParams;
}