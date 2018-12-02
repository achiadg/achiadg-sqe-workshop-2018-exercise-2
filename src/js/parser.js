var elements = [];

export {createElementsResult};
export {elements};


function createElementsResult(parsedCode) {
    elements = [];
    restrictElements(parsedCode, elements);
    return elements;
}


function restrictElements(parsedCode, elements) {
    let i;
    if (parsedCode != [] && parsedCode.body != undefined && parsedCode.body != null) {
        for (i = 0; i < parsedCode.body.length; i++) {
            iterateBodyStatement(parsedCode.body[i], elements, false);
        }
    }
}

function iterateBodyStatement(expression, elements, alternateIf) {
    if (expression.type === 'FunctionDeclaration')
        extractFunctionDeclaration(expression, elements);
    else if (expression.type === 'BlockStatement')
        restrictElements(expression, elements);
    else if (expression.type === 'VariableDeclaration')
        extractVariableDeclaration(expression, elements);
    else if (expression.type === 'ExpressionStatement')
        extractExpressionStatement(expression, elements);
    else
        iterateBodyStatementCont(expression, elements, alternateIf);
}

function iterateBodyStatementCont(expression, elements, alternateIf) {
    if (expression.type === 'WhileStatement')
        extractWhileStatement(expression, elements);
    else if (expression.type === 'IfStatement' && alternateIf === false)
        extractIfStatement(expression, elements);
    else
        iterateBodyStatementCont2(expression, elements, alternateIf);
}

function iterateBodyStatementCont2(expression, elements, alternateIf) {
    if (expression.type === 'IfStatement' && alternateIf === true)
        extractIfElseStatement(expression, elements);
    else if (expression.type === 'ReturnStatement')
        extractReturnStatement(expression, elements);
    else if (expression.type === 'ForStatement')
        extractForStatement(expression, elements);
}

function extractForStatement(expression, elements) {
    var conditionFor = extractValuesFromExpression(expression.test);
    elements.push({
        sline: expression.loc.start.line,
        eline: expression.loc.end.line,
        type: 'for statement',
        condition: conditionFor,
        name: '',
        value: ''
    });
    restrictElements(expression.body, elements);
}


function extractValuesFromExpression(right) {
    var toRet = checkType(right);
    if (toRet != undefined)
        return toRet;
    else if (right.type === 'BinaryExpression')
        return extractValuesFromExpression(right.left) + '' + right.operator + '' + extractValuesFromExpression(right.right);
    else if (right.type === 'MemberExpression')
        return extractValuesFromExpression(right.object) + '[' + extractValuesFromExpression(right.property) + ']';
    else if (right.type === 'UnaryExpression')
        return right.operator + '' + extractValuesFromExpression(right.argument);
}

function checkType(right) {
    if (right.type === 'Literal')
        return right.value.toString();
    else if (right.type === 'Identifier')
        return right.name;
}

function extractFunctionDeclaration(expression, elements) {
    elements.push({
        sline: expression.id.loc.start.line, eline: expression.id.loc.end.line,
        type: 'function declaration',
        name: expression.id.name,
        condition: '',
        value: ''
    });
    for (let param of expression.params) {
        elements.push({
            sline: param.loc.start.line, eline: param.loc.end.line,
            type: 'variable declaration',
            name: param.name,
            condition: '',
            value: ''
        });
    }
    restrictElements(expression.body, elements);
}

function extractVariableDeclaration(expression, elements) {
    for (let declaration of expression.declarations) {
        extractEveryDeclaration(declaration, elements);
    }
}

function extractEveryDeclaration(declaration, elements) {
    if (declaration.init != null) {
        elements.push({
            sline: declaration.loc.start.line, eline: declaration.loc.end.line,
            type: 'variable declaration',
            name: declaration.id.name,
            condition: '',
            value: extractValuesFromExpression(declaration.init)
        });
    } else {
        elements.push({
            sline: declaration.loc.start.line, eline: declaration.loc.end.line,
            type: 'variable declaration',
            name: declaration.id.name,
            condition: '',
            value: 'null'
        });
    }
}
function extractExpressionStatement(expression, elements) {
    var name, value, typeOfStatement;
    if (expression.expression.left === null || expression.expression.left === undefined) {
        if (expression.expression.name != null && expression.expression.name != undefined) {
            name = expression.expression.name;
            value = '';
        } else {
            value = expression.expression.value;
            name = '';
        }
        typeOfStatement = 'expression statement';
    }
    else {
        name = extractValuesFromExpression(expression.expression.left);
        value = extractValuesFromExpression(expression.expression.right);
        typeOfStatement = 'assignment expression';
    }
    pushExpression(expression, typeOfStatement, name, value, elements);
}

function pushExpression(expression, typeOfStatement, name, value, elements) {
    elements.push({
        sline: expression.loc.start.line,
        eline: expression.loc.end.line,
        type: typeOfStatement,
        condition: '',
        name: name,
        value: value
    });
}

function extractWhileStatement(expression, elements) {
    var conditionWhile = extractValuesFromExpression(expression.test);
    elements.push({
        sline: expression.loc.start.line,
        eline: expression.loc.end.line,
        type: 'while statement',
        condition: conditionWhile,
        name: '',
        value: ''
    });
    restrictElements(expression.body, elements);
}

function extractIfStatement(expression, elements) {
    var conditionIf = extractValuesFromExpression(expression.test);
    elements.push({sline: expression.loc.start.line, eline: expression.loc.end.line,type: 'if statement', condition: conditionIf, name: '', value: ''});
    iterateBodyStatement(expression.consequent, elements, false);
    if (expression.alternate != null) {
        iterateBodyStatement(expression.alternate, elements, true);
    }
}

function extractIfElseStatement(expression, elements) {
    var conditionIfAlter = extractValuesFromExpression(expression.test);
    elements.push({
        sline: expression.loc.start.line,
        eline: expression.loc.end.line,
        type: 'else if statement',
        condition: conditionIfAlter,
        name: '',
        value: ''
    });
    iterateBodyStatement(expression.consequent, elements, false);
    if (expression.alternate != null) {
        iterateBodyStatement(expression.alternate, elements, true);
    }
}

function extractReturnStatement(expression, elements) {
    var retValue = extractValuesFromExpression(expression.argument);
    elements.push({
        sline: expression.loc.start.line,
        eline: expression.loc.end.line,
        type: 'return statement',
        condition: '',
        name: '',
        value: retValue
    });
}