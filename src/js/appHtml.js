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
        let argsValues = parseArgs($('#inputArgs').val());
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode,argsValues);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
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
        addColor(div,str,indexesToColor,stringToEval,document);
    }
}

function addColor(div,str,indexesToColor,stringToEval,document) {
    let found = false;
    for(let element of indexesToColor){
        if(stringToEval.indexOf(str) === element.index){
            found = true;
            var el_span = document.createElement('span');
            el_span.setAttribute('style', 'color: ' + element.color);
            var newText1 = document.createTextNode(str);
            div.appendChild(el_span);
            el_span.appendChild(newText1);
        }
    }
    if(found === false){
        var newText2 = document.createTextNode(str);
        div.appendChild(newText2);
    }
}