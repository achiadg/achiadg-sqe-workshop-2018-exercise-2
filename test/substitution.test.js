/* eslint-disable max-lines-per-function */

import {parseCode} from '../src/js/code-analyzer';
import {createElementsResult} from '../src/js/parser';
import {substitution , evalStatements,getChangesInLines} from '../src/js/substitutor';
import {parseArgs} from '../src/js/params';
import {processEvaluation} from '../src/js/evaluationIf';
import assert from 'assert';

describe('Check substitution without function', () => {
    it('simple declaration with value', () => {
        let codeToParse = 'let a = x + 1;\n' +
            'let b = a + y;\n' +
            'let c = 0;' ;
        let argsValues = '';
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode,argsValues);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let stringWithBackslash = '';
        for(let str of stringToEval){
            if(str.charAt(str.length-1) !== '\n'){
                str = str + '\n';
            }
            stringWithBackslash = stringWithBackslash + str;
        }
        assert.deepEqual(
            stringWithBackslash,
            'let a = x+1;\n' +
            'let b = x+1+y;\n' +
            'let c = 0;\n'
        );
    });
});

describe('Check substitution without function', () => {
    it('simple no indexes to colorize', () => {
        let codeToParse = 'let a = x + 1;\n' +
            'let b = a + y;\n' +
            'let c = 0;' ;
        let argsValues = '';
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode,argsValues);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let indexesToColor = processEvaluation(stringToEval,argsValues,evaluation);
        assert.deepEqual(
            indexesToColor, []
        );
    });
});

describe('Check substitution with function', () => {
    it('simple function no globals', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        c = c + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else if (b < z * 2) {\n' +
            '        c = c + x + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '        return x + y + z + c;\n' +
            '    }\n' +
            '}\n';
        let argsValues = '';
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode,argsValues);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let stringWithBackslash = '';
        for(let str of stringToEval){
            if(str.charAt(str.length-1) !== '\n'){
                str = str + '\n';
            }
            stringWithBackslash = stringWithBackslash + str;
        }
        assert.deepEqual(
            stringWithBackslash,
            'function foo(x, y, z){\n' +
            '    if (x+1+y<z) {\n' +
            '        return x+y+z+5;\n' +
            '    } else if (x+1+y<z*2) {\n' +
            '        return x+y+z+x+5;\n' +
            '    } else {\n' +
            '        return x+y+z+z+5;\n' +
            '    }\n' +
            '}\n'
        );
    });
});

describe('Check substitution with function', () => {
    it('simple function no globals check indexes', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        c = c + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else if (b < z * 2) {\n' +
            '        c = c + x + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '        return x + y + z + c;\n' +
            '    }\n' +
            '}\n';
        let argsValues = parseArgs('1,2,3');
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode,argsValues);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let indexesToColor = processEvaluation(stringToEval,argsValues,evaluation);
        assert.deepEqual(indexesToColor , [{color:'red',index:1},{color:'green',index:3}]);
    });
});

describe('Check substitution with function', () => {
    it('simple function no globals while statement', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    while (a < z) {\n' +
            '        c = a + b;\n' +
            '        z = c * 2;\n' +
            '    }\n' +
            '    \n' +
            '    return z;\n' +
            '}\n';
        let argsValues = parseArgs('true,2,[1,2,3]');
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode,argsValues);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let stringWithBackslash = '';
        for(let str of stringToEval){
            if(str.charAt(str.length-1) !== '\n'){
                str = str + '\n';
            }
            stringWithBackslash = stringWithBackslash + str;
        }
        assert.deepEqual(
            stringWithBackslash,
            'function foo(x, y, z){\n' +
            '    while (x+1<z) {\n' +
            '        z = x+1+x+1+y*2;\n' +
            '    }\n' +
            '    return z;\n' +
            '}\n'
        );
    });
});

describe('Check substitution with function', () => {
    it('simple function no globals while statement with indexes', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    while (a < z) {\n' +
            '        c = a + b;\n' +
            '        z = c * 2;\n' +
            '    }\n' +
            '    \n' +
            '    return z;\n' +
            '}\n';
        let argsValues = parseArgs('1,2,3');
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode,argsValues);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let indexesToColor = processEvaluation(stringToEval,argsValues,evaluation);
        assert.deepEqual(indexesToColor , []);
    });
});

