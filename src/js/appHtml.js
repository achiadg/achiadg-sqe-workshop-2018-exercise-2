import {parseCode} from './code-analyzer';
import $ from 'jquery';
import {createElementsResult} from './parser';
import {substitution , evalStatements,getChangesInLines} from './substitutor';
import {parseArgs} from './params';
import {processEvaluation} from './evaluationIf';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        var div = document.getElementById('outputFunction');
        div.innerHTML = '';
        let codeToParse = $('#inputPlaceHolder').val();
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let argsValues = parseArgs($('#inputArgs').val());
        let indexesToColor = processEvaluation(stringToEval,argsValues,evaluation);
        showTextOnScreen(document,stringToEval,indexesToColor);

    });
});

function showTextOnScreen(document,stringToEval,indexesToColor) {
    var div = document.getElementById('outputFunction');
    for(let str of stringToEval){
        if(str.charAt(str.length-1) !== '\n'){
            str = str + '\n';
        }
        addColor(div,str,indexesToColor,stringToEval);
    }
}

function addColor(div,str,indexesToColor,stringToEval) {
    let found = false;
    for(let element of indexesToColor){
        if(stringToEval.indexOf(str) === element.index){
            found = true;
            var div2 = document.createElement('div');
            div2.style.width = '100px';
            div2.style.height = '100px';
            div2.style.color = element.color;
            div2.innerHTML = str;
            div.appendChild(div2);
        }
    }
    if(found === false)
        div.innerHTML = div.innerHTML + str;
}