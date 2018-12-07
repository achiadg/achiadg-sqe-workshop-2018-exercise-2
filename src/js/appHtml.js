import {parseCode} from './code-analyzer';
import $ from 'jquery';
import {createElementsResult} from './parser';
import {substitution , evalStatements,getChangesInLines} from './substitutor';
import {parseArgs} from './params';
import {processEvaluation} from './evaluationIf';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#inputPlaceHolder').val();
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let argsValues = parseArgs($('#inputArgs').val());
        let indexesToColor = processEvaluation(stringToEval,argsValues,evaluation);
    });
});