describe('Check substitution with function', () => {
    it('simple function no globals no while no if', () => {
        let codeToParse = 'function test(){\n' +
            '  let ret = 5;\n' +
            '  ret = ret + 5;\n' +
            '\n' +
            '  return ret;\n' +
            '\n' +
            '}\n';
        let argsValues = parseArgs('true,2,[1,2,3]');
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode,argsValues);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let stringWithBackslash = '';
        for(let str of stringToEval){
            if(str.charAt(str.length-1) !== '\n'){
                str = str + '\n';
            }
            stringWithBackslash = stringWithBackslash + str;
        }
        assert.deepEqual(
            stringWithBackslash,
            'function test(){\n' +
            '  return 5+5;\n' +
            '}\n'
        );
    });
});

describe('Check substitution with function', () => {
    it('simple function no globals no while no if with indexes', () => {
        let codeToParse = 'function test(){\n' +
            '  let ret = 5;\n' +
            '  ret = ret + 5;\n' +
            '\n' +
            '  return ret;\n' +
            '\n' +
            '}';
        let argsValues = parseArgs('1,2,3');
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode,argsValues);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let indexesToColor = processEvaluation(stringToEval,argsValues,evaluation);
        assert.deepEqual(indexesToColor , []);
    });
});

describe('Check substitution with function', () => {
    it('simple function with globals if statement', () => {
        let codeToParse = 'let a = 17;\n' +
            'let b = 23;\n' +
            'let c = 12;\n' +
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        c = c + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else if (b < z * 2) {\n' +
            '        c = c + x + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '        return x + y + z + c;\n' +
            '    }\n' +
            '}\n';
        let argsValues = parseArgs('1,2,3');
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode,argsValues);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let stringWithBackslash = '';
        for(let str of stringToEval){
            if(str.charAt(str.length-1) !== '\n'){
                str = str + '\n';
            }
            stringWithBackslash = stringWithBackslash + str;
        }
        assert.deepEqual(
            stringWithBackslash,
            'let a = 17;\n' +
            'let b = 23;\n' +
            'let c = 12;\n' +
            'function foo(x, y, z){\n' +
            '    if (x+1+y<z) {\n' +
            '        return x+y+z+5;\n' +
            '    } else if (x+1+y<z*2) {\n' +
            '        return x+y+z+x+5;\n' +
            '    } else {\n' +
            '        return x+y+z+z+5;\n' +
            '    }\n' +
            '}\n'
        );
    });
});

describe('Check substitution with function', () => {
    it('simple function with globals if statement with indexes', () => {
        let codeToParse = 'let a = 17;\n' +
            'let b = 23;\n' +
            'let c = 12;\n' +
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        c = c + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else if (b < z * 2) {\n' +
            '        c = c + x + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '        return x + y + z + c;\n' +
            '    }\n' +
            '}\n';
        let argsValues = parseArgs('1,2,3');
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode,argsValues);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let indexesToColor = processEvaluation(stringToEval,argsValues,evaluation);
        assert.deepEqual(indexesToColor , [{color:'red',index:4},{color:'green',index:6}]);
    });
});

describe('Check substitution with function', () => {
    it('simple function with globals if statement globals after and before include arrays', () => {
        let codeToParse = 'let a = [1,2,3];\n' +
            'let b = 12;\n' +
            'let c = 17;\n' +
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        c = c + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else if (b < z * 2) {\n' +
            '        c = c + x + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '        return x + y + z + c;\n' +
            '    }\n' +
            '}\n' +
            '\n' +
            'let d = [true,5,[2,4]];\n';
        let argsValues = parseArgs('1,2,3');
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode,argsValues);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let stringWithBackslash = '';
        for(let str of stringToEval){
            if(str.charAt(str.length-1) !== '\n'){
                str = str + '\n';
            }
            stringWithBackslash = stringWithBackslash + str;
        }
        assert.deepEqual(
            stringWithBackslash,
            'let a = [1,2,3];\n' +
            'let b = 12;\n' +
            'let c = 17;\n' +
            'function foo(x, y, z){\n' +
            '    if (x+1+y<z) {\n' +
            '        return x+y+z+5;\n' +
            '    } else if (x+1+y<z*2) {\n' +
            '        return x+y+z+x+5;\n' +
            '    } else {\n' +
            '        return x+y+z+z+5;\n' +
            '    }\n' +
            '}\n' +
            'let d = [true,5,[2,4]];\n'
        );
    });
});

describe('Check substitution with function', () => {
    it('simple function with globals if statement globals after and before include arrays with indexes', () => {
        let codeToParse = 'let a = [1,2,3];\n' +
            'let b = 12;\n' +
            'let c = 17;\n' +
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        c = c + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else if (b < z * 2) {\n' +
            '        c = c + x + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '        return x + y + z + c;\n' +
            '    }\n' +
            '}\n' +
            '\n' +
            'let d = [true,5,[2,4]];\n';
        let argsValues = parseArgs('1,2,3');
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode,argsValues);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let indexesToColor = processEvaluation(stringToEval,argsValues,evaluation);
        assert.deepEqual(indexesToColor , [{color:'red',index:4},{color:'green',index:6}]);
    });
});

