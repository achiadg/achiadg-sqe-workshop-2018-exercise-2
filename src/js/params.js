export {parseArgs};
var i = 0;

function parseArgs(valueOfAllArgs) {
    const argsText = valueOfAllArgs.split(',');
    let argsVals = iterateStr(argsText , []);
    return argsVals;
}

function iterateStr(argsText , argsVals) {
    while(i < argsText.length){
        argsVals = checkIfCanAddToResult(argsText , argsVals);
        if(argsText[i].charAt(0) === '['){
            let result = argsText[i];
            i++;
            while(i<argsText.length && argsText[i].charAt(argsText[i].length-1) !== ']')
            {
                result = result + ',' + argsText[i];
                i++;
            }
            result = result + ',' + argsText[i];
            argsVals.push(result);
            i++;
        } else if(argsText[i].length === 0)
            argsVals.push('');
    }
    i = 0;
    return argsVals;
}

function checkIfCanAddToResult(argsText , argsVals) {
    if(argsText[i].length > 0 && argsText[i].charAt(0) !== '['){
        argsVals.push(argsText[i]);
        i++;
    }
    return argsVals;
}

