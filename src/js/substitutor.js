export {substitution,  evalStatements};

function substitution(elements , codeToParse) {
    return true;
}

function evalStatements(elements){
    let result = [];
    for (let element of elements) {
        if(checkType(element)){
            let value = extractNoZero(element);
            result.push({
                sline: element.sline,
                eline: element.eline,
                type: element.type,
                condition: element.condition,
                name: element.name,
                value: value
            });
        }
        else{
            result.push(element);
        }
    }
    return result;
}

function extractNoZero(element) {
    let res = '';
    let index = element.value.indexOf('0');
    if(element.value === '0' || index === -1)
        return element.value;
    if(index !== element.value.length-1)
        res = element.value.slice(0,index) + element.value.slice(index+2, element.value.length);
    else
        res = element.value.slice(0,index - 1);
    return res;
}

function checkType(element) {
    if(element.type === 'variable declaration' && element.value !== '')
        return true;
    else if(element.type === 'assignment expression')
        return true;
    else if(element.type === 'return statement')
        return true;
    else
        return false;
}