describe('Check substitution with function', () => {
    it('simple function with globals if statement globals include globals inside', () => {
        let codeToParse = 'let a = [1,2,3];\n' +
            'let b = 12;\n' +
            'let c = 17;\n' +
            'let d = 32;\n' +
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        c = c + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '        return x + y + z + d;\n' +
            '    }\n' +
            '}\n' +
            '\n' +
            'let d = [true,5,[2,4]];\n';
        let argsValues = parseArgs('1,2,3');
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode,argsValues);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let stringWithBackslash = '';
        for(let str of stringToEval){
            if(str.charAt(str.length-1) !== '\n'){
                str = str + '\n';
            }
            stringWithBackslash = stringWithBackslash + str;
        }
        assert.deepEqual(
            stringWithBackslash,
            'let a = [1,2,3];\n' +
            'let b = 12;\n' +
            'let c = 17;\n' +
            'let d = 32;\n' +
            'function foo(x, y, z){\n' +
            '    if (x+1+y<z) {\n' +
            '        return x+y+z+5;\n' +
            '    } else {\n' +
            '        return x+y+z+32;\n' +
            '    }\n' +
            '}\n' +
            'let d = [true,5,[2,4]];\n'
        );
    });
});

describe('Check substitution with function', () => {
    it('simple function with globals if statement globals include globals inside with indexes', () => {
        let codeToParse = 'let a = [1,2,3];\n' +
            'let b = 12;\n' +
            'let c = 17;\n' +
            'let d = 32;\n' +
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        c = c + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '        return x + y + z + d;\n' +
            '    }\n' +
            '}\n' +
            '\n' +
            'let d = [true,5,[2,4]];\n';
        let argsValues = parseArgs('1,2,3');
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode,argsValues);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let indexesToColor = processEvaluation(stringToEval,argsValues,evaluation);
        assert.deepEqual(indexesToColor , [{color:'red',index:5}]);
    });
});

describe('Check substitution with function', () => {
    it('simple function with globals if statement globals include globals inside condition', () => {
        let codeToParse = 'let a = [1,2,3];\n' +
            'let b = 12;\n' +
            'let c = 17;\n' +
            'let d = 32;\n' +
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < d) {\n' +
            '        c = c + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '        return x + y + z + d;\n' +
            '    }\n' +
            '}\n' +
            '\n' +
            'let d = [true,5,[2,4]];\n';
        let argsValues = parseArgs('1,2,3');
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode,argsValues);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let stringWithBackslash = '';
        for(let str of stringToEval){
            if(str.charAt(str.length-1) !== '\n'){
                str = str + '\n';
            }
            stringWithBackslash = stringWithBackslash + str;
        }
        assert.deepEqual(
            stringWithBackslash,
            'let a = [1,2,3];\n' +
            'let b = 12;\n' +
            'let c = 17;\n' +
            'let d = 32;\n' +
            'function foo(x, y, z){\n' +
            '    if (x+1+y<32) {\n' +
            '        return x+y+z+5;\n' +
            '    } else {\n' +
            '        return x+y+z+32;\n' +
            '    }\n' +
            '}\n' +
            'let d = [true,5,[2,4]];\n'
        );
    });
});

describe('Check substitution with function', () => {
    it('simple function with globals if statement globals include globals in if inside with indexes', () => {
        let codeToParse = 'let a = [1,2,3];\n' +
            'let b = 12;\n' +
            'let c = 17;\n' +
            'let d = 32;\n' +
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < d) {\n' +
            '        c = c + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '        return x + y + z + d;\n' +
            '    }\n' +
            '}\n' +
            '\n' +
            'let d = [true,5,[2,4]];\n';
        let argsValues = parseArgs('1,2,3');
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode,argsValues);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let indexesToColor = processEvaluation(stringToEval,argsValues,evaluation);
        assert.deepEqual(indexesToColor , [{color:'green',index:5}]);
    });
});

