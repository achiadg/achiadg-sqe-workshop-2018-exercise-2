export {substitution,  evalStatements,getChangesInLines,functionElement};

import {mapOfVars,mapOfParams} from './parser';

var indexes = [];
var linesAfterChanges = [];
var functionElement = null;

var i = 0;

function getChangesInLines(codeToParse,elements) {
    linesAfterChanges = [];
    let lines = codeToParse.split('\n');
    let j = 0;
    while(j<lines.length){
        if(lines[j].includes('function'))
            linesAfterChanges.push(lines[j]);
        else if(lines[j].includes('return'))
            handleReturn(lines[j],elements,j);
        else if(lines[j].includes('else if'))
            handleIfElse(lines[j],elements,j);
        else
            getChangesInLinesCont(lines,j,elements);
        j++;
    }
    return linesAfterChanges;
}

function getChangesInLinesCont(lines,j,elements) {
    if(lines[j].includes('if'))
        handleIf(lines[j],elements,j);
    else if(lines[j].includes('while'))
        handleWhile(lines[j],elements,j);
    else if(lines[j].includes('let'))
        handleLet(lines[j],elements,j);
    else if(lines[j].includes('='))
        handleAssignment(lines[j],elements,j);
    else
        linesAfterChanges.push(lines[j]);
}

function handleReturn(line,elements,j) {
    let split = line.split('return');
    for(let element of elements){
        if(element.sline === j+1 && element.type === 'return statement')
            linesAfterChanges.push(split[0] + 'return '+element.value+';\n');
    }
}

function handleIf(line,elements,j) {
    for(let element of elements){
        if(element.sline === j+1 && element.type === 'if statement')
            pushStatementBrackets(line , element);
    }
}

function handleIfElse(line,elements,j) {
    for(let element of elements){
        if(element.sline === j+1 && element.type === 'else if statement')
            pushStatementBrackets(line , element);
    }
}

function handleWhile(line,elements,j) {
    for(let element of elements){
        if(element.sline === j+1 && element.type === 'while statement')
            pushStatementBrackets(line , element);
    }
}

function handleLet(line,elements,j) {
    let split = line.split('let');
    for(let element of elements){
        if(element.sline === j+1 && element.type === 'variable declaration' && checkValue(element))
            linesAfterChanges.push(split[0] + 'let ' + element.name + ' = ' + element.value + ';\n');
    }
}

function handleAssignment(line,elements,j) {
    let res = retIndex(line);
    let emptyStr = newStrFromIndex(res);
    for(let element of elements){
        if(element.sline === j+1 && element.type === 'assignment expression' && checkValue(element))
            linesAfterChanges.push(emptyStr + element.name + ' = ' +  element.value + ';\n');
    }
}

function newStrFromIndex(res) {
    let emptyStr = '';
    for(let i = 0; i<res;i++){
        emptyStr = emptyStr + ' ';
    }
    return emptyStr;
}

function retIndex(line){
    let found = false;
    let res = 0;
    for(let i = 0; i<line.length && !found;i++){
        if(line.charAt(i) !== ' '){
            res = i;
            found = true;
        }
    }
    return res;
}

function checkValue(element) {
    if(element.value === 'null' || element.value === '')
        return false;
    else
        return true;
}

function pushStatementBrackets(line , element) {
    let res = '';
    let i = 0;
    let brackets = line.split(')');
    while(i < line.length){
        if(line.charAt(i) !== '(') {
            res = res + line.charAt(i);
            i++;
        }else{
            res = res + line.charAt(i);
            res = res + element.condition + ')';
            res = res + brackets[brackets.length-1] + '\n';
            i = line.length;
        }
    }
    linesAfterChanges.push(res);
}

function substitution(elements , lines) {
    indexes = [];
    functionElement = null;
    for(let element of elements){
        if(element.type === 'function declaration')
            functionElement = element;
    }
    if(functionElement === null)
        return lines;
    else{
        let newLines = removeLines(lines);
        return handleSubstitution(functionElement , newLines, elements);
    }
}

function removeLines(lines) {
    let newLines = [];
    for(let line of lines){
        let found = findIndex(line);
        if(found === true)
            newLines.push(line);
        else {
            indexes.push(lines.indexOf(line));
        }
    }
    return newLines;
}

function findIndex(line){
    let found = false;
    for(i=0;i<line.length && found === false;i++){
        if(line.charAt(i) !== ' ')
            found = true;
    }
    return found;
}

function findMinIndex() {
    let min = 10000;
    if(indexes.length > 0)
        min = indexes[0];
    else
        return min;
    for(let i = 1; i<indexes.length; i++){
        if(indexes[i] < min)
            min = indexes[i];
    }
    return min;
}

function handleSubstitution(functionElement , lines, elements) {
    let min = findMinIndex();
    for(let element of elements){
        if(element.type === 'variable declaration' || (element.type === 'assignment expression' && !inParams(element.name))){
            lines = removeLocalLines(element , lines, functionElement,min);
        }
    }
    return lines;
}

function inParams(name){
    let res = false;
    for(let element of mapOfParams){
        if(element.variable === name){
            res = true;
        }
    }
    return res;
}

function removeLocalLines(element , lines, functionElement,min) {
    if(element.sline > functionElement.sline){
        for(let sub of mapOfVars){
            if(sub.name === element.name) {
                if(element.sline - 1 < min){
                    lines.splice(element.sline - 1 - i, 1);
                    i++;
                }
                else
                {
                    lines.splice(element.sline - 1 - i - 1, 1);
                    i++;
                }
            }
        }
    }
    return lines;
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