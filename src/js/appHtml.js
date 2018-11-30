import {parseCode} from './code-analyzer';
import $ from 'jquery';
import {createElementsResult} from './parser';
import {substitution} from './substitutor';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#inputPlaceHolder').val();
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode);
        let afterSubstitution = substitution(elements ,codeToParse);
    });
});