describe('Check substitution with function', () => {
    it('while statement inside function with let and return inside while', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    while (a < z) {\n' +
            '        c = a + b;\n' +
            '        z = c * 2;\n' +
            '        let a = 7;\n' +
            '        return a + z;\n' +
            '    }\n' +
            '    \n' +
            '    return z;\n' +
            '}\n';
        let argsValues = parseArgs('1,2,3');
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode,argsValues);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let stringWithBackslash = '';
        for(let str of stringToEval){
            if(str.charAt(str.length-1) !== '\n'){
                str = str + '\n';
            }
            stringWithBackslash = stringWithBackslash + str;
        }
        assert.deepEqual(
            stringWithBackslash,
            'function foo(x, y, z){\n' +
            '    while (x+1<z) {\n' +
            '        z = x+1+x+1+y*2;\n' +
            '        return 7+x+1+x+1+y*2;\n' +
            '    }\n' +
            '    return z;\n' +
            '}\n'
        );
    });
});

describe('Check substitution with function', () => {
    it('simple function with globals if statement globals include globals in if inside with indexes', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    while (a < z) {\n' +
            '        c = a + b;\n' +
            '        z = c * 2;\n' +
            '        let a = 7;\n' +
            '        return a + z;\n' +
            '    }\n' +
            '    \n' +
            '    return z;\n' +
            '}\n';
        let argsValues = parseArgs('1,2,3');
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode,argsValues);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let indexesToColor = processEvaluation(stringToEval,argsValues,evaluation);
        assert.deepEqual(indexesToColor , []);
    });
});

describe('Check substitution with function', () => {
    it('while statement inside function with if inside while', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    while (a < z) {\n' +
            '        c = a + b;\n' +
            '        if(c==0){\n' +
            '          return a+b;\n' +
            '        }else if(c<0){\n' +
            '          return a+c;\n' +
            '        }\n' +
            '        z = c * 2;\n' +
            '    }\n' +
            '    \n' +
            '    return z;\n' +
            '}\n';
        let argsValues = parseArgs('1,2,3');
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode,argsValues);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let stringWithBackslash = '';
        for(let str of stringToEval){
            if(str.charAt(str.length-1) !== '\n'){
                str = str + '\n';
            }
            stringWithBackslash = stringWithBackslash + str;
        }
        assert.deepEqual(
            stringWithBackslash,
            'function foo(x, y, z){\n' +
            '    while (x+1<z) {\n' +
            '        if(x+1+x+1+y==0){\n' +
            '          return x+1+x+1+y;\n' +
            '        }else if(0<0){\n' +
            '          return x+1;\n' +
            '        }\n' +
            '        z = 2;\n' +
            '    }\n' +
            '    return z;\n' +
            '}\n'
        );
    });
});

describe('Check substitution with function', () => {
    it('while statement inside function with if inside while with indexes', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    while (a < z) {\n' +
            '        c = a + b;\n' +
            '        if(c==0){\n' +
            '          return a+b;\n' +
            '        }else if(c<0){\n' +
            '          return a+c;\n' +
            '        }\n' +
            '        z = c * 2;\n' +
            '    }\n' +
            '    \n' +
            '    return z;\n' +
            '}\n';
        let argsValues = parseArgs('1,2,3');
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode,argsValues);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let indexesToColor = processEvaluation(stringToEval,argsValues,evaluation);
        assert.deepEqual(indexesToColor , [{color:'red',index:2},{color:'red',index:4}]);
    });
});

describe('Check substitution with function', () => {
    it('if statement inside function with while inside if', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        c = c + 5;\n' +
            '        while(z < 7){\n' +
            '          let c = 8;\n' +
            '          z = c;\n' +
            '        }\n' +
            '        return x + y + z + c;\n' +
            '    } else if (b < z * 2) {\n' +
            '        c = c + x + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '        return x + y + z + c;\n' +
            '    }\n' +
            '}\n';
        let argsValues = parseArgs('1,2,3');
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode,argsValues);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let stringWithBackslash = '';
        for(let str of stringToEval){
            if(str.charAt(str.length-1) !== '\n'){
                str = str + '\n';
            }
            stringWithBackslash = stringWithBackslash + str;
        }
        assert.deepEqual(
            stringWithBackslash,
            'function foo(x, y, z){\n' +
            '    if (x+1+y<z) {\n' +
            '        while(z<7){\n' +
            '          z = 8;\n' +
            '        }\n' +
            '        return x+y+8+8;\n' +
            '    } else if (x+1+y<z*2) {\n' +
            '        return x+y+z+x+5;\n' +
            '    } else {\n' +
            '        return x+y+z+z+5;\n' +
            '    }\n' +
            '}\n'
        );
    });
});

