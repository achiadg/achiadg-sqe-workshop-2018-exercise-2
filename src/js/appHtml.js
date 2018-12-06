import {parseCode} from './code-analyzer';
import $ from 'jquery';
import {createElementsResult , mapOfVars , mapOfVarsTemp} from './parser';
import {substitution , evalStatements} from './substitutor';
import {parseArgs} from './params';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#inputPlaceHolder').val();
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode);
        let evaluation = evalStatements(elements);
        let argsValues = parseArgs($('#inputArgs').val());
        let afterSubstitution = substitution(elements);
    });
});