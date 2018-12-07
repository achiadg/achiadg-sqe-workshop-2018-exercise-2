var elements = [];
var mapOfVars = [];
var mapOfVarsTemp = [];
var mapOfParams = [];

export {createElementsResult};
export {elements , mapOfVars , mapOfVarsTemp,mapOfParams};


function createElementsResult(parsedCode,argsValues) {
    mapOfParams = [];
    elements = [];
    restrictElements(parsedCode, elements,argsValues);
    return elements;
}


function restrictElements(parsedCode, elements,argsValues) {
    let i;
    if (parsedCode != [] && parsedCode.body != undefined && parsedCode.body != null) {
        for (i = 0; i < parsedCode.body.length; i++) {
            iterateBodyStatement(parsedCode.body[i], elements, false,argsValues);
        }
    }
}

function iterateBodyStatement(expression, elements, alternateIf,argsValues) {
    if (expression.type === 'FunctionDeclaration')
        extractFunctionDeclaration(expression, elements,argsValues);
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
    else if (right.type === 'Identifier'){
        if(checkIfExistInMap(mapOfVars , right.name)){
            return retCorrectValue(right.name , mapOfVars);
        }
        else{
            return right.name;
        }
    }
}

function retCorrectValue(name , map) {
    for(let element of map){
        if(element.name === name)
            return element.value;
    }
}

function checkIfExistInMap(map , name) {
    let isExist = false;
    for(let element of map){
        if(element.name === name)
            isExist = true;
    }
    return isExist;
}

function extractFunctionDeclaration(expression, elements,argsValues) {
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
        addToParamMap(argsValues,param.name,expression.params.indexOf(param));
    }
    restrictElements(expression.body, elements);
}