describe('Check substitution with function', () => {
    it('while statement inside function with if inside while with indexes', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        c = c + 5;\n' +
            '        while(z < 7){\n' +
            '          let c = 8;\n' +
            '          z = c;\n' +
            '        }\n' +
            '        return x + y + z + c;\n' +
            '    } else if (b < z * 2) {\n' +
            '        c = c + x + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '        return x + y + z + c;\n' +
            '    }\n' +
            '}\n';
        let argsValues = parseArgs('1,2,10');
        let parsedCode = parseCode(codeToParse);
        let elements = createElementsResult(parsedCode,argsValues);
        let evaluation = evalStatements(elements);
        let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
        let stringToEval = substitution(evaluation,linesWithChangesFromElements);
        let indexesToColor = processEvaluation(stringToEval,argsValues,evaluation);
        assert.deepEqual(indexesToColor , [{color:'green',index:1},{color:'green',index:6}]);
    });

    describe('Check substitution with function', () => {
        it('complex test', () => {
            let codeToParse = 'let a = 17;\n' +
                'let b = [1,2,3];\n' +
                'function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    z = 9;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '        while(z<10){\n' +
                '           c = 8;\n' +
                '           z = c;\n' +
                '        }\n' +
                '        return x + y + z + c;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '}\n' +
                '\n' +
                '\n' +
                'let f = r;\n';
            let argsValues = parseArgs('1,2,3');
            let parsedCode = parseCode(codeToParse);
            let elements = createElementsResult(parsedCode,argsValues);
            let evaluation = evalStatements(elements);
            let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
            let stringToEval = substitution(evaluation,linesWithChangesFromElements);
            let stringWithBackslash = '';
            for(let str of stringToEval){
                if(str.charAt(str.length-1) !== '\n'){
                    str = str + '\n';
                }
                stringWithBackslash = stringWithBackslash + str;
            }
            assert.deepEqual(
                stringWithBackslash,
                'let a = 17;\n' +
                'let b = [1,2,3];\n' +
                'function foo(x, y, z){\n' +
                '    z = 9;\n' +
                '    if (x+1+y<9) {\n' +
                '        while(9<10){\n' +
                '           z = 8;\n' +
                '        }\n' +
                '        return x+y+8+8;\n' +
                '    } else if (x+1+y<9*2) {\n' +
                '        return x+y+9+x+5;\n' +
                '    } else {\n' +
                '        return x+y+9+9+5;\n' +
                '    }\n' +
                '}\n' +
                'let f = r;\n'
            );
        });
    });

    describe('Check substitution with function', () => {
        it('complex test with indexes', () => {
            let codeToParse = 'let a = 17;\n' +
                'let b = [1,2,3];\n' +
                'function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    z = 9;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '        while(z<10){\n' +
                '           c = 8;\n' +
                '           z = c;\n' +
                '        }\n' +
                '        return x + y + z + c;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '}\n' +
                '\n' +
                '\n' +
                'let f = r;\n';
            let argsValues = parseArgs('1,2,10');
            let parsedCode = parseCode(codeToParse);
            let elements = createElementsResult(parsedCode,argsValues);
            let evaluation = evalStatements(elements);
            let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
            let stringToEval = substitution(evaluation,linesWithChangesFromElements);
            let indexesToColor = processEvaluation(stringToEval,argsValues,evaluation);
            assert.deepEqual(indexesToColor , [{color:'green',index:4},{color:'green',index:9}]);
        });
    });

    describe('Check substitution with function', () => {
        it('complex test with indexes 2', () => {
            let codeToParse = 'function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = true;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (!b) {\n' +
                '        c = c + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else if (!b) {\n' +
                '        c = c + x + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '}\n';
            let argsValues = parseArgs('1,2,10');
            let parsedCode = parseCode(codeToParse);
            let elements = createElementsResult(parsedCode,argsValues);
            let evaluation = evalStatements(elements);
            let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
            let stringToEval = substitution(evaluation,linesWithChangesFromElements);
            let indexesToColor = processEvaluation(stringToEval,argsValues,evaluation);
            assert.deepEqual(indexesToColor , [{color:'red',index:1},{color:'red',index:3}]);
        });
    });

    describe('Check substitution with function', () => {
        it('complex test with indexes 3', () => {
            let codeToParse = 'function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = true;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (z) {\n' +
                '        c = c + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else if (!b) {\n' +
                '        c = c + x + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '}\n';
            let argsValues = parseArgs('1,2,[1,2]');
            let parsedCode = parseCode(codeToParse);
            let elements = createElementsResult(parsedCode,argsValues);
            let evaluation = evalStatements(elements);
            let linesWithChangesFromElements = getChangesInLines(codeToParse,evaluation);
            let stringToEval = substitution(evaluation,linesWithChangesFromElements);
            let indexesToColor = processEvaluation(stringToEval,argsValues,evaluation);
            assert.deepEqual(indexesToColor , [{color:'green',index:1},{color:'red',index:3}]);
        });
    });
});