function addToParamMap(argsValues,name,index) {
    mapOfParams.push({variable: name , value: argsValues[index]});
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
            type: 'variable declaration', name: declaration.id.name,
            condition: '',
            value: extractValuesFromExpression(declaration.init)
        });
        addToMap(declaration.id.name , extractValuesFromExpression(declaration.init));
    } else {
        elements.push({
            sline: declaration.loc.start.line, eline: declaration.loc.end.line,
            type: 'variable declaration', name: declaration.id.name,
            condition: '',
            value: 'null'
        });
        addToMap(declaration.id.name , 'null');
    }
}
function extractExpressionStatement(expression, elements) {
    var name, value, typeOfStatement;
    if (expression.expression.left === null || expression.expression.left === undefined) {
        if (expression.expression.name != null && expression.expression.name != undefined) {
            name = extractValuesFromExpression(expression.expression.name);
            value = '';
        } else {
            value = extractValuesFromExpression(expression.expression.value);
            name = '';
        }
        typeOfStatement = 'expression statement';
    }
    else {
        name = expression.expression.left.name;
        value = extractValuesFromExpression(expression.expression.right);
        typeOfStatement = 'assignment expression';
        addToMap(name , value);
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
    copyMapToTemp();
    restrictElementsWhile(expression.body, elements);
}

function extractIfStatement(expression, elements) {
    var conditionIf = extractValuesFromExpression(expression.test);
    elements.push({sline: expression.loc.start.line, eline: expression.loc.end.line,type: 'if statement', condition: conditionIf, name: '', value: ''});
    copyMapToTemp();
    iterateBodyStatementIf(expression.consequent, elements, false);
    if (expression.alternate != null) {
        copyMapToTemp();
        iterateBodyStatementIf(expression.alternate, elements, true);
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
    copyMapToTemp();
    iterateBodyStatementIf(expression.consequent, elements, false);
    if (expression.alternate != null) {
        copyMapToTemp();
        iterateBodyStatementIf(expression.alternate, elements, true);
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

function iterateBodyStatementIf(expression, elements, alternateIf) {
    if (expression.type === 'BlockStatement')
        restrictElementsIf(expression, elements);
    else if (expression.type === 'VariableDeclaration')
        extractVariableDeclarationIf(expression, elements);
    else if (expression.type === 'ExpressionStatement')
        extractExpressionStatementIf(expression, elements);
    else
        iterateBodyStatementContIf(expression, elements, alternateIf);
}

function restrictElementsIf(parsedCode, elements) {
    let i;
    if (parsedCode != [] && parsedCode.body != undefined && parsedCode.body != null) {
        for (i = 0; i < parsedCode.body.length; i++) {
            iterateBodyStatementIf(parsedCode.body[i], elements, false);
        }
    }
}

function extractVariableDeclarationIf(expression, elements) {
    for (let declaration of expression.declarations) {
        extractEveryDeclarationIf(declaration, elements);
    }
}

function extractEveryDeclarationIf(declaration, elements) {
    if (declaration.init != null) {
        elements.push({
            sline: declaration.loc.start.line, eline: declaration.loc.end.line,
            type: 'variable declaration', name: declaration.id.name,
            condition: '',
            value: extractValuesFromExpressionIf(declaration.init)
        });
        addToMapTemp(declaration.id.name , extractValuesFromExpressionIf(declaration.init));
    } else {
        elements.push({
            sline: declaration.loc.start.line, eline: declaration.loc.end.line,
            type: 'variable declaration', name: declaration.id.name,
            condition: '',
            value: 'null'
        });
        addToMapTemp(declaration.id.name , 'null');
    }
}

function extractValuesFromExpressionIf(right) {
    var toRet = checkTypeIf(right);
    if (toRet != undefined)
        return toRet;
    else if (right.type === 'BinaryExpression')
        return extractValuesFromExpressionIf(right.left) + '' + right.operator + '' + extractValuesFromExpressionIf(right.right);
    else if (right.type === 'MemberExpression')
        return extractValuesFromExpressionIf(right.object) + '[' + extractValuesFromExpressionIf(right.property) + ']';
    else if (right.type === 'UnaryExpression')
        return right.operator + '' + extractValuesFromExpressionIf(right.argument);
}

function checkTypeIf(right) {
    if (right.type === 'Literal')
        return right.value.toString();
    else if (right.type === 'Identifier'){
        if(checkIfExistInMap(mapOfVarsTemp , right.name)){
            return retCorrectValue(right.name , mapOfVarsTemp);
        }
        else{
            return right.name;
        }
    }
}

function extractExpressionStatementIf(expression, elements) {
    var name, value, typeOfStatement;
    if (expression.expression.left === null || expression.expression.left === undefined) {
        if (expression.expression.name != null && expression.expression.name != undefined) {
            name = extractValuesFromExpressionIf(expression.expression.name);
            value = '';
        } else {
            value = extractValuesFromExpressionIf(expression.expression.value);
            name = '';
        }
        typeOfStatement = 'expression statement';
    }
    else {
        name = expression.expression.left.name;
        value = extractValuesFromExpressionIf(expression.expression.right);
        addToMapTemp(name , value);
        typeOfStatement = 'assignment expression';
    }
    pushExpression(expression, typeOfStatement, name, value, elements);
}

function iterateBodyStatementContIf(expression, elements, alternateIf) {
    if (expression.type === 'WhileStatement')
        extractWhileStatementIf(expression, elements);
    else if (expression.type === 'IfStatement' && alternateIf === false)
        extractIfStatementIf(expression, elements);
    else
        iterateBodyStatementCont2If(expression, elements, alternateIf);
}

function extractWhileStatementIf(expression, elements) {
    var conditionWhile = extractValuesFromExpressionIf(expression.test);
    elements.push({
        sline: expression.loc.start.line,
        eline: expression.loc.end.line,
        type: 'while statement',
        condition: conditionWhile,
        name: '',
        value: ''
    });
    copyMapToTemp();
    restrictElementsWhile(expression.body, elements);
}

function extractIfStatementIf(expression, elements) {
    var conditionIf = extractValuesFromExpressionIf(expression.test);
    elements.push({sline: expression.loc.start.line, eline: expression.loc.end.line,type: 'if statement', condition: conditionIf, name: '', value: ''});
    copyMapToTemp();
    iterateBodyStatementIf(expression.consequent, elements, false);
    if (expression.alternate != null) {
        copyMapToTemp();
        iterateBodyStatementIf(expression.alternate, elements, true);
    }
}

function iterateBodyStatementCont2If(expression, elements, alternateIf) {
    if (expression.type === 'IfStatement' && alternateIf === true)
        extractIfElseStatementIf(expression, elements);
    else if (expression.type === 'ReturnStatement')
        extractReturnStatementIf(expression, elements);
}

function extractIfElseStatementIf(expression, elements) {
    var conditionIfAlter = extractValuesFromExpressionIf(expression.test);
    elements.push({
        sline: expression.loc.start.line,
        eline: expression.loc.end.line,
        type: 'else if statement',
        condition: conditionIfAlter,
        name: '',
        value: ''
    });
    copyMapToTemp();
    iterateBodyStatementIf(expression.consequent, elements, false);
    if (expression.alternate != null) {
        copyMapToTemp();
        iterateBodyStatementIf(expression.alternate, elements, true);
    }
}

function extractReturnStatementIf(expression, elements) {
    var retValue = extractValuesFromExpressionIf(expression.argument);
    elements.push({
        sline: expression.loc.start.line,
        eline: expression.loc.end.line,
        type: 'return statement',
        condition: '',
        name: '',
        value: retValue
    });
}

function restrictElementsWhile(parsedCode, elements) {
    let i;
    if (parsedCode != [] && parsedCode.body != undefined && parsedCode.body != null) {
        for (i = 0; i < parsedCode.body.length; i++) {
            iterateBodyStatementWhile(parsedCode.body[i], elements, false);
        }
    }
}

function iterateBodyStatementWhile(expression, elements, alternateIf) {
    if (expression.type === 'BlockStatement')
        restrictElementsWhile(expression, elements);
    else if (expression.type === 'VariableDeclaration')
        extractVariableDeclarationWhile(expression, elements);
    else if (expression.type === 'ExpressionStatement')
        extractExpressionStatementWhile(expression, elements);
    else
        iterateBodyStatementContWhile(expression, elements, alternateIf);
}

function extractVariableDeclarationWhile(expression, elements) {
    for (let declaration of expression.declarations) {
        extractEveryDeclarationWhile(declaration, elements);
    }
}

function extractEveryDeclarationWhile(declaration, elements) {
    if (declaration.init != null) {
        elements.push({
            sline: declaration.loc.start.line, eline: declaration.loc.end.line,
            type: 'variable declaration', name: declaration.id.name,
            condition: '',
            value: extractValuesFromExpressionWhile(declaration.init)
        });
        addToMapTemp(declaration.id.name , extractValuesFromExpressionIf(declaration.init));
    } else {
        elements.push({
            sline: declaration.loc.start.line, eline: declaration.loc.end.line,
            type: 'variable declaration', name: declaration.id.name,
            condition: '',
            value: 'null'
        });
        addToMapTemp(declaration.id.name , 'null');
    }
}
function extractExpressionStatementWhile(expression, elements) {
    var name, value, typeOfStatement;
    if (expression.expression.left === null || expression.expression.left === undefined) {
        if (expression.expression.name != null && expression.expression.name != undefined) {
            name = extractValuesFromExpressionWhile(expression.expression.name);
            value = '';
        } else {
            value = extractValuesFromExpressionWhile(expression.expression.value);
            name = '';
        }
        typeOfStatement = 'expression statement';
    }
    else {
        name = expression.expression.left.name;
        value = extractValuesFromExpressionWhile(expression.expression.right);
        addToMapTemp(name , value);
        typeOfStatement = 'assignment expression';
    }
    pushExpression(expression, typeOfStatement, name, value, elements);
}

function iterateBodyStatementContWhile(expression, elements, alternateIf) {
    if (expression.type === 'WhileStatement')
        extractWhileStatementWhile(expression, elements);
    else if (expression.type === 'IfStatement' && alternateIf === false)
        extractIfStatementWhile(expression, elements);
    else
        iterateBodyStatementCont2While(expression, elements, alternateIf);
}

function extractWhileStatementWhile(expression, elements) {
    var conditionWhile = extractValuesFromExpressionWhile(expression.test);
    elements.push({
        sline: expression.loc.start.line,
        eline: expression.loc.end.line,
        type: 'while statement',
        condition: conditionWhile,
        name: '',
        value: ''
    });
    copyMapToTemp();
    restrictElementsWhile(expression.body, elements);
}

function extractIfStatementWhile(expression, elements) {
    var conditionIf = extractValuesFromExpressionWhile(expression.test);
    elements.push({sline: expression.loc.start.line, eline: expression.loc.end.line,type: 'if statement', condition: conditionIf, name: '', value: ''});
    copyMapToTemp();
    iterateBodyStatementIf(expression.consequent, elements, false);
    if (expression.alternate != null) {
        copyMapToTemp();
        iterateBodyStatementIf(expression.alternate, elements, true);
    }
}

function iterateBodyStatementCont2While(expression, elements, alternateIf) {
    if (expression.type === 'IfStatement' && alternateIf === true)
        extractIfElseStatementWhile(expression, elements);
    else if (expression.type === 'ReturnStatement')
        extractReturnStatementWhile(expression, elements);
}

function extractIfElseStatementWhile(expression, elements) {
    var conditionIfAlter = extractValuesFromExpressionWhile(expression.test);
    elements.push({
        sline: expression.loc.start.line,
        eline: expression.loc.end.line,
        type: 'else if statement',
        condition: conditionIfAlter,
        name: '',
        value: ''
    });
    copyMapToTemp();
    iterateBodyStatementIf(expression.consequent, elements, false);
    if (expression.alternate != null) {
        copyMapToTemp();
        iterateBodyStatementIf(expression.alternate, elements, true);
    }
}

function extractReturnStatementWhile(expression, elements) {
    var retValue = extractValuesFromExpressionWhile(expression.argument);
    elements.push({
        sline: expression.loc.start.line,
        eline: expression.loc.end.line,
        type: 'return statement',
        condition: '',
        name: '',
        value: retValue
    });
}

function extractValuesFromExpressionWhile(right) {
    var toRet = checkTypeWhile(right);
    if (toRet != undefined)
        return toRet;
    else if (right.type === 'BinaryExpression')
        return extractValuesFromExpressionWhile(right.left) + '' + right.operator + '' + extractValuesFromExpressionWhile(right.right);
    else if (right.type === 'MemberExpression')
        return extractValuesFromExpressionWhile(right.object) + '[' + extractValuesFromExpressionWhile(right.property) + ']';
    else if (right.type === 'UnaryExpression')
        return right.operator + '' + extractValuesFromExpressionWhile(right.argument);
}

function checkTypeWhile(right) {
    if (right.type === 'Literal')
        return right.value.toString();
    else if (right.type === 'Identifier'){
        if(checkIfExistInMap(mapOfVarsTemp , right.name)){
            return retCorrectValue(right.name , mapOfVarsTemp);
        }
        else{
            return right.name;
        }
    }
}

function addToMap(name , value) {
    let isExist = false;
    for (let element of mapOfVars) {
        if(element.name === name){
            element.value = value;
            isExist = true;
        }
    }
    if(isExist === false){
        mapOfVars.push({name: name , value: value});
    }
}

function addToMapTemp(name , value) {
    let isExist = false;
    for (let element of mapOfVarsTemp) {
        if(element.name === name){
            element.value = value;
            isExist = true;
        }
    }
    if(isExist === false){
        mapOfVarsTemp.push({name: name , value: value});
    }
}

function copyMapToTemp(){
    mapOfVarsTemp = [];
    for (let element of mapOfVars){
        mapOfVarsTemp.push({name: element.name ,value: element.value});
    }
}