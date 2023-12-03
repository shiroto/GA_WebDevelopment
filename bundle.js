(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var callBind = require('./');

var $indexOf = callBind(GetIntrinsic('String.prototype.indexOf'));

module.exports = function callBoundIntrinsic(name, allowMissing) {
	var intrinsic = GetIntrinsic(name, !!allowMissing);
	if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
		return callBind(intrinsic);
	}
	return intrinsic;
};

},{"./":3,"get-intrinsic":7}],3:[function(require,module,exports){
'use strict';

var bind = require('function-bind');
var GetIntrinsic = require('get-intrinsic');
var setFunctionLength = require('set-function-length');

var $TypeError = GetIntrinsic('%TypeError%');
var $apply = GetIntrinsic('%Function.prototype.apply%');
var $call = GetIntrinsic('%Function.prototype.call%');
var $reflectApply = GetIntrinsic('%Reflect.apply%', true) || bind.call($call, $apply);

var $defineProperty = GetIntrinsic('%Object.defineProperty%', true);
var $max = GetIntrinsic('%Math.max%');

if ($defineProperty) {
	try {
		$defineProperty({}, 'a', { value: 1 });
	} catch (e) {
		// IE 8 has a broken defineProperty
		$defineProperty = null;
	}
}

module.exports = function callBind(originalFunction) {
	if (typeof originalFunction !== 'function') {
		throw new $TypeError('a function is required');
	}
	var func = $reflectApply(bind, $call, arguments);
	return setFunctionLength(
		func,
		1 + $max(0, originalFunction.length - (arguments.length - 1)),
		true
	);
};

var applyBind = function applyBind() {
	return $reflectApply(bind, $apply, arguments);
};

if ($defineProperty) {
	$defineProperty(module.exports, 'apply', { value: applyBind });
} else {
	module.exports.apply = applyBind;
}

},{"function-bind":6,"get-intrinsic":7,"set-function-length":21}],4:[function(require,module,exports){
'use strict';

var hasPropertyDescriptors = require('has-property-descriptors')();

var GetIntrinsic = require('get-intrinsic');

var $defineProperty = hasPropertyDescriptors && GetIntrinsic('%Object.defineProperty%', true);
if ($defineProperty) {
	try {
		$defineProperty({}, 'a', { value: 1 });
	} catch (e) {
		// IE 8 has a broken defineProperty
		$defineProperty = false;
	}
}

var $SyntaxError = GetIntrinsic('%SyntaxError%');
var $TypeError = GetIntrinsic('%TypeError%');

var gopd = require('gopd');

/** @type {(obj: Record<PropertyKey, unknown>, property: PropertyKey, value: unknown, nonEnumerable?: boolean | null, nonWritable?: boolean | null, nonConfigurable?: boolean | null, loose?: boolean) => void} */
module.exports = function defineDataProperty(
	obj,
	property,
	value
) {
	if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) {
		throw new $TypeError('`obj` must be an object or a function`');
	}
	if (typeof property !== 'string' && typeof property !== 'symbol') {
		throw new $TypeError('`property` must be a string or a symbol`');
	}
	if (arguments.length > 3 && typeof arguments[3] !== 'boolean' && arguments[3] !== null) {
		throw new $TypeError('`nonEnumerable`, if provided, must be a boolean or null');
	}
	if (arguments.length > 4 && typeof arguments[4] !== 'boolean' && arguments[4] !== null) {
		throw new $TypeError('`nonWritable`, if provided, must be a boolean or null');
	}
	if (arguments.length > 5 && typeof arguments[5] !== 'boolean' && arguments[5] !== null) {
		throw new $TypeError('`nonConfigurable`, if provided, must be a boolean or null');
	}
	if (arguments.length > 6 && typeof arguments[6] !== 'boolean') {
		throw new $TypeError('`loose`, if provided, must be a boolean');
	}

	var nonEnumerable = arguments.length > 3 ? arguments[3] : null;
	var nonWritable = arguments.length > 4 ? arguments[4] : null;
	var nonConfigurable = arguments.length > 5 ? arguments[5] : null;
	var loose = arguments.length > 6 ? arguments[6] : false;

	/* @type {false | TypedPropertyDescriptor<unknown>} */
	var desc = !!gopd && gopd(obj, property);

	if ($defineProperty) {
		$defineProperty(obj, property, {
			configurable: nonConfigurable === null && desc ? desc.configurable : !nonConfigurable,
			enumerable: nonEnumerable === null && desc ? desc.enumerable : !nonEnumerable,
			value: value,
			writable: nonWritable === null && desc ? desc.writable : !nonWritable
		});
	} else if (loose || (!nonEnumerable && !nonWritable && !nonConfigurable)) {
		// must fall back to [[Set]], and was not explicitly asked to make non-enumerable, non-writable, or non-configurable
		obj[property] = value; // eslint-disable-line no-param-reassign
	} else {
		throw new $SyntaxError('This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.');
	}
};

},{"get-intrinsic":7,"gopd":8,"has-property-descriptors":9}],5:[function(require,module,exports){
'use strict';

/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var toStr = Object.prototype.toString;
var max = Math.max;
var funcType = '[object Function]';

var concatty = function concatty(a, b) {
    var arr = [];

    for (var i = 0; i < a.length; i += 1) {
        arr[i] = a[i];
    }
    for (var j = 0; j < b.length; j += 1) {
        arr[j + a.length] = b[j];
    }

    return arr;
};

var slicy = function slicy(arrLike, offset) {
    var arr = [];
    for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
        arr[j] = arrLike[i];
    }
    return arr;
};

var joiny = function (arr, joiner) {
    var str = '';
    for (var i = 0; i < arr.length; i += 1) {
        str += arr[i];
        if (i + 1 < arr.length) {
            str += joiner;
        }
    }
    return str;
};

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.apply(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slicy(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                concatty(args, arguments)
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        }
        return target.apply(
            that,
            concatty(args, arguments)
        );

    };

    var boundLength = max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs[i] = '$' + i;
    }

    bound = Function('binder', 'return function (' + joiny(boundArgs, ',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

},{}],6:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

module.exports = Function.prototype.bind || implementation;

},{"./implementation":5}],7:[function(require,module,exports){
'use strict';

var undefined;

var $SyntaxError = SyntaxError;
var $Function = Function;
var $TypeError = TypeError;

// eslint-disable-next-line consistent-return
var getEvalledConstructor = function (expressionSyntax) {
	try {
		return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
	} catch (e) {}
};

var $gOPD = Object.getOwnPropertyDescriptor;
if ($gOPD) {
	try {
		$gOPD({}, '');
	} catch (e) {
		$gOPD = null; // this is IE 8, which has a broken gOPD
	}
}

var throwTypeError = function () {
	throw new $TypeError();
};
var ThrowTypeError = $gOPD
	? (function () {
		try {
			// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
			arguments.callee; // IE 8 does not throw here
			return throwTypeError;
		} catch (calleeThrows) {
			try {
				// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
				return $gOPD(arguments, 'callee').get;
			} catch (gOPDthrows) {
				return throwTypeError;
			}
		}
	}())
	: throwTypeError;

var hasSymbols = require('has-symbols')();
var hasProto = require('has-proto')();

var getProto = Object.getPrototypeOf || (
	hasProto
		? function (x) { return x.__proto__; } // eslint-disable-line no-proto
		: null
);

var needsEval = {};

var TypedArray = typeof Uint8Array === 'undefined' || !getProto ? undefined : getProto(Uint8Array);

var INTRINSICS = {
	'%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
	'%Array%': Array,
	'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
	'%ArrayIteratorPrototype%': hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined,
	'%AsyncFromSyncIteratorPrototype%': undefined,
	'%AsyncFunction%': needsEval,
	'%AsyncGenerator%': needsEval,
	'%AsyncGeneratorFunction%': needsEval,
	'%AsyncIteratorPrototype%': needsEval,
	'%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
	'%BigInt%': typeof BigInt === 'undefined' ? undefined : BigInt,
	'%BigInt64Array%': typeof BigInt64Array === 'undefined' ? undefined : BigInt64Array,
	'%BigUint64Array%': typeof BigUint64Array === 'undefined' ? undefined : BigUint64Array,
	'%Boolean%': Boolean,
	'%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
	'%Date%': Date,
	'%decodeURI%': decodeURI,
	'%decodeURIComponent%': decodeURIComponent,
	'%encodeURI%': encodeURI,
	'%encodeURIComponent%': encodeURIComponent,
	'%Error%': Error,
	'%eval%': eval, // eslint-disable-line no-eval
	'%EvalError%': EvalError,
	'%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
	'%Float64Array%': typeof Float64Array === 'undefined' ? undefined : Float64Array,
	'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined : FinalizationRegistry,
	'%Function%': $Function,
	'%GeneratorFunction%': needsEval,
	'%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
	'%Int16Array%': typeof Int16Array === 'undefined' ? undefined : Int16Array,
	'%Int32Array%': typeof Int32Array === 'undefined' ? undefined : Int32Array,
	'%isFinite%': isFinite,
	'%isNaN%': isNaN,
	'%IteratorPrototype%': hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined,
	'%JSON%': typeof JSON === 'object' ? JSON : undefined,
	'%Map%': typeof Map === 'undefined' ? undefined : Map,
	'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Map()[Symbol.iterator]()),
	'%Math%': Math,
	'%Number%': Number,
	'%Object%': Object,
	'%parseFloat%': parseFloat,
	'%parseInt%': parseInt,
	'%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
	'%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
	'%RangeError%': RangeError,
	'%ReferenceError%': ReferenceError,
	'%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
	'%RegExp%': RegExp,
	'%Set%': typeof Set === 'undefined' ? undefined : Set,
	'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Set()[Symbol.iterator]()),
	'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer,
	'%String%': String,
	'%StringIteratorPrototype%': hasSymbols && getProto ? getProto(''[Symbol.iterator]()) : undefined,
	'%Symbol%': hasSymbols ? Symbol : undefined,
	'%SyntaxError%': $SyntaxError,
	'%ThrowTypeError%': ThrowTypeError,
	'%TypedArray%': TypedArray,
	'%TypeError%': $TypeError,
	'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array,
	'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray,
	'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array,
	'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array,
	'%URIError%': URIError,
	'%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap,
	'%WeakRef%': typeof WeakRef === 'undefined' ? undefined : WeakRef,
	'%WeakSet%': typeof WeakSet === 'undefined' ? undefined : WeakSet
};

if (getProto) {
	try {
		null.error; // eslint-disable-line no-unused-expressions
	} catch (e) {
		// https://github.com/tc39/proposal-shadowrealm/pull/384#issuecomment-1364264229
		var errorProto = getProto(getProto(e));
		INTRINSICS['%Error.prototype%'] = errorProto;
	}
}

var doEval = function doEval(name) {
	var value;
	if (name === '%AsyncFunction%') {
		value = getEvalledConstructor('async function () {}');
	} else if (name === '%GeneratorFunction%') {
		value = getEvalledConstructor('function* () {}');
	} else if (name === '%AsyncGeneratorFunction%') {
		value = getEvalledConstructor('async function* () {}');
	} else if (name === '%AsyncGenerator%') {
		var fn = doEval('%AsyncGeneratorFunction%');
		if (fn) {
			value = fn.prototype;
		}
	} else if (name === '%AsyncIteratorPrototype%') {
		var gen = doEval('%AsyncGenerator%');
		if (gen && getProto) {
			value = getProto(gen.prototype);
		}
	}

	INTRINSICS[name] = value;

	return value;
};

var LEGACY_ALIASES = {
	'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
	'%ArrayPrototype%': ['Array', 'prototype'],
	'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
	'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
	'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
	'%ArrayProto_values%': ['Array', 'prototype', 'values'],
	'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
	'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
	'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
	'%BooleanPrototype%': ['Boolean', 'prototype'],
	'%DataViewPrototype%': ['DataView', 'prototype'],
	'%DatePrototype%': ['Date', 'prototype'],
	'%ErrorPrototype%': ['Error', 'prototype'],
	'%EvalErrorPrototype%': ['EvalError', 'prototype'],
	'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
	'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
	'%FunctionPrototype%': ['Function', 'prototype'],
	'%Generator%': ['GeneratorFunction', 'prototype'],
	'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
	'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
	'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
	'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
	'%JSONParse%': ['JSON', 'parse'],
	'%JSONStringify%': ['JSON', 'stringify'],
	'%MapPrototype%': ['Map', 'prototype'],
	'%NumberPrototype%': ['Number', 'prototype'],
	'%ObjectPrototype%': ['Object', 'prototype'],
	'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
	'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
	'%PromisePrototype%': ['Promise', 'prototype'],
	'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
	'%Promise_all%': ['Promise', 'all'],
	'%Promise_reject%': ['Promise', 'reject'],
	'%Promise_resolve%': ['Promise', 'resolve'],
	'%RangeErrorPrototype%': ['RangeError', 'prototype'],
	'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
	'%RegExpPrototype%': ['RegExp', 'prototype'],
	'%SetPrototype%': ['Set', 'prototype'],
	'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
	'%StringPrototype%': ['String', 'prototype'],
	'%SymbolPrototype%': ['Symbol', 'prototype'],
	'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
	'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
	'%TypeErrorPrototype%': ['TypeError', 'prototype'],
	'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
	'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
	'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
	'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
	'%URIErrorPrototype%': ['URIError', 'prototype'],
	'%WeakMapPrototype%': ['WeakMap', 'prototype'],
	'%WeakSetPrototype%': ['WeakSet', 'prototype']
};

var bind = require('function-bind');
var hasOwn = require('hasown');
var $concat = bind.call(Function.call, Array.prototype.concat);
var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
var $replace = bind.call(Function.call, String.prototype.replace);
var $strSlice = bind.call(Function.call, String.prototype.slice);
var $exec = bind.call(Function.call, RegExp.prototype.exec);

/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
var stringToPath = function stringToPath(string) {
	var first = $strSlice(string, 0, 1);
	var last = $strSlice(string, -1);
	if (first === '%' && last !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
	} else if (last === '%' && first !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
	}
	var result = [];
	$replace(string, rePropName, function (match, number, quote, subString) {
		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
	});
	return result;
};
/* end adaptation */

var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
	var intrinsicName = name;
	var alias;
	if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
		alias = LEGACY_ALIASES[intrinsicName];
		intrinsicName = '%' + alias[0] + '%';
	}

	if (hasOwn(INTRINSICS, intrinsicName)) {
		var value = INTRINSICS[intrinsicName];
		if (value === needsEval) {
			value = doEval(intrinsicName);
		}
		if (typeof value === 'undefined' && !allowMissing) {
			throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
		}

		return {
			alias: alias,
			name: intrinsicName,
			value: value
		};
	}

	throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};

module.exports = function GetIntrinsic(name, allowMissing) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new $TypeError('intrinsic name must be a non-empty string');
	}
	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
		throw new $TypeError('"allowMissing" argument must be a boolean');
	}

	if ($exec(/^%?[^%]*%?$/, name) === null) {
		throw new $SyntaxError('`%` may not be present anywhere but at the beginning and end of the intrinsic name');
	}
	var parts = stringToPath(name);
	var intrinsicBaseName = parts.length > 0 ? parts[0] : '';

	var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
	var intrinsicRealName = intrinsic.name;
	var value = intrinsic.value;
	var skipFurtherCaching = false;

	var alias = intrinsic.alias;
	if (alias) {
		intrinsicBaseName = alias[0];
		$spliceApply(parts, $concat([0, 1], alias));
	}

	for (var i = 1, isOwn = true; i < parts.length; i += 1) {
		var part = parts[i];
		var first = $strSlice(part, 0, 1);
		var last = $strSlice(part, -1);
		if (
			(
				(first === '"' || first === "'" || first === '`')
				|| (last === '"' || last === "'" || last === '`')
			)
			&& first !== last
		) {
			throw new $SyntaxError('property names with quotes must have matching quotes');
		}
		if (part === 'constructor' || !isOwn) {
			skipFurtherCaching = true;
		}

		intrinsicBaseName += '.' + part;
		intrinsicRealName = '%' + intrinsicBaseName + '%';

		if (hasOwn(INTRINSICS, intrinsicRealName)) {
			value = INTRINSICS[intrinsicRealName];
		} else if (value != null) {
			if (!(part in value)) {
				if (!allowMissing) {
					throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
				}
				return void undefined;
			}
			if ($gOPD && (i + 1) >= parts.length) {
				var desc = $gOPD(value, part);
				isOwn = !!desc;

				// By convention, when a data property is converted to an accessor
				// property to emulate a data property that does not suffer from
				// the override mistake, that accessor's getter is marked with
				// an `originalValue` property. Here, when we detect this, we
				// uphold the illusion by pretending to see that original data
				// property, i.e., returning the value rather than the getter
				// itself.
				if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
					value = desc.get;
				} else {
					value = value[part];
				}
			} else {
				isOwn = hasOwn(value, part);
				value = value[part];
			}

			if (isOwn && !skipFurtherCaching) {
				INTRINSICS[intrinsicRealName] = value;
			}
		}
	}
	return value;
};

},{"function-bind":6,"has-proto":10,"has-symbols":11,"hasown":13}],8:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true);

if ($gOPD) {
	try {
		$gOPD([], 'length');
	} catch (e) {
		// IE 8 has a broken gOPD
		$gOPD = null;
	}
}

module.exports = $gOPD;

},{"get-intrinsic":7}],9:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $defineProperty = GetIntrinsic('%Object.defineProperty%', true);

var hasPropertyDescriptors = function hasPropertyDescriptors() {
	if ($defineProperty) {
		try {
			$defineProperty({}, 'a', { value: 1 });
			return true;
		} catch (e) {
			// IE 8 has a broken defineProperty
			return false;
		}
	}
	return false;
};

hasPropertyDescriptors.hasArrayLengthDefineBug = function hasArrayLengthDefineBug() {
	// node v0.6 has a bug where array lengths can be Set but not Defined
	if (!hasPropertyDescriptors()) {
		return null;
	}
	try {
		return $defineProperty([], 'length', { value: 1 }).length !== 1;
	} catch (e) {
		// In Firefox 4-22, defining length on an array throws an exception.
		return true;
	}
};

module.exports = hasPropertyDescriptors;

},{"get-intrinsic":7}],10:[function(require,module,exports){
'use strict';

var test = {
	foo: {}
};

var $Object = Object;

module.exports = function hasProto() {
	return { __proto__: test }.foo === test.foo && !({ __proto__: null } instanceof $Object);
};

},{}],11:[function(require,module,exports){
'use strict';

var origSymbol = typeof Symbol !== 'undefined' && Symbol;
var hasSymbolSham = require('./shams');

module.exports = function hasNativeSymbols() {
	if (typeof origSymbol !== 'function') { return false; }
	if (typeof Symbol !== 'function') { return false; }
	if (typeof origSymbol('foo') !== 'symbol') { return false; }
	if (typeof Symbol('bar') !== 'symbol') { return false; }

	return hasSymbolSham();
};

},{"./shams":12}],12:[function(require,module,exports){
'use strict';

/* eslint complexity: [2, 18], max-statements: [2, 33] */
module.exports = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') { return false; }

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) { return false; } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) { return false; }

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
	}

	return true;
};

},{}],13:[function(require,module,exports){
'use strict';

var call = Function.prototype.call;
var $hasOwn = Object.prototype.hasOwnProperty;
var bind = require('function-bind');

/** @type {(o: {}, p: PropertyKey) => p is keyof o} */
module.exports = bind.call(call, $hasOwn);

},{"function-bind":6}],14:[function(require,module,exports){
(function (global){(function (){
var hasMap = typeof Map === 'function' && Map.prototype;
var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, 'size') : null;
var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === 'function' ? mapSizeDescriptor.get : null;
var mapForEach = hasMap && Map.prototype.forEach;
var hasSet = typeof Set === 'function' && Set.prototype;
var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, 'size') : null;
var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === 'function' ? setSizeDescriptor.get : null;
var setForEach = hasSet && Set.prototype.forEach;
var hasWeakMap = typeof WeakMap === 'function' && WeakMap.prototype;
var weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
var hasWeakSet = typeof WeakSet === 'function' && WeakSet.prototype;
var weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
var hasWeakRef = typeof WeakRef === 'function' && WeakRef.prototype;
var weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null;
var booleanValueOf = Boolean.prototype.valueOf;
var objectToString = Object.prototype.toString;
var functionToString = Function.prototype.toString;
var $match = String.prototype.match;
var $slice = String.prototype.slice;
var $replace = String.prototype.replace;
var $toUpperCase = String.prototype.toUpperCase;
var $toLowerCase = String.prototype.toLowerCase;
var $test = RegExp.prototype.test;
var $concat = Array.prototype.concat;
var $join = Array.prototype.join;
var $arrSlice = Array.prototype.slice;
var $floor = Math.floor;
var bigIntValueOf = typeof BigInt === 'function' ? BigInt.prototype.valueOf : null;
var gOPS = Object.getOwnPropertySymbols;
var symToString = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? Symbol.prototype.toString : null;
var hasShammedSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'object';
// ie, `has-tostringtag/shams
var toStringTag = typeof Symbol === 'function' && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? 'object' : 'symbol')
    ? Symbol.toStringTag
    : null;
var isEnumerable = Object.prototype.propertyIsEnumerable;

var gPO = (typeof Reflect === 'function' ? Reflect.getPrototypeOf : Object.getPrototypeOf) || (
    [].__proto__ === Array.prototype // eslint-disable-line no-proto
        ? function (O) {
            return O.__proto__; // eslint-disable-line no-proto
        }
        : null
);

function addNumericSeparator(num, str) {
    if (
        num === Infinity
        || num === -Infinity
        || num !== num
        || (num && num > -1000 && num < 1000)
        || $test.call(/e/, str)
    ) {
        return str;
    }
    var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
    if (typeof num === 'number') {
        var int = num < 0 ? -$floor(-num) : $floor(num); // trunc(num)
        if (int !== num) {
            var intStr = String(int);
            var dec = $slice.call(str, intStr.length + 1);
            return $replace.call(intStr, sepRegex, '$&_') + '.' + $replace.call($replace.call(dec, /([0-9]{3})/g, '$&_'), /_$/, '');
        }
    }
    return $replace.call(str, sepRegex, '$&_');
}

var utilInspect = require('./util.inspect');
var inspectCustom = utilInspect.custom;
var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;

module.exports = function inspect_(obj, options, depth, seen) {
    var opts = options || {};

    if (has(opts, 'quoteStyle') && (opts.quoteStyle !== 'single' && opts.quoteStyle !== 'double')) {
        throw new TypeError('option "quoteStyle" must be "single" or "double"');
    }
    if (
        has(opts, 'maxStringLength') && (typeof opts.maxStringLength === 'number'
            ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity
            : opts.maxStringLength !== null
        )
    ) {
        throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
    }
    var customInspect = has(opts, 'customInspect') ? opts.customInspect : true;
    if (typeof customInspect !== 'boolean' && customInspect !== 'symbol') {
        throw new TypeError('option "customInspect", if provided, must be `true`, `false`, or `\'symbol\'`');
    }

    if (
        has(opts, 'indent')
        && opts.indent !== null
        && opts.indent !== '\t'
        && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)
    ) {
        throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
    }
    if (has(opts, 'numericSeparator') && typeof opts.numericSeparator !== 'boolean') {
        throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
    }
    var numericSeparator = opts.numericSeparator;

    if (typeof obj === 'undefined') {
        return 'undefined';
    }
    if (obj === null) {
        return 'null';
    }
    if (typeof obj === 'boolean') {
        return obj ? 'true' : 'false';
    }

    if (typeof obj === 'string') {
        return inspectString(obj, opts);
    }
    if (typeof obj === 'number') {
        if (obj === 0) {
            return Infinity / obj > 0 ? '0' : '-0';
        }
        var str = String(obj);
        return numericSeparator ? addNumericSeparator(obj, str) : str;
    }
    if (typeof obj === 'bigint') {
        var bigIntStr = String(obj) + 'n';
        return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
    }

    var maxDepth = typeof opts.depth === 'undefined' ? 5 : opts.depth;
    if (typeof depth === 'undefined') { depth = 0; }
    if (depth >= maxDepth && maxDepth > 0 && typeof obj === 'object') {
        return isArray(obj) ? '[Array]' : '[Object]';
    }

    var indent = getIndent(opts, depth);

    if (typeof seen === 'undefined') {
        seen = [];
    } else if (indexOf(seen, obj) >= 0) {
        return '[Circular]';
    }

    function inspect(value, from, noIndent) {
        if (from) {
            seen = $arrSlice.call(seen);
            seen.push(from);
        }
        if (noIndent) {
            var newOpts = {
                depth: opts.depth
            };
            if (has(opts, 'quoteStyle')) {
                newOpts.quoteStyle = opts.quoteStyle;
            }
            return inspect_(value, newOpts, depth + 1, seen);
        }
        return inspect_(value, opts, depth + 1, seen);
    }

    if (typeof obj === 'function' && !isRegExp(obj)) { // in older engines, regexes are callable
        var name = nameOf(obj);
        var keys = arrObjKeys(obj, inspect);
        return '[Function' + (name ? ': ' + name : ' (anonymous)') + ']' + (keys.length > 0 ? ' { ' + $join.call(keys, ', ') + ' }' : '');
    }
    if (isSymbol(obj)) {
        var symString = hasShammedSymbols ? $replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, '$1') : symToString.call(obj);
        return typeof obj === 'object' && !hasShammedSymbols ? markBoxed(symString) : symString;
    }
    if (isElement(obj)) {
        var s = '<' + $toLowerCase.call(String(obj.nodeName));
        var attrs = obj.attributes || [];
        for (var i = 0; i < attrs.length; i++) {
            s += ' ' + attrs[i].name + '=' + wrapQuotes(quote(attrs[i].value), 'double', opts);
        }
        s += '>';
        if (obj.childNodes && obj.childNodes.length) { s += '...'; }
        s += '</' + $toLowerCase.call(String(obj.nodeName)) + '>';
        return s;
    }
    if (isArray(obj)) {
        if (obj.length === 0) { return '[]'; }
        var xs = arrObjKeys(obj, inspect);
        if (indent && !singleLineValues(xs)) {
            return '[' + indentedJoin(xs, indent) + ']';
        }
        return '[ ' + $join.call(xs, ', ') + ' ]';
    }
    if (isError(obj)) {
        var parts = arrObjKeys(obj, inspect);
        if (!('cause' in Error.prototype) && 'cause' in obj && !isEnumerable.call(obj, 'cause')) {
            return '{ [' + String(obj) + '] ' + $join.call($concat.call('[cause]: ' + inspect(obj.cause), parts), ', ') + ' }';
        }
        if (parts.length === 0) { return '[' + String(obj) + ']'; }
        return '{ [' + String(obj) + '] ' + $join.call(parts, ', ') + ' }';
    }
    if (typeof obj === 'object' && customInspect) {
        if (inspectSymbol && typeof obj[inspectSymbol] === 'function' && utilInspect) {
            return utilInspect(obj, { depth: maxDepth - depth });
        } else if (customInspect !== 'symbol' && typeof obj.inspect === 'function') {
            return obj.inspect();
        }
    }
    if (isMap(obj)) {
        var mapParts = [];
        if (mapForEach) {
            mapForEach.call(obj, function (value, key) {
                mapParts.push(inspect(key, obj, true) + ' => ' + inspect(value, obj));
            });
        }
        return collectionOf('Map', mapSize.call(obj), mapParts, indent);
    }
    if (isSet(obj)) {
        var setParts = [];
        if (setForEach) {
            setForEach.call(obj, function (value) {
                setParts.push(inspect(value, obj));
            });
        }
        return collectionOf('Set', setSize.call(obj), setParts, indent);
    }
    if (isWeakMap(obj)) {
        return weakCollectionOf('WeakMap');
    }
    if (isWeakSet(obj)) {
        return weakCollectionOf('WeakSet');
    }
    if (isWeakRef(obj)) {
        return weakCollectionOf('WeakRef');
    }
    if (isNumber(obj)) {
        return markBoxed(inspect(Number(obj)));
    }
    if (isBigInt(obj)) {
        return markBoxed(inspect(bigIntValueOf.call(obj)));
    }
    if (isBoolean(obj)) {
        return markBoxed(booleanValueOf.call(obj));
    }
    if (isString(obj)) {
        return markBoxed(inspect(String(obj)));
    }
    // note: in IE 8, sometimes `global !== window` but both are the prototypes of each other
    /* eslint-env browser */
    if (typeof window !== 'undefined' && obj === window) {
        return '{ [object Window] }';
    }
    if (obj === global) {
        return '{ [object globalThis] }';
    }
    if (!isDate(obj) && !isRegExp(obj)) {
        var ys = arrObjKeys(obj, inspect);
        var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
        var protoTag = obj instanceof Object ? '' : 'null prototype';
        var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? 'Object' : '';
        var constructorTag = isPlainObject || typeof obj.constructor !== 'function' ? '' : obj.constructor.name ? obj.constructor.name + ' ' : '';
        var tag = constructorTag + (stringTag || protoTag ? '[' + $join.call($concat.call([], stringTag || [], protoTag || []), ': ') + '] ' : '');
        if (ys.length === 0) { return tag + '{}'; }
        if (indent) {
            return tag + '{' + indentedJoin(ys, indent) + '}';
        }
        return tag + '{ ' + $join.call(ys, ', ') + ' }';
    }
    return String(obj);
};

function wrapQuotes(s, defaultStyle, opts) {
    var quoteChar = (opts.quoteStyle || defaultStyle) === 'double' ? '"' : "'";
    return quoteChar + s + quoteChar;
}

function quote(s) {
    return $replace.call(String(s), /"/g, '&quot;');
}

function isArray(obj) { return toStr(obj) === '[object Array]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isDate(obj) { return toStr(obj) === '[object Date]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isRegExp(obj) { return toStr(obj) === '[object RegExp]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isError(obj) { return toStr(obj) === '[object Error]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isString(obj) { return toStr(obj) === '[object String]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isNumber(obj) { return toStr(obj) === '[object Number]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isBoolean(obj) { return toStr(obj) === '[object Boolean]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }

// Symbol and BigInt do have Symbol.toStringTag by spec, so that can't be used to eliminate false positives
function isSymbol(obj) {
    if (hasShammedSymbols) {
        return obj && typeof obj === 'object' && obj instanceof Symbol;
    }
    if (typeof obj === 'symbol') {
        return true;
    }
    if (!obj || typeof obj !== 'object' || !symToString) {
        return false;
    }
    try {
        symToString.call(obj);
        return true;
    } catch (e) {}
    return false;
}

function isBigInt(obj) {
    if (!obj || typeof obj !== 'object' || !bigIntValueOf) {
        return false;
    }
    try {
        bigIntValueOf.call(obj);
        return true;
    } catch (e) {}
    return false;
}

var hasOwn = Object.prototype.hasOwnProperty || function (key) { return key in this; };
function has(obj, key) {
    return hasOwn.call(obj, key);
}

function toStr(obj) {
    return objectToString.call(obj);
}

function nameOf(f) {
    if (f.name) { return f.name; }
    var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
    if (m) { return m[1]; }
    return null;
}

function indexOf(xs, x) {
    if (xs.indexOf) { return xs.indexOf(x); }
    for (var i = 0, l = xs.length; i < l; i++) {
        if (xs[i] === x) { return i; }
    }
    return -1;
}

function isMap(x) {
    if (!mapSize || !x || typeof x !== 'object') {
        return false;
    }
    try {
        mapSize.call(x);
        try {
            setSize.call(x);
        } catch (s) {
            return true;
        }
        return x instanceof Map; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isWeakMap(x) {
    if (!weakMapHas || !x || typeof x !== 'object') {
        return false;
    }
    try {
        weakMapHas.call(x, weakMapHas);
        try {
            weakSetHas.call(x, weakSetHas);
        } catch (s) {
            return true;
        }
        return x instanceof WeakMap; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isWeakRef(x) {
    if (!weakRefDeref || !x || typeof x !== 'object') {
        return false;
    }
    try {
        weakRefDeref.call(x);
        return true;
    } catch (e) {}
    return false;
}

function isSet(x) {
    if (!setSize || !x || typeof x !== 'object') {
        return false;
    }
    try {
        setSize.call(x);
        try {
            mapSize.call(x);
        } catch (m) {
            return true;
        }
        return x instanceof Set; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isWeakSet(x) {
    if (!weakSetHas || !x || typeof x !== 'object') {
        return false;
    }
    try {
        weakSetHas.call(x, weakSetHas);
        try {
            weakMapHas.call(x, weakMapHas);
        } catch (s) {
            return true;
        }
        return x instanceof WeakSet; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isElement(x) {
    if (!x || typeof x !== 'object') { return false; }
    if (typeof HTMLElement !== 'undefined' && x instanceof HTMLElement) {
        return true;
    }
    return typeof x.nodeName === 'string' && typeof x.getAttribute === 'function';
}

function inspectString(str, opts) {
    if (str.length > opts.maxStringLength) {
        var remaining = str.length - opts.maxStringLength;
        var trailer = '... ' + remaining + ' more character' + (remaining > 1 ? 's' : '');
        return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
    }
    // eslint-disable-next-line no-control-regex
    var s = $replace.call($replace.call(str, /(['\\])/g, '\\$1'), /[\x00-\x1f]/g, lowbyte);
    return wrapQuotes(s, 'single', opts);
}

function lowbyte(c) {
    var n = c.charCodeAt(0);
    var x = {
        8: 'b',
        9: 't',
        10: 'n',
        12: 'f',
        13: 'r'
    }[n];
    if (x) { return '\\' + x; }
    return '\\x' + (n < 0x10 ? '0' : '') + $toUpperCase.call(n.toString(16));
}

function markBoxed(str) {
    return 'Object(' + str + ')';
}

function weakCollectionOf(type) {
    return type + ' { ? }';
}

function collectionOf(type, size, entries, indent) {
    var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ', ');
    return type + ' (' + size + ') {' + joinedEntries + '}';
}

function singleLineValues(xs) {
    for (var i = 0; i < xs.length; i++) {
        if (indexOf(xs[i], '\n') >= 0) {
            return false;
        }
    }
    return true;
}

function getIndent(opts, depth) {
    var baseIndent;
    if (opts.indent === '\t') {
        baseIndent = '\t';
    } else if (typeof opts.indent === 'number' && opts.indent > 0) {
        baseIndent = $join.call(Array(opts.indent + 1), ' ');
    } else {
        return null;
    }
    return {
        base: baseIndent,
        prev: $join.call(Array(depth + 1), baseIndent)
    };
}

function indentedJoin(xs, indent) {
    if (xs.length === 0) { return ''; }
    var lineJoiner = '\n' + indent.prev + indent.base;
    return lineJoiner + $join.call(xs, ',' + lineJoiner) + '\n' + indent.prev;
}

function arrObjKeys(obj, inspect) {
    var isArr = isArray(obj);
    var xs = [];
    if (isArr) {
        xs.length = obj.length;
        for (var i = 0; i < obj.length; i++) {
            xs[i] = has(obj, i) ? inspect(obj[i], obj) : '';
        }
    }
    var syms = typeof gOPS === 'function' ? gOPS(obj) : [];
    var symMap;
    if (hasShammedSymbols) {
        symMap = {};
        for (var k = 0; k < syms.length; k++) {
            symMap['$' + syms[k]] = syms[k];
        }
    }

    for (var key in obj) { // eslint-disable-line no-restricted-syntax
        if (!has(obj, key)) { continue; } // eslint-disable-line no-restricted-syntax, no-continue
        if (isArr && String(Number(key)) === key && key < obj.length) { continue; } // eslint-disable-line no-restricted-syntax, no-continue
        if (hasShammedSymbols && symMap['$' + key] instanceof Symbol) {
            // this is to prevent shammed Symbols, which are stored as strings, from being included in the string key section
            continue; // eslint-disable-line no-restricted-syntax, no-continue
        } else if ($test.call(/[^\w$]/, key)) {
            xs.push(inspect(key, obj) + ': ' + inspect(obj[key], obj));
        } else {
            xs.push(key + ': ' + inspect(obj[key], obj));
        }
    }
    if (typeof gOPS === 'function') {
        for (var j = 0; j < syms.length; j++) {
            if (isEnumerable.call(obj, syms[j])) {
                xs.push('[' + inspect(syms[j]) + ']: ' + inspect(obj[syms[j]], obj));
            }
        }
    }
    return xs;
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./util.inspect":1}],15:[function(require,module,exports){
(function (global){(function (){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],16:[function(require,module,exports){
'use strict';

var replace = String.prototype.replace;
var percentTwenties = /%20/g;

var Format = {
    RFC1738: 'RFC1738',
    RFC3986: 'RFC3986'
};

module.exports = {
    'default': Format.RFC3986,
    formatters: {
        RFC1738: function (value) {
            return replace.call(value, percentTwenties, '+');
        },
        RFC3986: function (value) {
            return String(value);
        }
    },
    RFC1738: Format.RFC1738,
    RFC3986: Format.RFC3986
};

},{}],17:[function(require,module,exports){
'use strict';

var stringify = require('./stringify');
var parse = require('./parse');
var formats = require('./formats');

module.exports = {
    formats: formats,
    parse: parse,
    stringify: stringify
};

},{"./formats":16,"./parse":18,"./stringify":19}],18:[function(require,module,exports){
'use strict';

var utils = require('./utils');

var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;

var defaults = {
    allowDots: false,
    allowPrototypes: false,
    allowSparse: false,
    arrayLimit: 20,
    charset: 'utf-8',
    charsetSentinel: false,
    comma: false,
    decoder: utils.decode,
    delimiter: '&',
    depth: 5,
    ignoreQueryPrefix: false,
    interpretNumericEntities: false,
    parameterLimit: 1000,
    parseArrays: true,
    plainObjects: false,
    strictNullHandling: false
};

var interpretNumericEntities = function (str) {
    return str.replace(/&#(\d+);/g, function ($0, numberStr) {
        return String.fromCharCode(parseInt(numberStr, 10));
    });
};

var parseArrayValue = function (val, options) {
    if (val && typeof val === 'string' && options.comma && val.indexOf(',') > -1) {
        return val.split(',');
    }

    return val;
};

// This is what browsers will submit when the ✓ character occurs in an
// application/x-www-form-urlencoded body and the encoding of the page containing
// the form is iso-8859-1, or when the submitted form has an accept-charset
// attribute of iso-8859-1. Presumably also with other charsets that do not contain
// the ✓ character, such as us-ascii.
var isoSentinel = 'utf8=%26%2310003%3B'; // encodeURIComponent('&#10003;')

// These are the percent-encoded utf-8 octets representing a checkmark, indicating that the request actually is utf-8 encoded.
var charsetSentinel = 'utf8=%E2%9C%93'; // encodeURIComponent('✓')

var parseValues = function parseQueryStringValues(str, options) {
    var obj = { __proto__: null };

    var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
    var limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
    var parts = cleanStr.split(options.delimiter, limit);
    var skipIndex = -1; // Keep track of where the utf8 sentinel was found
    var i;

    var charset = options.charset;
    if (options.charsetSentinel) {
        for (i = 0; i < parts.length; ++i) {
            if (parts[i].indexOf('utf8=') === 0) {
                if (parts[i] === charsetSentinel) {
                    charset = 'utf-8';
                } else if (parts[i] === isoSentinel) {
                    charset = 'iso-8859-1';
                }
                skipIndex = i;
                i = parts.length; // The eslint settings do not allow break;
            }
        }
    }

    for (i = 0; i < parts.length; ++i) {
        if (i === skipIndex) {
            continue;
        }
        var part = parts[i];

        var bracketEqualsPos = part.indexOf(']=');
        var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;

        var key, val;
        if (pos === -1) {
            key = options.decoder(part, defaults.decoder, charset, 'key');
            val = options.strictNullHandling ? null : '';
        } else {
            key = options.decoder(part.slice(0, pos), defaults.decoder, charset, 'key');
            val = utils.maybeMap(
                parseArrayValue(part.slice(pos + 1), options),
                function (encodedVal) {
                    return options.decoder(encodedVal, defaults.decoder, charset, 'value');
                }
            );
        }

        if (val && options.interpretNumericEntities && charset === 'iso-8859-1') {
            val = interpretNumericEntities(val);
        }

        if (part.indexOf('[]=') > -1) {
            val = isArray(val) ? [val] : val;
        }

        if (has.call(obj, key)) {
            obj[key] = utils.combine(obj[key], val);
        } else {
            obj[key] = val;
        }
    }

    return obj;
};

var parseObject = function (chain, val, options, valuesParsed) {
    var leaf = valuesParsed ? val : parseArrayValue(val, options);

    for (var i = chain.length - 1; i >= 0; --i) {
        var obj;
        var root = chain[i];

        if (root === '[]' && options.parseArrays) {
            obj = [].concat(leaf);
        } else {
            obj = options.plainObjects ? Object.create(null) : {};
            var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
            var index = parseInt(cleanRoot, 10);
            if (!options.parseArrays && cleanRoot === '') {
                obj = { 0: leaf };
            } else if (
                !isNaN(index)
                && root !== cleanRoot
                && String(index) === cleanRoot
                && index >= 0
                && (options.parseArrays && index <= options.arrayLimit)
            ) {
                obj = [];
                obj[index] = leaf;
            } else if (cleanRoot !== '__proto__') {
                obj[cleanRoot] = leaf;
            }
        }

        leaf = obj;
    }

    return leaf;
};

var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
    if (!givenKey) {
        return;
    }

    // Transform dot notation to bracket notation
    var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;

    // The regex chunks

    var brackets = /(\[[^[\]]*])/;
    var child = /(\[[^[\]]*])/g;

    // Get the parent

    var segment = options.depth > 0 && brackets.exec(key);
    var parent = segment ? key.slice(0, segment.index) : key;

    // Stash the parent if it exists

    var keys = [];
    if (parent) {
        // If we aren't using plain objects, optionally prefix keys that would overwrite object prototype properties
        if (!options.plainObjects && has.call(Object.prototype, parent)) {
            if (!options.allowPrototypes) {
                return;
            }
        }

        keys.push(parent);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while (options.depth > 0 && (segment = child.exec(key)) !== null && i < options.depth) {
        i += 1;
        if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
            if (!options.allowPrototypes) {
                return;
            }
        }
        keys.push(segment[1]);
    }

    // If there's a remainder, just add whatever is left

    if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return parseObject(keys, val, options, valuesParsed);
};

var normalizeParseOptions = function normalizeParseOptions(opts) {
    if (!opts) {
        return defaults;
    }

    if (opts.decoder !== null && opts.decoder !== undefined && typeof opts.decoder !== 'function') {
        throw new TypeError('Decoder has to be a function.');
    }

    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }
    var charset = typeof opts.charset === 'undefined' ? defaults.charset : opts.charset;

    return {
        allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
        allowPrototypes: typeof opts.allowPrototypes === 'boolean' ? opts.allowPrototypes : defaults.allowPrototypes,
        allowSparse: typeof opts.allowSparse === 'boolean' ? opts.allowSparse : defaults.allowSparse,
        arrayLimit: typeof opts.arrayLimit === 'number' ? opts.arrayLimit : defaults.arrayLimit,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        comma: typeof opts.comma === 'boolean' ? opts.comma : defaults.comma,
        decoder: typeof opts.decoder === 'function' ? opts.decoder : defaults.decoder,
        delimiter: typeof opts.delimiter === 'string' || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
        // eslint-disable-next-line no-implicit-coercion, no-extra-parens
        depth: (typeof opts.depth === 'number' || opts.depth === false) ? +opts.depth : defaults.depth,
        ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
        interpretNumericEntities: typeof opts.interpretNumericEntities === 'boolean' ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
        parameterLimit: typeof opts.parameterLimit === 'number' ? opts.parameterLimit : defaults.parameterLimit,
        parseArrays: opts.parseArrays !== false,
        plainObjects: typeof opts.plainObjects === 'boolean' ? opts.plainObjects : defaults.plainObjects,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
    };
};

module.exports = function (str, opts) {
    var options = normalizeParseOptions(opts);

    if (str === '' || str === null || typeof str === 'undefined') {
        return options.plainObjects ? Object.create(null) : {};
    }

    var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
    var obj = options.plainObjects ? Object.create(null) : {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var newObj = parseKeys(key, tempObj[key], options, typeof str === 'string');
        obj = utils.merge(obj, newObj, options);
    }

    if (options.allowSparse === true) {
        return obj;
    }

    return utils.compact(obj);
};

},{"./utils":20}],19:[function(require,module,exports){
'use strict';

var getSideChannel = require('side-channel');
var utils = require('./utils');
var formats = require('./formats');
var has = Object.prototype.hasOwnProperty;

var arrayPrefixGenerators = {
    brackets: function brackets(prefix) {
        return prefix + '[]';
    },
    comma: 'comma',
    indices: function indices(prefix, key) {
        return prefix + '[' + key + ']';
    },
    repeat: function repeat(prefix) {
        return prefix;
    }
};

var isArray = Array.isArray;
var push = Array.prototype.push;
var pushToArray = function (arr, valueOrArray) {
    push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray]);
};

var toISO = Date.prototype.toISOString;

var defaultFormat = formats['default'];
var defaults = {
    addQueryPrefix: false,
    allowDots: false,
    charset: 'utf-8',
    charsetSentinel: false,
    delimiter: '&',
    encode: true,
    encoder: utils.encode,
    encodeValuesOnly: false,
    format: defaultFormat,
    formatter: formats.formatters[defaultFormat],
    // deprecated
    indices: false,
    serializeDate: function serializeDate(date) {
        return toISO.call(date);
    },
    skipNulls: false,
    strictNullHandling: false
};

var isNonNullishPrimitive = function isNonNullishPrimitive(v) {
    return typeof v === 'string'
        || typeof v === 'number'
        || typeof v === 'boolean'
        || typeof v === 'symbol'
        || typeof v === 'bigint';
};

var sentinel = {};

var stringify = function stringify(
    object,
    prefix,
    generateArrayPrefix,
    commaRoundTrip,
    strictNullHandling,
    skipNulls,
    encoder,
    filter,
    sort,
    allowDots,
    serializeDate,
    format,
    formatter,
    encodeValuesOnly,
    charset,
    sideChannel
) {
    var obj = object;

    var tmpSc = sideChannel;
    var step = 0;
    var findFlag = false;
    while ((tmpSc = tmpSc.get(sentinel)) !== void undefined && !findFlag) {
        // Where object last appeared in the ref tree
        var pos = tmpSc.get(object);
        step += 1;
        if (typeof pos !== 'undefined') {
            if (pos === step) {
                throw new RangeError('Cyclic object value');
            } else {
                findFlag = true; // Break while
            }
        }
        if (typeof tmpSc.get(sentinel) === 'undefined') {
            step = 0;
        }
    }

    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    } else if (obj instanceof Date) {
        obj = serializeDate(obj);
    } else if (generateArrayPrefix === 'comma' && isArray(obj)) {
        obj = utils.maybeMap(obj, function (value) {
            if (value instanceof Date) {
                return serializeDate(value);
            }
            return value;
        });
    }

    if (obj === null) {
        if (strictNullHandling) {
            return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset, 'key', format) : prefix;
        }

        obj = '';
    }

    if (isNonNullishPrimitive(obj) || utils.isBuffer(obj)) {
        if (encoder) {
            var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, 'key', format);
            return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder, charset, 'value', format))];
        }
        return [formatter(prefix) + '=' + formatter(String(obj))];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys;
    if (generateArrayPrefix === 'comma' && isArray(obj)) {
        // we need to join elements in
        if (encodeValuesOnly && encoder) {
            obj = utils.maybeMap(obj, encoder);
        }
        objKeys = [{ value: obj.length > 0 ? obj.join(',') || null : void undefined }];
    } else if (isArray(filter)) {
        objKeys = filter;
    } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }

    var adjustedPrefix = commaRoundTrip && isArray(obj) && obj.length === 1 ? prefix + '[]' : prefix;

    for (var j = 0; j < objKeys.length; ++j) {
        var key = objKeys[j];
        var value = typeof key === 'object' && typeof key.value !== 'undefined' ? key.value : obj[key];

        if (skipNulls && value === null) {
            continue;
        }

        var keyPrefix = isArray(obj)
            ? typeof generateArrayPrefix === 'function' ? generateArrayPrefix(adjustedPrefix, key) : adjustedPrefix
            : adjustedPrefix + (allowDots ? '.' + key : '[' + key + ']');

        sideChannel.set(object, step);
        var valueSideChannel = getSideChannel();
        valueSideChannel.set(sentinel, sideChannel);
        pushToArray(values, stringify(
            value,
            keyPrefix,
            generateArrayPrefix,
            commaRoundTrip,
            strictNullHandling,
            skipNulls,
            generateArrayPrefix === 'comma' && encodeValuesOnly && isArray(obj) ? null : encoder,
            filter,
            sort,
            allowDots,
            serializeDate,
            format,
            formatter,
            encodeValuesOnly,
            charset,
            valueSideChannel
        ));
    }

    return values;
};

var normalizeStringifyOptions = function normalizeStringifyOptions(opts) {
    if (!opts) {
        return defaults;
    }

    if (opts.encoder !== null && typeof opts.encoder !== 'undefined' && typeof opts.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }

    var charset = opts.charset || defaults.charset;
    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }

    var format = formats['default'];
    if (typeof opts.format !== 'undefined') {
        if (!has.call(formats.formatters, opts.format)) {
            throw new TypeError('Unknown format option provided.');
        }
        format = opts.format;
    }
    var formatter = formats.formatters[format];

    var filter = defaults.filter;
    if (typeof opts.filter === 'function' || isArray(opts.filter)) {
        filter = opts.filter;
    }

    return {
        addQueryPrefix: typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults.addQueryPrefix,
        allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        delimiter: typeof opts.delimiter === 'undefined' ? defaults.delimiter : opts.delimiter,
        encode: typeof opts.encode === 'boolean' ? opts.encode : defaults.encode,
        encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults.encoder,
        encodeValuesOnly: typeof opts.encodeValuesOnly === 'boolean' ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
        filter: filter,
        format: format,
        formatter: formatter,
        serializeDate: typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults.serializeDate,
        skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults.skipNulls,
        sort: typeof opts.sort === 'function' ? opts.sort : null,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
    };
};

module.exports = function (object, opts) {
    var obj = object;
    var options = normalizeStringifyOptions(opts);

    var objKeys;
    var filter;

    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
    }

    var keys = [];

    if (typeof obj !== 'object' || obj === null) {
        return '';
    }

    var arrayFormat;
    if (opts && opts.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = opts.arrayFormat;
    } else if (opts && 'indices' in opts) {
        arrayFormat = opts.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = 'indices';
    }

    var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];
    if (opts && 'commaRoundTrip' in opts && typeof opts.commaRoundTrip !== 'boolean') {
        throw new TypeError('`commaRoundTrip` must be a boolean, or absent');
    }
    var commaRoundTrip = generateArrayPrefix === 'comma' && opts && opts.commaRoundTrip;

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (options.sort) {
        objKeys.sort(options.sort);
    }

    var sideChannel = getSideChannel();
    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (options.skipNulls && obj[key] === null) {
            continue;
        }
        pushToArray(keys, stringify(
            obj[key],
            key,
            generateArrayPrefix,
            commaRoundTrip,
            options.strictNullHandling,
            options.skipNulls,
            options.encode ? options.encoder : null,
            options.filter,
            options.sort,
            options.allowDots,
            options.serializeDate,
            options.format,
            options.formatter,
            options.encodeValuesOnly,
            options.charset,
            sideChannel
        ));
    }

    var joined = keys.join(options.delimiter);
    var prefix = options.addQueryPrefix === true ? '?' : '';

    if (options.charsetSentinel) {
        if (options.charset === 'iso-8859-1') {
            // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
            prefix += 'utf8=%26%2310003%3B&';
        } else {
            // encodeURIComponent('✓')
            prefix += 'utf8=%E2%9C%93&';
        }
    }

    return joined.length > 0 ? prefix + joined : '';
};

},{"./formats":16,"./utils":20,"side-channel":22}],20:[function(require,module,exports){
'use strict';

var formats = require('./formats');

var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;

var hexTable = (function () {
    var array = [];
    for (var i = 0; i < 256; ++i) {
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }

    return array;
}());

var compactQueue = function compactQueue(queue) {
    while (queue.length > 1) {
        var item = queue.pop();
        var obj = item.obj[item.prop];

        if (isArray(obj)) {
            var compacted = [];

            for (var j = 0; j < obj.length; ++j) {
                if (typeof obj[j] !== 'undefined') {
                    compacted.push(obj[j]);
                }
            }

            item.obj[item.prop] = compacted;
        }
    }
};

var arrayToObject = function arrayToObject(source, options) {
    var obj = options && options.plainObjects ? Object.create(null) : {};
    for (var i = 0; i < source.length; ++i) {
        if (typeof source[i] !== 'undefined') {
            obj[i] = source[i];
        }
    }

    return obj;
};

var merge = function merge(target, source, options) {
    /* eslint no-param-reassign: 0 */
    if (!source) {
        return target;
    }

    if (typeof source !== 'object') {
        if (isArray(target)) {
            target.push(source);
        } else if (target && typeof target === 'object') {
            if ((options && (options.plainObjects || options.allowPrototypes)) || !has.call(Object.prototype, source)) {
                target[source] = true;
            }
        } else {
            return [target, source];
        }

        return target;
    }

    if (!target || typeof target !== 'object') {
        return [target].concat(source);
    }

    var mergeTarget = target;
    if (isArray(target) && !isArray(source)) {
        mergeTarget = arrayToObject(target, options);
    }

    if (isArray(target) && isArray(source)) {
        source.forEach(function (item, i) {
            if (has.call(target, i)) {
                var targetItem = target[i];
                if (targetItem && typeof targetItem === 'object' && item && typeof item === 'object') {
                    target[i] = merge(targetItem, item, options);
                } else {
                    target.push(item);
                }
            } else {
                target[i] = item;
            }
        });
        return target;
    }

    return Object.keys(source).reduce(function (acc, key) {
        var value = source[key];

        if (has.call(acc, key)) {
            acc[key] = merge(acc[key], value, options);
        } else {
            acc[key] = value;
        }
        return acc;
    }, mergeTarget);
};

var assign = function assignSingleSource(target, source) {
    return Object.keys(source).reduce(function (acc, key) {
        acc[key] = source[key];
        return acc;
    }, target);
};

var decode = function (str, decoder, charset) {
    var strWithoutPlus = str.replace(/\+/g, ' ');
    if (charset === 'iso-8859-1') {
        // unescape never throws, no try...catch needed:
        return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
    }
    // utf-8
    try {
        return decodeURIComponent(strWithoutPlus);
    } catch (e) {
        return strWithoutPlus;
    }
};

var encode = function encode(str, defaultEncoder, charset, kind, format) {
    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }

    var string = str;
    if (typeof str === 'symbol') {
        string = Symbol.prototype.toString.call(str);
    } else if (typeof str !== 'string') {
        string = String(str);
    }

    if (charset === 'iso-8859-1') {
        return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
            return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
        });
    }

    var out = '';
    for (var i = 0; i < string.length; ++i) {
        var c = string.charCodeAt(i);

        if (
            c === 0x2D // -
            || c === 0x2E // .
            || c === 0x5F // _
            || c === 0x7E // ~
            || (c >= 0x30 && c <= 0x39) // 0-9
            || (c >= 0x41 && c <= 0x5A) // a-z
            || (c >= 0x61 && c <= 0x7A) // A-Z
            || (format === formats.RFC1738 && (c === 0x28 || c === 0x29)) // ( )
        ) {
            out += string.charAt(i);
            continue;
        }

        if (c < 0x80) {
            out = out + hexTable[c];
            continue;
        }

        if (c < 0x800) {
            out = out + (hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        if (c < 0xD800 || c >= 0xE000) {
            out = out + (hexTable[0xE0 | (c >> 12)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        i += 1;
        c = 0x10000 + (((c & 0x3FF) << 10) | (string.charCodeAt(i) & 0x3FF));
        /* eslint operator-linebreak: [2, "before"] */
        out += hexTable[0xF0 | (c >> 18)]
            + hexTable[0x80 | ((c >> 12) & 0x3F)]
            + hexTable[0x80 | ((c >> 6) & 0x3F)]
            + hexTable[0x80 | (c & 0x3F)];
    }

    return out;
};

var compact = function compact(value) {
    var queue = [{ obj: { o: value }, prop: 'o' }];
    var refs = [];

    for (var i = 0; i < queue.length; ++i) {
        var item = queue[i];
        var obj = item.obj[item.prop];

        var keys = Object.keys(obj);
        for (var j = 0; j < keys.length; ++j) {
            var key = keys[j];
            var val = obj[key];
            if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
                queue.push({ obj: obj, prop: key });
                refs.push(val);
            }
        }
    }

    compactQueue(queue);

    return value;
};

var isRegExp = function isRegExp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

var isBuffer = function isBuffer(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }

    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};

var combine = function combine(a, b) {
    return [].concat(a, b);
};

var maybeMap = function maybeMap(val, fn) {
    if (isArray(val)) {
        var mapped = [];
        for (var i = 0; i < val.length; i += 1) {
            mapped.push(fn(val[i]));
        }
        return mapped;
    }
    return fn(val);
};

module.exports = {
    arrayToObject: arrayToObject,
    assign: assign,
    combine: combine,
    compact: compact,
    decode: decode,
    encode: encode,
    isBuffer: isBuffer,
    isRegExp: isRegExp,
    maybeMap: maybeMap,
    merge: merge
};

},{"./formats":16}],21:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');
var define = require('define-data-property');
var hasDescriptors = require('has-property-descriptors')();
var gOPD = require('gopd');

var $TypeError = GetIntrinsic('%TypeError%');
var $floor = GetIntrinsic('%Math.floor%');

module.exports = function setFunctionLength(fn, length) {
	if (typeof fn !== 'function') {
		throw new $TypeError('`fn` is not a function');
	}
	if (typeof length !== 'number' || length < 0 || length > 0xFFFFFFFF || $floor(length) !== length) {
		throw new $TypeError('`length` must be a positive 32-bit integer');
	}

	var loose = arguments.length > 2 && !!arguments[2];

	var functionLengthIsConfigurable = true;
	var functionLengthIsWritable = true;
	if ('length' in fn && gOPD) {
		var desc = gOPD(fn, 'length');
		if (desc && !desc.configurable) {
			functionLengthIsConfigurable = false;
		}
		if (desc && !desc.writable) {
			functionLengthIsWritable = false;
		}
	}

	if (functionLengthIsConfigurable || functionLengthIsWritable || !loose) {
		if (hasDescriptors) {
			define(fn, 'length', length, true, true);
		} else {
			define(fn, 'length', length);
		}
	}
	return fn;
};

},{"define-data-property":4,"get-intrinsic":7,"gopd":8,"has-property-descriptors":9}],22:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');
var callBound = require('call-bind/callBound');
var inspect = require('object-inspect');

var $TypeError = GetIntrinsic('%TypeError%');
var $WeakMap = GetIntrinsic('%WeakMap%', true);
var $Map = GetIntrinsic('%Map%', true);

var $weakMapGet = callBound('WeakMap.prototype.get', true);
var $weakMapSet = callBound('WeakMap.prototype.set', true);
var $weakMapHas = callBound('WeakMap.prototype.has', true);
var $mapGet = callBound('Map.prototype.get', true);
var $mapSet = callBound('Map.prototype.set', true);
var $mapHas = callBound('Map.prototype.has', true);

/*
 * This function traverses the list returning the node corresponding to the
 * given key.
 *
 * That node is also moved to the head of the list, so that if it's accessed
 * again we don't need to traverse the whole list. By doing so, all the recently
 * used nodes can be accessed relatively quickly.
 */
var listGetNode = function (list, key) { // eslint-disable-line consistent-return
	for (var prev = list, curr; (curr = prev.next) !== null; prev = curr) {
		if (curr.key === key) {
			prev.next = curr.next;
			curr.next = list.next;
			list.next = curr; // eslint-disable-line no-param-reassign
			return curr;
		}
	}
};

var listGet = function (objects, key) {
	var node = listGetNode(objects, key);
	return node && node.value;
};
var listSet = function (objects, key, value) {
	var node = listGetNode(objects, key);
	if (node) {
		node.value = value;
	} else {
		// Prepend the new node to the beginning of the list
		objects.next = { // eslint-disable-line no-param-reassign
			key: key,
			next: objects.next,
			value: value
		};
	}
};
var listHas = function (objects, key) {
	return !!listGetNode(objects, key);
};

module.exports = function getSideChannel() {
	var $wm;
	var $m;
	var $o;
	var channel = {
		assert: function (key) {
			if (!channel.has(key)) {
				throw new $TypeError('Side channel does not contain ' + inspect(key));
			}
		},
		get: function (key) { // eslint-disable-line consistent-return
			if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
				if ($wm) {
					return $weakMapGet($wm, key);
				}
			} else if ($Map) {
				if ($m) {
					return $mapGet($m, key);
				}
			} else {
				if ($o) { // eslint-disable-line no-lonely-if
					return listGet($o, key);
				}
			}
		},
		has: function (key) {
			if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
				if ($wm) {
					return $weakMapHas($wm, key);
				}
			} else if ($Map) {
				if ($m) {
					return $mapHas($m, key);
				}
			} else {
				if ($o) { // eslint-disable-line no-lonely-if
					return listHas($o, key);
				}
			}
			return false;
		},
		set: function (key, value) {
			if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
				if (!$wm) {
					$wm = new $WeakMap();
				}
				$weakMapSet($wm, key, value);
			} else if ($Map) {
				if (!$m) {
					$m = new $Map();
				}
				$mapSet($m, key, value);
			} else {
				if (!$o) {
					/*
					 * Initialize the linked list as an empty node, so that we don't have
					 * to special-case handling of the first node: we can always refer to
					 * it as (previous node).next, instead of something like (list).head
					 */
					$o = { key: {}, next: null };
				}
				listSet($o, key, value);
			}
		}
	};
	return channel;
};

},{"call-bind/callBound":2,"get-intrinsic":7,"object-inspect":14}],23:[function(require,module,exports){
/*
 * Copyright Joyent, Inc. and other Node contributors.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
 * NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

'use strict';

var punycode = require('punycode');

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

/*
 * define these here so at least they only have to be
 * compiled once on the first module load.
 */
var protocolPattern = /^([a-z0-9.+-]+:)/i,
  portPattern = /:[0-9]*$/,

  // Special case for a simple path URL
  simplePathPattern = /^(\/\/?(?!\/)[^?\s]*)(\?[^\s]*)?$/,

  /*
   * RFC 2396: characters reserved for delimiting URLs.
   * We actually just auto-escape these.
   */
  delims = [
    '<', '>', '"', '`', ' ', '\r', '\n', '\t'
  ],

  // RFC 2396: characters not allowed for various reasons.
  unwise = [
    '{', '}', '|', '\\', '^', '`'
  ].concat(delims),

  // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
  autoEscape = ['\''].concat(unwise),
  /*
   * Characters that are never ever allowed in a hostname.
   * Note that any invalid chars are also handled, but these
   * are the ones that are *expected* to be seen, so we fast-path
   * them.
   */
  nonHostChars = [
    '%', '/', '?', ';', '#'
  ].concat(autoEscape),
  hostEndingChars = [
    '/', '?', '#'
  ],
  hostnameMaxLen = 255,
  hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
  hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
  // protocols that can allow "unsafe" and "unwise" chars.
  unsafeProtocol = {
    javascript: true,
    'javascript:': true
  },
  // protocols that never have a hostname.
  hostlessProtocol = {
    javascript: true,
    'javascript:': true
  },
  // protocols that always contain a // bit.
  slashedProtocol = {
    http: true,
    https: true,
    ftp: true,
    gopher: true,
    file: true,
    'http:': true,
    'https:': true,
    'ftp:': true,
    'gopher:': true,
    'file:': true
  },
  querystring = require('qs');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && typeof url === 'object' && url instanceof Url) { return url; }

  var u = new Url();
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function (url, parseQueryString, slashesDenoteHost) {
  if (typeof url !== 'string') {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  /*
   * Copy chrome, IE, opera backslash-handling behavior.
   * Back slashes before the query string get converted to forward slashes
   * See: https://code.google.com/p/chromium/issues/detail?id=25916
   */
  var queryIndex = url.indexOf('?'),
    splitter = queryIndex !== -1 && queryIndex < url.indexOf('#') ? '?' : '#',
    uSplit = url.split(splitter),
    slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  /*
   * trim before proceeding.
   * This is to support parse stuff like "  http://foo.com  \n"
   */
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  /*
   * figure out if it's got a host
   * user@server is *always* interpreted as a hostname, and url
   * resolution will treat //foo/bar as host=foo,path=bar because that's
   * how the browser resolves relative URLs.
   */
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@/]+@[^@/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] && (slashes || (proto && !slashedProtocol[proto]))) {

    /*
     * there's a hostname.
     * the first instance of /, ?, ;, or # ends the host.
     *
     * If there is an @ in the hostname, then non-host chars *are* allowed
     * to the left of the last @ sign, unless some host-ending character
     * comes *before* the @-sign.
     * URLs are obnoxious.
     *
     * ex:
     * http://a@b@c/ => user:a@b host:c
     * http://a@b?@c => user:a host:c path:/?@c
     */

    /*
     * v0.12 TODO(isaacs): This is not quite how Chrome does things.
     * Review our test case against browsers more comprehensively.
     */

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) { hostEnd = hec; }
    }

    /*
     * at this point, either we have an explicit point where the
     * auth portion cannot go past, or the last @ char is the decider.
     */
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      /*
       * atSign must be in auth portion.
       * http://a@b/c@d => host:b auth:a path:/c@d
       */
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    /*
     * Now we have a portion which is definitely the auth.
     * Pull that off.
     */
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) { hostEnd = hec; }
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1) { hostEnd = rest.length; }

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    /*
     * we've indicated that there is a hostname,
     * so even if it's empty, it has to be present.
     */
    this.hostname = this.hostname || '';

    /*
     * if hostname begins with [ and ends with ]
     * assume that it's an IPv6 address.
     */
    var ipv6Hostname = this.hostname[0] === '[' && this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) { continue; }
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              /*
               * we replace non-ASCII char with a temporary placeholder
               * we need this to make sure size of hostname is not
               * broken by replacing non-ASCII by nothing
               */
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      /*
       * IDNA Support: Returns a punycoded representation of "domain".
       * It only converts parts of the domain name that
       * have non-ASCII characters, i.e. it doesn't matter if
       * you call it with a domain that already is ASCII-only.
       */
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    /*
     * strip [ and ] from the hostname
     * the host field still retains them, though
     */
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  /*
   * now rest is set to the post-host stuff.
   * chop off any delim chars.
   */
  if (!unsafeProtocol[lowerProto]) {

    /*
     * First, make 100% sure that any "autoEscape" chars get
     * escaped, even if encodeURIComponent doesn't think they
     * need to be.
     */
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1) { continue; }
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }

  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) { this.pathname = rest; }
  if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  // to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  /*
   * ensure it's an object, and not a string url.
   * If it's an obj, this is a no-op.
   * this way, you can call url_format() on strings
   * to clean up potentially wonky urls.
   */
  if (typeof obj === 'string') { obj = urlParse(obj); }
  if (!(obj instanceof Url)) { return Url.prototype.format.call(obj); }
  return obj.format();
}

Url.prototype.format = function () {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
    pathname = this.pathname || '',
    hash = this.hash || '',
    host = false,
    query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ? this.hostname : '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query && typeof this.query === 'object' && Object.keys(this.query).length) {
    query = querystring.stringify(this.query, {
      arrayFormat: 'repeat',
      addQueryPrefix: false
    });
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') { protocol += ':'; }

  /*
   * only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
   * unless they had them to begin with.
   */
  if (this.slashes || (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') { pathname = '/' + pathname; }
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') { hash = '#' + hash; }
  if (search && search.charAt(0) !== '?') { search = '?' + search; }

  pathname = pathname.replace(/[?#]/g, function (match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function (relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) { return relative; }
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function (relative) {
  if (typeof relative === 'string') {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  /*
   * hash is always overridden, no matter what.
   * even href="" will remove it.
   */
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol') { result[rkey] = relative[rkey]; }
    }

    // urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] && result.hostname && !result.pathname) {
      result.pathname = '/';
      result.path = result.pathname;
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    /*
     * if it's a known url protocol, then changing
     * the protocol does weird things
     * first, if it's not file:, then we MUST have a host,
     * and if there was a path
     * to begin with, then we MUST have a path.
     * if it is file:, then the host is dropped,
     * because that's known to be hostless.
     * anything else is assumed to be absolute.
     */
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift())) { }
      if (!relative.host) { relative.host = ''; }
      if (!relative.hostname) { relative.hostname = ''; }
      if (relPath[0] !== '') { relPath.unshift(''); }
      if (relPath.length < 2) { relPath.unshift(''); }
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = result.pathname && result.pathname.charAt(0) === '/',
    isRelAbs = relative.host || relative.pathname && relative.pathname.charAt(0) === '/',
    mustEndAbs = isRelAbs || isSourceAbs || (result.host && relative.pathname),
    removeAllDots = mustEndAbs,
    srcPath = result.pathname && result.pathname.split('/') || [],
    relPath = relative.pathname && relative.pathname.split('/') || [],
    psychotic = result.protocol && !slashedProtocol[result.protocol];

  /*
   * if the url is a non-slashed url, then relative
   * links like ../.. should be able
   * to crawl up to the hostname, as well.  This is strange.
   * result.protocol has already been set by now.
   * Later on, put the first path part into the host field.
   */
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') { srcPath[0] = result.host; } else { srcPath.unshift(result.host); }
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') { relPath[0] = relative.host; } else { relPath.unshift(relative.host); }
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = relative.host || relative.host === '' ? relative.host : result.host;
    result.hostname = relative.hostname || relative.hostname === '' ? relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    /*
     * it's relative
     * throw away the existing file, and take the new path instead.
     */
    if (!srcPath) { srcPath = []; }
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (relative.search != null) {
    /*
     * just pull out the search.
     * like href='?foo'.
     * Put this after the other two cases because it simplifies the booleans
     */
    if (psychotic) {
      result.host = srcPath.shift();
      result.hostname = result.host;
      /*
       * occationaly the auth can get stuck only in host
       * this especially happens in cases like
       * url.resolveObject('mailto:local1@domain1', 'local2@domain2')
       */
      var authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.hostname = authInHost.shift();
        result.host = result.hostname;
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    // to support http.request
    if (result.pathname !== null || result.search !== null) {
      result.path = (result.pathname ? result.pathname : '') + (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    /*
     * no path at all.  easy.
     * we've already handled the other stuff above.
     */
    result.pathname = null;
    // to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  /*
   * if a url ENDs in . or .., then it must get a trailing slash.
   * however, if it ends in anything else non-slashy,
   * then it must NOT get a trailing slash.
   */
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (result.host || relative.host || srcPath.length > 1) && (last === '.' || last === '..') || last === '';

  /*
   * strip single dots, resolve double dots to parent dir
   * if the path tries to go above the root, `up` ends up > 0
   */
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' && (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' || (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = isAbsolute ? '' : srcPath.length ? srcPath.shift() : '';
    result.host = result.hostname;
    /*
     * occationaly the auth can get stuck only in host
     * this especially happens in cases like
     * url.resolveObject('mailto:local1@domain1', 'local2@domain2')
     */
    var authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.hostname = authInHost.shift();
      result.host = result.hostname;
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (srcPath.length > 0) {
    result.pathname = srcPath.join('/');
  } else {
    result.pathname = null;
    result.path = null;
  }

  // to support request.http
  if (result.pathname !== null || result.search !== null) {
    result.path = (result.pathname ? result.pathname : '') + (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function () {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) { this.hostname = host; }
};

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

},{"punycode":15,"qs":17}],24:[function(require,module,exports){
"use strict";
var core = require("@pixi/core"), display = require("@pixi/display"), events = require("@pixi/events"), accessibleTarget = require("./accessibleTarget.js");
display.DisplayObject.mixin(accessibleTarget.accessibleTarget);
const KEY_CODE_TAB = 9, DIV_TOUCH_SIZE = 100, DIV_TOUCH_POS_X = 0, DIV_TOUCH_POS_Y = 0, DIV_TOUCH_ZINDEX = 2, DIV_HOOK_SIZE = 1, DIV_HOOK_POS_X = -1e3, DIV_HOOK_POS_Y = -1e3, DIV_HOOK_ZINDEX = 2;
class AccessibilityManager {
  // 2fps
  /**
   * @param {PIXI.CanvasRenderer|PIXI.Renderer} renderer - A reference to the current renderer
   */
  constructor(renderer) {
    this.debug = !1, this._isActive = !1, this._isMobileAccessibility = !1, this.pool = [], this.renderId = 0, this.children = [], this.androidUpdateCount = 0, this.androidUpdateFrequency = 500, this._hookDiv = null, (core.utils.isMobile.tablet || core.utils.isMobile.phone) && this.createTouchHook();
    const div = document.createElement("div");
    div.style.width = `${DIV_TOUCH_SIZE}px`, div.style.height = `${DIV_TOUCH_SIZE}px`, div.style.position = "absolute", div.style.top = `${DIV_TOUCH_POS_X}px`, div.style.left = `${DIV_TOUCH_POS_Y}px`, div.style.zIndex = DIV_TOUCH_ZINDEX.toString(), this.div = div, this.renderer = renderer, this._onKeyDown = this._onKeyDown.bind(this), this._onMouseMove = this._onMouseMove.bind(this), globalThis.addEventListener("keydown", this._onKeyDown, !1);
  }
  /**
   * Value of `true` if accessibility is currently active and accessibility layers are showing.
   * @member {boolean}
   * @readonly
   */
  get isActive() {
    return this._isActive;
  }
  /**
   * Value of `true` if accessibility is enabled for touch devices.
   * @member {boolean}
   * @readonly
   */
  get isMobileAccessibility() {
    return this._isMobileAccessibility;
  }
  /**
   * Creates the touch hooks.
   * @private
   */
  createTouchHook() {
    const hookDiv = document.createElement("button");
    hookDiv.style.width = `${DIV_HOOK_SIZE}px`, hookDiv.style.height = `${DIV_HOOK_SIZE}px`, hookDiv.style.position = "absolute", hookDiv.style.top = `${DIV_HOOK_POS_X}px`, hookDiv.style.left = `${DIV_HOOK_POS_Y}px`, hookDiv.style.zIndex = DIV_HOOK_ZINDEX.toString(), hookDiv.style.backgroundColor = "#FF0000", hookDiv.title = "select to enable accessibility for this content", hookDiv.addEventListener("focus", () => {
      this._isMobileAccessibility = !0, this.activate(), this.destroyTouchHook();
    }), document.body.appendChild(hookDiv), this._hookDiv = hookDiv;
  }
  /**
   * Destroys the touch hooks.
   * @private
   */
  destroyTouchHook() {
    this._hookDiv && (document.body.removeChild(this._hookDiv), this._hookDiv = null);
  }
  /**
   * Activating will cause the Accessibility layer to be shown.
   * This is called when a user presses the tab key.
   * @private
   */
  activate() {
    this._isActive || (this._isActive = !0, globalThis.document.addEventListener("mousemove", this._onMouseMove, !0), globalThis.removeEventListener("keydown", this._onKeyDown, !1), this.renderer.on("postrender", this.update, this), this.renderer.view.parentNode?.appendChild(this.div));
  }
  /**
   * Deactivating will cause the Accessibility layer to be hidden.
   * This is called when a user moves the mouse.
   * @private
   */
  deactivate() {
    !this._isActive || this._isMobileAccessibility || (this._isActive = !1, globalThis.document.removeEventListener("mousemove", this._onMouseMove, !0), globalThis.addEventListener("keydown", this._onKeyDown, !1), this.renderer.off("postrender", this.update), this.div.parentNode?.removeChild(this.div));
  }
  /**
   * This recursive function will run through the scene graph and add any new accessible objects to the DOM layer.
   * @private
   * @param {PIXI.Container} displayObject - The DisplayObject to check.
   */
  updateAccessibleObjects(displayObject) {
    if (!displayObject.visible || !displayObject.accessibleChildren)
      return;
    displayObject.accessible && displayObject.isInteractive() && (displayObject._accessibleActive || this.addChild(displayObject), displayObject.renderId = this.renderId);
    const children = displayObject.children;
    if (children)
      for (let i = 0; i < children.length; i++)
        this.updateAccessibleObjects(children[i]);
  }
  /**
   * Before each render this function will ensure that all divs are mapped correctly to their DisplayObjects.
   * @private
   */
  update() {
    const now = performance.now();
    if (core.utils.isMobile.android.device && now < this.androidUpdateCount || (this.androidUpdateCount = now + this.androidUpdateFrequency, !this.renderer.renderingToScreen))
      return;
    this.renderer.lastObjectRendered && this.updateAccessibleObjects(this.renderer.lastObjectRendered);
    const { x, y, width, height } = this.renderer.view.getBoundingClientRect(), { width: viewWidth, height: viewHeight, resolution } = this.renderer, sx = width / viewWidth * resolution, sy = height / viewHeight * resolution;
    let div = this.div;
    div.style.left = `${x}px`, div.style.top = `${y}px`, div.style.width = `${viewWidth}px`, div.style.height = `${viewHeight}px`;
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (child.renderId !== this.renderId)
        child._accessibleActive = !1, core.utils.removeItems(this.children, i, 1), this.div.removeChild(child._accessibleDiv), this.pool.push(child._accessibleDiv), child._accessibleDiv = null, i--;
      else {
        div = child._accessibleDiv;
        let hitArea = child.hitArea;
        const wt = child.worldTransform;
        child.hitArea ? (div.style.left = `${(wt.tx + hitArea.x * wt.a) * sx}px`, div.style.top = `${(wt.ty + hitArea.y * wt.d) * sy}px`, div.style.width = `${hitArea.width * wt.a * sx}px`, div.style.height = `${hitArea.height * wt.d * sy}px`) : (hitArea = child.getBounds(), this.capHitArea(hitArea), div.style.left = `${hitArea.x * sx}px`, div.style.top = `${hitArea.y * sy}px`, div.style.width = `${hitArea.width * sx}px`, div.style.height = `${hitArea.height * sy}px`, div.title !== child.accessibleTitle && child.accessibleTitle !== null && (div.title = child.accessibleTitle), div.getAttribute("aria-label") !== child.accessibleHint && child.accessibleHint !== null && div.setAttribute("aria-label", child.accessibleHint)), (child.accessibleTitle !== div.title || child.tabIndex !== div.tabIndex) && (div.title = child.accessibleTitle, div.tabIndex = child.tabIndex, this.debug && this.updateDebugHTML(div));
      }
    }
    this.renderId++;
  }
  /**
   * private function that will visually add the information to the
   * accessability div
   * @param {HTMLElement} div -
   */
  updateDebugHTML(div) {
    div.innerHTML = `type: ${div.type}</br> title : ${div.title}</br> tabIndex: ${div.tabIndex}`;
  }
  /**
   * Adjust the hit area based on the bounds of a display object
   * @param {PIXI.Rectangle} hitArea - Bounds of the child
   */
  capHitArea(hitArea) {
    hitArea.x < 0 && (hitArea.width += hitArea.x, hitArea.x = 0), hitArea.y < 0 && (hitArea.height += hitArea.y, hitArea.y = 0);
    const { width: viewWidth, height: viewHeight } = this.renderer;
    hitArea.x + hitArea.width > viewWidth && (hitArea.width = viewWidth - hitArea.x), hitArea.y + hitArea.height > viewHeight && (hitArea.height = viewHeight - hitArea.y);
  }
  /**
   * Adds a DisplayObject to the accessibility manager
   * @private
   * @param {PIXI.DisplayObject} displayObject - The child to make accessible.
   */
  addChild(displayObject) {
    let div = this.pool.pop();
    div || (div = document.createElement("button"), div.style.width = `${DIV_TOUCH_SIZE}px`, div.style.height = `${DIV_TOUCH_SIZE}px`, div.style.backgroundColor = this.debug ? "rgba(255,255,255,0.5)" : "transparent", div.style.position = "absolute", div.style.zIndex = DIV_TOUCH_ZINDEX.toString(), div.style.borderStyle = "none", navigator.userAgent.toLowerCase().includes("chrome") ? div.setAttribute("aria-live", "off") : div.setAttribute("aria-live", "polite"), navigator.userAgent.match(/rv:.*Gecko\//) ? div.setAttribute("aria-relevant", "additions") : div.setAttribute("aria-relevant", "text"), div.addEventListener("click", this._onClick.bind(this)), div.addEventListener("focus", this._onFocus.bind(this)), div.addEventListener("focusout", this._onFocusOut.bind(this))), div.style.pointerEvents = displayObject.accessiblePointerEvents, div.type = displayObject.accessibleType, displayObject.accessibleTitle && displayObject.accessibleTitle !== null ? div.title = displayObject.accessibleTitle : (!displayObject.accessibleHint || displayObject.accessibleHint === null) && (div.title = `displayObject ${displayObject.tabIndex}`), displayObject.accessibleHint && displayObject.accessibleHint !== null && div.setAttribute("aria-label", displayObject.accessibleHint), this.debug && this.updateDebugHTML(div), displayObject._accessibleActive = !0, displayObject._accessibleDiv = div, div.displayObject = displayObject, this.children.push(displayObject), this.div.appendChild(displayObject._accessibleDiv), displayObject._accessibleDiv.tabIndex = displayObject.tabIndex;
  }
  /**
   * Dispatch events with the EventSystem.
   * @param e
   * @param type
   * @private
   */
  _dispatchEvent(e, type) {
    const { displayObject: target } = e.target, boundry = this.renderer.events.rootBoundary, event = Object.assign(new events.FederatedEvent(boundry), { target });
    boundry.rootTarget = this.renderer.lastObjectRendered, type.forEach((type2) => boundry.dispatchEvent(event, type2));
  }
  /**
   * Maps the div button press to pixi's EventSystem (click)
   * @private
   * @param {MouseEvent} e - The click event.
   */
  _onClick(e) {
    this._dispatchEvent(e, ["click", "pointertap", "tap"]);
  }
  /**
   * Maps the div focus events to pixi's EventSystem (mouseover)
   * @private
   * @param {FocusEvent} e - The focus event.
   */
  _onFocus(e) {
    e.target.getAttribute("aria-live") || e.target.setAttribute("aria-live", "assertive"), this._dispatchEvent(e, ["mouseover"]);
  }
  /**
   * Maps the div focus events to pixi's EventSystem (mouseout)
   * @private
   * @param {FocusEvent} e - The focusout event.
   */
  _onFocusOut(e) {
    e.target.getAttribute("aria-live") || e.target.setAttribute("aria-live", "polite"), this._dispatchEvent(e, ["mouseout"]);
  }
  /**
   * Is called when a key is pressed
   * @private
   * @param {KeyboardEvent} e - The keydown event.
   */
  _onKeyDown(e) {
    e.keyCode === KEY_CODE_TAB && this.activate();
  }
  /**
   * Is called when the mouse moves across the renderer element
   * @private
   * @param {MouseEvent} e - The mouse event.
   */
  _onMouseMove(e) {
    e.movementX === 0 && e.movementY === 0 || this.deactivate();
  }
  /** Destroys the accessibility manager */
  destroy() {
    this.destroyTouchHook(), this.div = null, globalThis.document.removeEventListener("mousemove", this._onMouseMove, !0), globalThis.removeEventListener("keydown", this._onKeyDown), this.pool = null, this.children = null, this.renderer = null;
  }
}
AccessibilityManager.extension = {
  name: "accessibility",
  type: [
    core.ExtensionType.RendererPlugin,
    core.ExtensionType.CanvasRendererPlugin
  ]
};
core.extensions.add(AccessibilityManager);
exports.AccessibilityManager = AccessibilityManager;


},{"./accessibleTarget.js":25,"@pixi/core":72,"@pixi/display":148,"@pixi/events":159}],25:[function(require,module,exports){
"use strict";
const accessibleTarget = {
  /**
   *  Flag for if the object is accessible. If true AccessibilityManager will overlay a
   *   shadow div with attributes set
   * @member {boolean}
   * @memberof PIXI.DisplayObject#
   */
  accessible: !1,
  /**
   * Sets the title attribute of the shadow div
   * If accessibleTitle AND accessibleHint has not been this will default to 'displayObject [tabIndex]'
   * @member {?string}
   * @memberof PIXI.DisplayObject#
   */
  accessibleTitle: null,
  /**
   * Sets the aria-label attribute of the shadow div
   * @member {string}
   * @memberof PIXI.DisplayObject#
   */
  accessibleHint: null,
  /**
   * @member {number}
   * @memberof PIXI.DisplayObject#
   * @private
   * @todo Needs docs.
   */
  tabIndex: 0,
  /**
   * @member {boolean}
   * @memberof PIXI.DisplayObject#
   * @todo Needs docs.
   */
  _accessibleActive: !1,
  /**
   * @member {boolean}
   * @memberof PIXI.DisplayObject#
   * @todo Needs docs.
   */
  _accessibleDiv: null,
  /**
   * Specify the type of div the accessible layer is. Screen readers treat the element differently
   * depending on this type. Defaults to button.
   * @member {string}
   * @memberof PIXI.DisplayObject#
   * @default 'button'
   */
  accessibleType: "button",
  /**
   * Specify the pointer-events the accessible div will use
   * Defaults to auto.
   * @member {string}
   * @memberof PIXI.DisplayObject#
   * @default 'auto'
   */
  accessiblePointerEvents: "auto",
  /**
   * Setting to false will prevent any children inside this container to
   * be accessible. Defaults to true.
   * @member {boolean}
   * @memberof PIXI.DisplayObject#
   * @default true
   */
  accessibleChildren: !0,
  renderId: -1
};
exports.accessibleTarget = accessibleTarget;


},{}],26:[function(require,module,exports){
"use strict";
var AccessibilityManager = require("./AccessibilityManager.js"), accessibleTarget = require("./accessibleTarget.js");
exports.AccessibilityManager = AccessibilityManager.AccessibilityManager;
exports.accessibleTarget = accessibleTarget.accessibleTarget;


},{"./AccessibilityManager.js":24,"./accessibleTarget.js":25}],27:[function(require,module,exports){
"use strict";
var colord = require("@pixi/colord"), namesPlugin = require("@pixi/colord/plugins/names");
colord.extend([namesPlugin]);
const _Color = class _Color2 {
  /**
   * @param {PIXI.ColorSource} value - Optional value to use, if not provided, white is used.
   */
  constructor(value = 16777215) {
    this._value = null, this._components = new Float32Array(4), this._components.fill(1), this._int = 16777215, this.value = value;
  }
  /** Get red component (0 - 1) */
  get red() {
    return this._components[0];
  }
  /** Get green component (0 - 1) */
  get green() {
    return this._components[1];
  }
  /** Get blue component (0 - 1) */
  get blue() {
    return this._components[2];
  }
  /** Get alpha component (0 - 1) */
  get alpha() {
    return this._components[3];
  }
  /**
   * Set the value, suitable for chaining
   * @param value
   * @see PIXI.Color.value
   */
  setValue(value) {
    return this.value = value, this;
  }
  /**
   * The current color source.
   *
   * When setting:
   * - Setting to an instance of `Color` will copy its color source and components.
   * - Otherwise, `Color` will try to normalize the color source and set the components.
   *   If the color source is invalid, an `Error` will be thrown and the `Color` will left unchanged.
   *
   * Note: The `null` in the setter's parameter type is added to match the TypeScript rule: return type of getter
   * must be assignable to its setter's parameter type. Setting `value` to `null` will throw an `Error`.
   *
   * When getting:
   * - A return value of `null` means the previous value was overridden (e.g., {@link PIXI.Color.multiply multiply},
   *   {@link PIXI.Color.premultiply premultiply} or {@link PIXI.Color.round round}).
   * - Otherwise, the color source used when setting is returned.
   * @type {PIXI.ColorSource}
   */
  set value(value) {
    if (value instanceof _Color2)
      this._value = this.cloneSource(value._value), this._int = value._int, this._components.set(value._components);
    else {
      if (value === null)
        throw new Error("Cannot set PIXI.Color#value to null");
      (this._value === null || !this.isSourceEqual(this._value, value)) && (this.normalize(value), this._value = this.cloneSource(value));
    }
  }
  get value() {
    return this._value;
  }
  /**
   * Copy a color source internally.
   * @param value - Color source
   */
  cloneSource(value) {
    return typeof value == "string" || typeof value == "number" || value instanceof Number || value === null ? value : Array.isArray(value) || ArrayBuffer.isView(value) ? value.slice(0) : typeof value == "object" && value !== null ? { ...value } : value;
  }
  /**
   * Equality check for color sources.
   * @param value1 - First color source
   * @param value2 - Second color source
   * @returns `true` if the color sources are equal, `false` otherwise.
   */
  isSourceEqual(value1, value2) {
    const type1 = typeof value1;
    if (type1 !== typeof value2)
      return !1;
    if (type1 === "number" || type1 === "string" || value1 instanceof Number)
      return value1 === value2;
    if (Array.isArray(value1) && Array.isArray(value2) || ArrayBuffer.isView(value1) && ArrayBuffer.isView(value2))
      return value1.length !== value2.length ? !1 : value1.every((v, i) => v === value2[i]);
    if (value1 !== null && value2 !== null) {
      const keys1 = Object.keys(value1), keys2 = Object.keys(value2);
      return keys1.length !== keys2.length ? !1 : keys1.every((key) => value1[key] === value2[key]);
    }
    return value1 === value2;
  }
  /**
   * Convert to a RGBA color object.
   * @example
   * import { Color } from 'pixi.js';
   * new Color('white').toRgb(); // returns { r: 1, g: 1, b: 1, a: 1 }
   */
  toRgba() {
    const [r, g, b, a] = this._components;
    return { r, g, b, a };
  }
  /**
   * Convert to a RGB color object.
   * @example
   * import { Color } from 'pixi.js';
   * new Color('white').toRgb(); // returns { r: 1, g: 1, b: 1 }
   */
  toRgb() {
    const [r, g, b] = this._components;
    return { r, g, b };
  }
  /** Convert to a CSS-style rgba string: `rgba(255,255,255,1.0)`. */
  toRgbaString() {
    const [r, g, b] = this.toUint8RgbArray();
    return `rgba(${r},${g},${b},${this.alpha})`;
  }
  toUint8RgbArray(out) {
    const [r, g, b] = this._components;
    return out = out ?? [], out[0] = Math.round(r * 255), out[1] = Math.round(g * 255), out[2] = Math.round(b * 255), out;
  }
  toRgbArray(out) {
    out = out ?? [];
    const [r, g, b] = this._components;
    return out[0] = r, out[1] = g, out[2] = b, out;
  }
  /**
   * Convert to a hexadecimal number.
   * @example
   * import { Color } from 'pixi.js';
   * new Color('white').toNumber(); // returns 16777215
   */
  toNumber() {
    return this._int;
  }
  /**
   * Convert to a hexadecimal number in little endian format (e.g., BBGGRR).
   * @example
   * import { Color } from 'pixi.js';
   * new Color(0xffcc99).toLittleEndianNumber(); // returns 0x99ccff
   * @returns {number} - The color as a number in little endian format.
   */
  toLittleEndianNumber() {
    const value = this._int;
    return (value >> 16) + (value & 65280) + ((value & 255) << 16);
  }
  /**
   * Multiply with another color. This action is destructive, and will
   * override the previous `value` property to be `null`.
   * @param {PIXI.ColorSource} value - The color to multiply by.
   */
  multiply(value) {
    const [r, g, b, a] = _Color2.temp.setValue(value)._components;
    return this._components[0] *= r, this._components[1] *= g, this._components[2] *= b, this._components[3] *= a, this.refreshInt(), this._value = null, this;
  }
  /**
   * Converts color to a premultiplied alpha format. This action is destructive, and will
   * override the previous `value` property to be `null`.
   * @param alpha - The alpha to multiply by.
   * @param {boolean} [applyToRGB=true] - Whether to premultiply RGB channels.
   * @returns {PIXI.Color} - Itself.
   */
  premultiply(alpha, applyToRGB = !0) {
    return applyToRGB && (this._components[0] *= alpha, this._components[1] *= alpha, this._components[2] *= alpha), this._components[3] = alpha, this.refreshInt(), this._value = null, this;
  }
  /**
   * Premultiplies alpha with current color.
   * @param {number} alpha - The alpha to multiply by.
   * @param {boolean} [applyToRGB=true] - Whether to premultiply RGB channels.
   * @returns {number} tint multiplied by alpha
   */
  toPremultiplied(alpha, applyToRGB = !0) {
    if (alpha === 1)
      return (255 << 24) + this._int;
    if (alpha === 0)
      return applyToRGB ? 0 : this._int;
    let r = this._int >> 16 & 255, g = this._int >> 8 & 255, b = this._int & 255;
    return applyToRGB && (r = r * alpha + 0.5 | 0, g = g * alpha + 0.5 | 0, b = b * alpha + 0.5 | 0), (alpha * 255 << 24) + (r << 16) + (g << 8) + b;
  }
  /**
   * Convert to a hexidecimal string.
   * @example
   * import { Color } from 'pixi.js';
   * new Color('white').toHex(); // returns "#ffffff"
   */
  toHex() {
    const hexString = this._int.toString(16);
    return `#${"000000".substring(0, 6 - hexString.length) + hexString}`;
  }
  /**
   * Convert to a hexidecimal string with alpha.
   * @example
   * import { Color } from 'pixi.js';
   * new Color('white').toHexa(); // returns "#ffffffff"
   */
  toHexa() {
    const alphaString = Math.round(this._components[3] * 255).toString(16);
    return this.toHex() + "00".substring(0, 2 - alphaString.length) + alphaString;
  }
  /**
   * Set alpha, suitable for chaining.
   * @param alpha
   */
  setAlpha(alpha) {
    return this._components[3] = this._clamp(alpha), this;
  }
  /**
   * Rounds the specified color according to the step. This action is destructive, and will
   * override the previous `value` property to be `null`. The alpha component is not rounded.
   * @param steps - Number of steps which will be used as a cap when rounding colors
   * @deprecated since 7.3.0
   */
  round(steps) {
    const [r, g, b] = this._components;
    return this._components[0] = Math.round(r * steps) / steps, this._components[1] = Math.round(g * steps) / steps, this._components[2] = Math.round(b * steps) / steps, this.refreshInt(), this._value = null, this;
  }
  toArray(out) {
    out = out ?? [];
    const [r, g, b, a] = this._components;
    return out[0] = r, out[1] = g, out[2] = b, out[3] = a, out;
  }
  /**
   * Normalize the input value into rgba
   * @param value - Input value
   */
  normalize(value) {
    let r, g, b, a;
    if ((typeof value == "number" || value instanceof Number) && value >= 0 && value <= 16777215) {
      const int = value;
      r = (int >> 16 & 255) / 255, g = (int >> 8 & 255) / 255, b = (int & 255) / 255, a = 1;
    } else if ((Array.isArray(value) || value instanceof Float32Array) && value.length >= 3 && value.length <= 4)
      value = this._clamp(value), [r, g, b, a = 1] = value;
    else if ((value instanceof Uint8Array || value instanceof Uint8ClampedArray) && value.length >= 3 && value.length <= 4)
      value = this._clamp(value, 0, 255), [r, g, b, a = 255] = value, r /= 255, g /= 255, b /= 255, a /= 255;
    else if (typeof value == "string" || typeof value == "object") {
      if (typeof value == "string") {
        const match = _Color2.HEX_PATTERN.exec(value);
        match && (value = `#${match[2]}`);
      }
      const color = colord.colord(value);
      color.isValid() && ({ r, g, b, a } = color.rgba, r /= 255, g /= 255, b /= 255);
    }
    if (r !== void 0)
      this._components[0] = r, this._components[1] = g, this._components[2] = b, this._components[3] = a, this.refreshInt();
    else
      throw new Error(`Unable to convert color ${value}`);
  }
  /** Refresh the internal color rgb number */
  refreshInt() {
    this._clamp(this._components);
    const [r, g, b] = this._components;
    this._int = (r * 255 << 16) + (g * 255 << 8) + (b * 255 | 0);
  }
  /**
   * Clamps values to a range. Will override original values
   * @param value - Value(s) to clamp
   * @param min - Minimum value
   * @param max - Maximum value
   */
  _clamp(value, min = 0, max = 1) {
    return typeof value == "number" ? Math.min(Math.max(value, min), max) : (value.forEach((v, i) => {
      value[i] = Math.min(Math.max(v, min), max);
    }), value);
  }
};
_Color.shared = new _Color(), /**
* Temporary Color object for static uses internally.
* As to not conflict with Color.shared.
* @ignore
*/
_Color.temp = new _Color(), /** Pattern for hex strings */
_Color.HEX_PATTERN = /^(#|0x)?(([a-f0-9]{3}){1,2}([a-f0-9]{2})?)$/i;
let Color = _Color;
exports.Color = Color;


},{"@pixi/colord":29,"@pixi/colord/plugins/names":30}],28:[function(require,module,exports){
"use strict";
var Color = require("./Color.js");
exports.Color = Color.Color;


},{"./Color.js":27}],29:[function(require,module,exports){
Object.defineProperty(exports,"__esModule",{value:!0});var r={grad:.9,turn:360,rad:360/(2*Math.PI)},t=function(r){return"string"==typeof r?r.length>0:"number"==typeof r},n=function(r,t,n){return void 0===t&&(t=0),void 0===n&&(n=Math.pow(10,t)),Math.round(n*r)/n+0},e=function(r,t,n){return void 0===t&&(t=0),void 0===n&&(n=1),r>n?n:r>t?r:t},u=function(r){return(r=isFinite(r)?r%360:0)>0?r:r+360},o=function(r){return{r:e(r.r,0,255),g:e(r.g,0,255),b:e(r.b,0,255),a:e(r.a)}},a=function(r){return{r:n(r.r),g:n(r.g),b:n(r.b),a:n(r.a,3)}},s=/^#([0-9a-f]{3,8})$/i,i=function(r){var t=r.toString(16);return t.length<2?"0"+t:t},h=function(r){var t=r.r,n=r.g,e=r.b,u=r.a,o=Math.max(t,n,e),a=o-Math.min(t,n,e),s=a?o===t?(n-e)/a:o===n?2+(e-t)/a:4+(t-n)/a:0;return{h:60*(s<0?s+6:s),s:o?a/o*100:0,v:o/255*100,a:u}},b=function(r){var t=r.h,n=r.s,e=r.v,u=r.a;t=t/360*6,n/=100,e/=100;var o=Math.floor(t),a=e*(1-n),s=e*(1-(t-o)*n),i=e*(1-(1-t+o)*n),h=o%6;return{r:255*[e,s,a,a,i,e][h],g:255*[i,e,e,s,a,a][h],b:255*[a,a,i,e,e,s][h],a:u}},d=function(r){return{h:u(r.h),s:e(r.s,0,100),l:e(r.l,0,100),a:e(r.a)}},g=function(r){return{h:n(r.h),s:n(r.s),l:n(r.l),a:n(r.a,3)}},f=function(r){return b((n=(t=r).s,{h:t.h,s:(n*=((e=t.l)<50?e:100-e)/100)>0?2*n/(e+n)*100:0,v:e+n,a:t.a}));var t,n,e},p=function(r){return{h:(t=h(r)).h,s:(u=(200-(n=t.s))*(e=t.v)/100)>0&&u<200?n*e/100/(u<=100?u:200-u)*100:0,l:u/2,a:t.a};var t,n,e,u},l=/^hsla?\(\s*([+-]?\d*\.?\d+)(deg|rad|grad|turn)?\s*,\s*([+-]?\d*\.?\d+)%\s*,\s*([+-]?\d*\.?\d+)%\s*(?:,\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i,c=/^hsla?\(\s*([+-]?\d*\.?\d+)(deg|rad|grad|turn)?\s+([+-]?\d*\.?\d+)%\s+([+-]?\d*\.?\d+)%\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i,v=/^rgba?\(\s*([+-]?\d*\.?\d+)(%)?\s*,\s*([+-]?\d*\.?\d+)(%)?\s*,\s*([+-]?\d*\.?\d+)(%)?\s*(?:,\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i,m=/^rgba?\(\s*([+-]?\d*\.?\d+)(%)?\s+([+-]?\d*\.?\d+)(%)?\s+([+-]?\d*\.?\d+)(%)?\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i,y={string:[[function(r){var t=s.exec(r);return t?(r=t[1]).length<=4?{r:parseInt(r[0]+r[0],16),g:parseInt(r[1]+r[1],16),b:parseInt(r[2]+r[2],16),a:4===r.length?n(parseInt(r[3]+r[3],16)/255,2):1}:6===r.length||8===r.length?{r:parseInt(r.substr(0,2),16),g:parseInt(r.substr(2,2),16),b:parseInt(r.substr(4,2),16),a:8===r.length?n(parseInt(r.substr(6,2),16)/255,2):1}:null:null},"hex"],[function(r){var t=v.exec(r)||m.exec(r);return t?t[2]!==t[4]||t[4]!==t[6]?null:o({r:Number(t[1])/(t[2]?100/255:1),g:Number(t[3])/(t[4]?100/255:1),b:Number(t[5])/(t[6]?100/255:1),a:void 0===t[7]?1:Number(t[7])/(t[8]?100:1)}):null},"rgb"],[function(t){var n=l.exec(t)||c.exec(t);if(!n)return null;var e,u,o=d({h:(e=n[1],u=n[2],void 0===u&&(u="deg"),Number(e)*(r[u]||1)),s:Number(n[3]),l:Number(n[4]),a:void 0===n[5]?1:Number(n[5])/(n[6]?100:1)});return f(o)},"hsl"]],object:[[function(r){var n=r.r,e=r.g,u=r.b,a=r.a,s=void 0===a?1:a;return t(n)&&t(e)&&t(u)?o({r:Number(n),g:Number(e),b:Number(u),a:Number(s)}):null},"rgb"],[function(r){var n=r.h,e=r.s,u=r.l,o=r.a,a=void 0===o?1:o;if(!t(n)||!t(e)||!t(u))return null;var s=d({h:Number(n),s:Number(e),l:Number(u),a:Number(a)});return f(s)},"hsl"],[function(r){var n=r.h,o=r.s,a=r.v,s=r.a,i=void 0===s?1:s;if(!t(n)||!t(o)||!t(a))return null;var h=function(r){return{h:u(r.h),s:e(r.s,0,100),v:e(r.v,0,100),a:e(r.a)}}({h:Number(n),s:Number(o),v:Number(a),a:Number(i)});return b(h)},"hsv"]]},N=function(r,t){for(var n=0;n<t.length;n++){var e=t[n][0](r);if(e)return[e,t[n][1]]}return[null,void 0]},x=function(r){return"string"==typeof r?N(r.trim(),y.string):"object"==typeof r&&null!==r?N(r,y.object):[null,void 0]},M=function(r,t){var n=p(r);return{h:n.h,s:e(n.s+100*t,0,100),l:n.l,a:n.a}},I=function(r){return(299*r.r+587*r.g+114*r.b)/1e3/255},H=function(r,t){var n=p(r);return{h:n.h,s:n.s,l:e(n.l+100*t,0,100),a:n.a}},$=function(){function r(r){this.parsed=x(r)[0],this.rgba=this.parsed||{r:0,g:0,b:0,a:1}}return r.prototype.isValid=function(){return null!==this.parsed},r.prototype.brightness=function(){return n(I(this.rgba),2)},r.prototype.isDark=function(){return I(this.rgba)<.5},r.prototype.isLight=function(){return I(this.rgba)>=.5},r.prototype.toHex=function(){return r=a(this.rgba),t=r.r,e=r.g,u=r.b,s=(o=r.a)<1?i(n(255*o)):"","#"+i(t)+i(e)+i(u)+s;var r,t,e,u,o,s},r.prototype.toRgb=function(){return a(this.rgba)},r.prototype.toRgbString=function(){return r=a(this.rgba),t=r.r,n=r.g,e=r.b,(u=r.a)<1?"rgba("+t+", "+n+", "+e+", "+u+")":"rgb("+t+", "+n+", "+e+")";var r,t,n,e,u},r.prototype.toHsl=function(){return g(p(this.rgba))},r.prototype.toHslString=function(){return r=g(p(this.rgba)),t=r.h,n=r.s,e=r.l,(u=r.a)<1?"hsla("+t+", "+n+"%, "+e+"%, "+u+")":"hsl("+t+", "+n+"%, "+e+"%)";var r,t,n,e,u},r.prototype.toHsv=function(){return r=h(this.rgba),{h:n(r.h),s:n(r.s),v:n(r.v),a:n(r.a,3)};var r},r.prototype.invert=function(){return j({r:255-(r=this.rgba).r,g:255-r.g,b:255-r.b,a:r.a});var r},r.prototype.saturate=function(r){return void 0===r&&(r=.1),j(M(this.rgba,r))},r.prototype.desaturate=function(r){return void 0===r&&(r=.1),j(M(this.rgba,-r))},r.prototype.grayscale=function(){return j(M(this.rgba,-1))},r.prototype.lighten=function(r){return void 0===r&&(r=.1),j(H(this.rgba,r))},r.prototype.darken=function(r){return void 0===r&&(r=.1),j(H(this.rgba,-r))},r.prototype.rotate=function(r){return void 0===r&&(r=15),this.hue(this.hue()+r)},r.prototype.alpha=function(r){return"number"==typeof r?j({r:(t=this.rgba).r,g:t.g,b:t.b,a:r}):n(this.rgba.a,3);var t},r.prototype.hue=function(r){var t=p(this.rgba);return"number"==typeof r?j({h:r,s:t.s,l:t.l,a:t.a}):n(t.h)},r.prototype.isEqual=function(r){return this.toHex()===j(r).toHex()},r}(),j=function(r){return r instanceof $?r:new $(r)},w=[];exports.Colord=$,exports.colord=j,exports.extend=function(r){r.forEach(function(r){w.indexOf(r)<0&&(r($,y),w.push(r))})},exports.getFormat=function(r){return x(r)[1]},exports.random=function(){return new $({r:255*Math.random(),g:255*Math.random(),b:255*Math.random()})};

},{}],30:[function(require,module,exports){
module.exports=function(e,f){var a={white:"#ffffff",bisque:"#ffe4c4",blue:"#0000ff",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",antiquewhite:"#faebd7",aqua:"#00ffff",azure:"#f0ffff",whitesmoke:"#f5f5f5",papayawhip:"#ffefd5",plum:"#dda0dd",blanchedalmond:"#ffebcd",black:"#000000",gold:"#ffd700",goldenrod:"#daa520",gainsboro:"#dcdcdc",cornsilk:"#fff8dc",cornflowerblue:"#6495ed",burlywood:"#deb887",aquamarine:"#7fffd4",beige:"#f5f5dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkkhaki:"#bdb76b",darkgray:"#a9a9a9",darkgreen:"#006400",darkgrey:"#a9a9a9",peachpuff:"#ffdab9",darkmagenta:"#8b008b",darkred:"#8b0000",darkorchid:"#9932cc",darkorange:"#ff8c00",darkslateblue:"#483d8b",gray:"#808080",darkslategray:"#2f4f4f",darkslategrey:"#2f4f4f",deeppink:"#ff1493",deepskyblue:"#00bfff",wheat:"#f5deb3",firebrick:"#b22222",floralwhite:"#fffaf0",ghostwhite:"#f8f8ff",darkviolet:"#9400d3",magenta:"#ff00ff",green:"#008000",dodgerblue:"#1e90ff",grey:"#808080",honeydew:"#f0fff0",hotpink:"#ff69b4",blueviolet:"#8a2be2",forestgreen:"#228b22",lawngreen:"#7cfc00",indianred:"#cd5c5c",indigo:"#4b0082",fuchsia:"#ff00ff",brown:"#a52a2a",maroon:"#800000",mediumblue:"#0000cd",lightcoral:"#f08080",darkturquoise:"#00ced1",lightcyan:"#e0ffff",ivory:"#fffff0",lightyellow:"#ffffe0",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",linen:"#faf0e6",mediumaquamarine:"#66cdaa",lemonchiffon:"#fffacd",lime:"#00ff00",khaki:"#f0e68c",mediumseagreen:"#3cb371",limegreen:"#32cd32",mediumspringgreen:"#00fa9a",lightskyblue:"#87cefa",lightblue:"#add8e6",midnightblue:"#191970",lightpink:"#ffb6c1",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",mintcream:"#f5fffa",lightslategray:"#778899",lightslategrey:"#778899",navajowhite:"#ffdead",navy:"#000080",mediumvioletred:"#c71585",powderblue:"#b0e0e6",palegoldenrod:"#eee8aa",oldlace:"#fdf5e6",paleturquoise:"#afeeee",mediumturquoise:"#48d1cc",mediumorchid:"#ba55d3",rebeccapurple:"#663399",lightsteelblue:"#b0c4de",mediumslateblue:"#7b68ee",thistle:"#d8bfd8",tan:"#d2b48c",orchid:"#da70d6",mediumpurple:"#9370db",purple:"#800080",pink:"#ffc0cb",skyblue:"#87ceeb",springgreen:"#00ff7f",palegreen:"#98fb98",red:"#ff0000",yellow:"#ffff00",slateblue:"#6a5acd",lavenderblush:"#fff0f5",peru:"#cd853f",palevioletred:"#db7093",violet:"#ee82ee",teal:"#008080",slategray:"#708090",slategrey:"#708090",aliceblue:"#f0f8ff",darkseagreen:"#8fbc8f",darkolivegreen:"#556b2f",greenyellow:"#adff2f",seagreen:"#2e8b57",seashell:"#fff5ee",tomato:"#ff6347",silver:"#c0c0c0",sienna:"#a0522d",lavender:"#e6e6fa",lightgreen:"#90ee90",orange:"#ffa500",orangered:"#ff4500",steelblue:"#4682b4",royalblue:"#4169e1",turquoise:"#40e0d0",yellowgreen:"#9acd32",salmon:"#fa8072",saddlebrown:"#8b4513",sandybrown:"#f4a460",rosybrown:"#bc8f8f",darksalmon:"#e9967a",lightgoldenrodyellow:"#fafad2",snow:"#fffafa",lightgrey:"#d3d3d3",lightgray:"#d3d3d3",dimgray:"#696969",dimgrey:"#696969",olivedrab:"#6b8e23",olive:"#808000"},r={};for(var d in a)r[a[d]]=d;var l={};e.prototype.toName=function(f){if(!(this.rgba.a||this.rgba.r||this.rgba.g||this.rgba.b))return"transparent";var d,i,o=r[this.toHex()];if(o)return o;if(null==f?void 0:f.closest){var n=this.toRgb(),t=1/0,b="black";if(!l.length)for(var c in a)l[c]=new e(a[c]).toRgb();for(var g in a){var u=(d=n,i=l[g],Math.pow(d.r-i.r,2)+Math.pow(d.g-i.g,2)+Math.pow(d.b-i.b,2));u<t&&(t=u,b=g)}return b}};f.string.push([function(f){var r=f.toLowerCase(),d="transparent"===r?"#0000":a[r];return d?new e(d).toRgb():null},"name"])};

},{}],31:[function(require,module,exports){
"use strict";
var ENV = /* @__PURE__ */ ((ENV2) => (ENV2[ENV2.WEBGL_LEGACY = 0] = "WEBGL_LEGACY", ENV2[ENV2.WEBGL = 1] = "WEBGL", ENV2[ENV2.WEBGL2 = 2] = "WEBGL2", ENV2))(ENV || {}), RENDERER_TYPE = /* @__PURE__ */ ((RENDERER_TYPE2) => (RENDERER_TYPE2[RENDERER_TYPE2.UNKNOWN = 0] = "UNKNOWN", RENDERER_TYPE2[RENDERER_TYPE2.WEBGL = 1] = "WEBGL", RENDERER_TYPE2[RENDERER_TYPE2.CANVAS = 2] = "CANVAS", RENDERER_TYPE2))(RENDERER_TYPE || {}), BUFFER_BITS = /* @__PURE__ */ ((BUFFER_BITS2) => (BUFFER_BITS2[BUFFER_BITS2.COLOR = 16384] = "COLOR", BUFFER_BITS2[BUFFER_BITS2.DEPTH = 256] = "DEPTH", BUFFER_BITS2[BUFFER_BITS2.STENCIL = 1024] = "STENCIL", BUFFER_BITS2))(BUFFER_BITS || {}), BLEND_MODES = /* @__PURE__ */ ((BLEND_MODES2) => (BLEND_MODES2[BLEND_MODES2.NORMAL = 0] = "NORMAL", BLEND_MODES2[BLEND_MODES2.ADD = 1] = "ADD", BLEND_MODES2[BLEND_MODES2.MULTIPLY = 2] = "MULTIPLY", BLEND_MODES2[BLEND_MODES2.SCREEN = 3] = "SCREEN", BLEND_MODES2[BLEND_MODES2.OVERLAY = 4] = "OVERLAY", BLEND_MODES2[BLEND_MODES2.DARKEN = 5] = "DARKEN", BLEND_MODES2[BLEND_MODES2.LIGHTEN = 6] = "LIGHTEN", BLEND_MODES2[BLEND_MODES2.COLOR_DODGE = 7] = "COLOR_DODGE", BLEND_MODES2[BLEND_MODES2.COLOR_BURN = 8] = "COLOR_BURN", BLEND_MODES2[BLEND_MODES2.HARD_LIGHT = 9] = "HARD_LIGHT", BLEND_MODES2[BLEND_MODES2.SOFT_LIGHT = 10] = "SOFT_LIGHT", BLEND_MODES2[BLEND_MODES2.DIFFERENCE = 11] = "DIFFERENCE", BLEND_MODES2[BLEND_MODES2.EXCLUSION = 12] = "EXCLUSION", BLEND_MODES2[BLEND_MODES2.HUE = 13] = "HUE", BLEND_MODES2[BLEND_MODES2.SATURATION = 14] = "SATURATION", BLEND_MODES2[BLEND_MODES2.COLOR = 15] = "COLOR", BLEND_MODES2[BLEND_MODES2.LUMINOSITY = 16] = "LUMINOSITY", BLEND_MODES2[BLEND_MODES2.NORMAL_NPM = 17] = "NORMAL_NPM", BLEND_MODES2[BLEND_MODES2.ADD_NPM = 18] = "ADD_NPM", BLEND_MODES2[BLEND_MODES2.SCREEN_NPM = 19] = "SCREEN_NPM", BLEND_MODES2[BLEND_MODES2.NONE = 20] = "NONE", BLEND_MODES2[BLEND_MODES2.SRC_OVER = 0] = "SRC_OVER", BLEND_MODES2[BLEND_MODES2.SRC_IN = 21] = "SRC_IN", BLEND_MODES2[BLEND_MODES2.SRC_OUT = 22] = "SRC_OUT", BLEND_MODES2[BLEND_MODES2.SRC_ATOP = 23] = "SRC_ATOP", BLEND_MODES2[BLEND_MODES2.DST_OVER = 24] = "DST_OVER", BLEND_MODES2[BLEND_MODES2.DST_IN = 25] = "DST_IN", BLEND_MODES2[BLEND_MODES2.DST_OUT = 26] = "DST_OUT", BLEND_MODES2[BLEND_MODES2.DST_ATOP = 27] = "DST_ATOP", BLEND_MODES2[BLEND_MODES2.ERASE = 26] = "ERASE", BLEND_MODES2[BLEND_MODES2.SUBTRACT = 28] = "SUBTRACT", BLEND_MODES2[BLEND_MODES2.XOR = 29] = "XOR", BLEND_MODES2))(BLEND_MODES || {}), DRAW_MODES = /* @__PURE__ */ ((DRAW_MODES2) => (DRAW_MODES2[DRAW_MODES2.POINTS = 0] = "POINTS", DRAW_MODES2[DRAW_MODES2.LINES = 1] = "LINES", DRAW_MODES2[DRAW_MODES2.LINE_LOOP = 2] = "LINE_LOOP", DRAW_MODES2[DRAW_MODES2.LINE_STRIP = 3] = "LINE_STRIP", DRAW_MODES2[DRAW_MODES2.TRIANGLES = 4] = "TRIANGLES", DRAW_MODES2[DRAW_MODES2.TRIANGLE_STRIP = 5] = "TRIANGLE_STRIP", DRAW_MODES2[DRAW_MODES2.TRIANGLE_FAN = 6] = "TRIANGLE_FAN", DRAW_MODES2))(DRAW_MODES || {}), FORMATS = /* @__PURE__ */ ((FORMATS2) => (FORMATS2[FORMATS2.RGBA = 6408] = "RGBA", FORMATS2[FORMATS2.RGB = 6407] = "RGB", FORMATS2[FORMATS2.RG = 33319] = "RG", FORMATS2[FORMATS2.RED = 6403] = "RED", FORMATS2[FORMATS2.RGBA_INTEGER = 36249] = "RGBA_INTEGER", FORMATS2[FORMATS2.RGB_INTEGER = 36248] = "RGB_INTEGER", FORMATS2[FORMATS2.RG_INTEGER = 33320] = "RG_INTEGER", FORMATS2[FORMATS2.RED_INTEGER = 36244] = "RED_INTEGER", FORMATS2[FORMATS2.ALPHA = 6406] = "ALPHA", FORMATS2[FORMATS2.LUMINANCE = 6409] = "LUMINANCE", FORMATS2[FORMATS2.LUMINANCE_ALPHA = 6410] = "LUMINANCE_ALPHA", FORMATS2[FORMATS2.DEPTH_COMPONENT = 6402] = "DEPTH_COMPONENT", FORMATS2[FORMATS2.DEPTH_STENCIL = 34041] = "DEPTH_STENCIL", FORMATS2))(FORMATS || {}), TARGETS = /* @__PURE__ */ ((TARGETS2) => (TARGETS2[TARGETS2.TEXTURE_2D = 3553] = "TEXTURE_2D", TARGETS2[TARGETS2.TEXTURE_CUBE_MAP = 34067] = "TEXTURE_CUBE_MAP", TARGETS2[TARGETS2.TEXTURE_2D_ARRAY = 35866] = "TEXTURE_2D_ARRAY", TARGETS2[TARGETS2.TEXTURE_CUBE_MAP_POSITIVE_X = 34069] = "TEXTURE_CUBE_MAP_POSITIVE_X", TARGETS2[TARGETS2.TEXTURE_CUBE_MAP_NEGATIVE_X = 34070] = "TEXTURE_CUBE_MAP_NEGATIVE_X", TARGETS2[TARGETS2.TEXTURE_CUBE_MAP_POSITIVE_Y = 34071] = "TEXTURE_CUBE_MAP_POSITIVE_Y", TARGETS2[TARGETS2.TEXTURE_CUBE_MAP_NEGATIVE_Y = 34072] = "TEXTURE_CUBE_MAP_NEGATIVE_Y", TARGETS2[TARGETS2.TEXTURE_CUBE_MAP_POSITIVE_Z = 34073] = "TEXTURE_CUBE_MAP_POSITIVE_Z", TARGETS2[TARGETS2.TEXTURE_CUBE_MAP_NEGATIVE_Z = 34074] = "TEXTURE_CUBE_MAP_NEGATIVE_Z", TARGETS2))(TARGETS || {}), TYPES = /* @__PURE__ */ ((TYPES2) => (TYPES2[TYPES2.UNSIGNED_BYTE = 5121] = "UNSIGNED_BYTE", TYPES2[TYPES2.UNSIGNED_SHORT = 5123] = "UNSIGNED_SHORT", TYPES2[TYPES2.UNSIGNED_SHORT_5_6_5 = 33635] = "UNSIGNED_SHORT_5_6_5", TYPES2[TYPES2.UNSIGNED_SHORT_4_4_4_4 = 32819] = "UNSIGNED_SHORT_4_4_4_4", TYPES2[TYPES2.UNSIGNED_SHORT_5_5_5_1 = 32820] = "UNSIGNED_SHORT_5_5_5_1", TYPES2[TYPES2.UNSIGNED_INT = 5125] = "UNSIGNED_INT", TYPES2[TYPES2.UNSIGNED_INT_10F_11F_11F_REV = 35899] = "UNSIGNED_INT_10F_11F_11F_REV", TYPES2[TYPES2.UNSIGNED_INT_2_10_10_10_REV = 33640] = "UNSIGNED_INT_2_10_10_10_REV", TYPES2[TYPES2.UNSIGNED_INT_24_8 = 34042] = "UNSIGNED_INT_24_8", TYPES2[TYPES2.UNSIGNED_INT_5_9_9_9_REV = 35902] = "UNSIGNED_INT_5_9_9_9_REV", TYPES2[TYPES2.BYTE = 5120] = "BYTE", TYPES2[TYPES2.SHORT = 5122] = "SHORT", TYPES2[TYPES2.INT = 5124] = "INT", TYPES2[TYPES2.FLOAT = 5126] = "FLOAT", TYPES2[TYPES2.FLOAT_32_UNSIGNED_INT_24_8_REV = 36269] = "FLOAT_32_UNSIGNED_INT_24_8_REV", TYPES2[TYPES2.HALF_FLOAT = 36193] = "HALF_FLOAT", TYPES2))(TYPES || {}), SAMPLER_TYPES = /* @__PURE__ */ ((SAMPLER_TYPES2) => (SAMPLER_TYPES2[SAMPLER_TYPES2.FLOAT = 0] = "FLOAT", SAMPLER_TYPES2[SAMPLER_TYPES2.INT = 1] = "INT", SAMPLER_TYPES2[SAMPLER_TYPES2.UINT = 2] = "UINT", SAMPLER_TYPES2))(SAMPLER_TYPES || {}), SCALE_MODES = /* @__PURE__ */ ((SCALE_MODES2) => (SCALE_MODES2[SCALE_MODES2.NEAREST = 0] = "NEAREST", SCALE_MODES2[SCALE_MODES2.LINEAR = 1] = "LINEAR", SCALE_MODES2))(SCALE_MODES || {}), WRAP_MODES = /* @__PURE__ */ ((WRAP_MODES2) => (WRAP_MODES2[WRAP_MODES2.CLAMP = 33071] = "CLAMP", WRAP_MODES2[WRAP_MODES2.REPEAT = 10497] = "REPEAT", WRAP_MODES2[WRAP_MODES2.MIRRORED_REPEAT = 33648] = "MIRRORED_REPEAT", WRAP_MODES2))(WRAP_MODES || {}), MIPMAP_MODES = /* @__PURE__ */ ((MIPMAP_MODES2) => (MIPMAP_MODES2[MIPMAP_MODES2.OFF = 0] = "OFF", MIPMAP_MODES2[MIPMAP_MODES2.POW2 = 1] = "POW2", MIPMAP_MODES2[MIPMAP_MODES2.ON = 2] = "ON", MIPMAP_MODES2[MIPMAP_MODES2.ON_MANUAL = 3] = "ON_MANUAL", MIPMAP_MODES2))(MIPMAP_MODES || {}), ALPHA_MODES = /* @__PURE__ */ ((ALPHA_MODES2) => (ALPHA_MODES2[ALPHA_MODES2.NPM = 0] = "NPM", ALPHA_MODES2[ALPHA_MODES2.UNPACK = 1] = "UNPACK", ALPHA_MODES2[ALPHA_MODES2.PMA = 2] = "PMA", ALPHA_MODES2[ALPHA_MODES2.NO_PREMULTIPLIED_ALPHA = 0] = "NO_PREMULTIPLIED_ALPHA", ALPHA_MODES2[ALPHA_MODES2.PREMULTIPLY_ON_UPLOAD = 1] = "PREMULTIPLY_ON_UPLOAD", ALPHA_MODES2[ALPHA_MODES2.PREMULTIPLIED_ALPHA = 2] = "PREMULTIPLIED_ALPHA", ALPHA_MODES2))(ALPHA_MODES || {}), CLEAR_MODES = /* @__PURE__ */ ((CLEAR_MODES2) => (CLEAR_MODES2[CLEAR_MODES2.NO = 0] = "NO", CLEAR_MODES2[CLEAR_MODES2.YES = 1] = "YES", CLEAR_MODES2[CLEAR_MODES2.AUTO = 2] = "AUTO", CLEAR_MODES2[CLEAR_MODES2.BLEND = 0] = "BLEND", CLEAR_MODES2[CLEAR_MODES2.CLEAR = 1] = "CLEAR", CLEAR_MODES2[CLEAR_MODES2.BLIT = 2] = "BLIT", CLEAR_MODES2))(CLEAR_MODES || {}), GC_MODES = /* @__PURE__ */ ((GC_MODES2) => (GC_MODES2[GC_MODES2.AUTO = 0] = "AUTO", GC_MODES2[GC_MODES2.MANUAL = 1] = "MANUAL", GC_MODES2))(GC_MODES || {}), PRECISION = /* @__PURE__ */ ((PRECISION2) => (PRECISION2.LOW = "lowp", PRECISION2.MEDIUM = "mediump", PRECISION2.HIGH = "highp", PRECISION2))(PRECISION || {}), MASK_TYPES = /* @__PURE__ */ ((MASK_TYPES2) => (MASK_TYPES2[MASK_TYPES2.NONE = 0] = "NONE", MASK_TYPES2[MASK_TYPES2.SCISSOR = 1] = "SCISSOR", MASK_TYPES2[MASK_TYPES2.STENCIL = 2] = "STENCIL", MASK_TYPES2[MASK_TYPES2.SPRITE = 3] = "SPRITE", MASK_TYPES2[MASK_TYPES2.COLOR = 4] = "COLOR", MASK_TYPES2))(MASK_TYPES || {}), COLOR_MASK_BITS = /* @__PURE__ */ ((COLOR_MASK_BITS2) => (COLOR_MASK_BITS2[COLOR_MASK_BITS2.RED = 1] = "RED", COLOR_MASK_BITS2[COLOR_MASK_BITS2.GREEN = 2] = "GREEN", COLOR_MASK_BITS2[COLOR_MASK_BITS2.BLUE = 4] = "BLUE", COLOR_MASK_BITS2[COLOR_MASK_BITS2.ALPHA = 8] = "ALPHA", COLOR_MASK_BITS2))(COLOR_MASK_BITS || {}), MSAA_QUALITY = /* @__PURE__ */ ((MSAA_QUALITY2) => (MSAA_QUALITY2[MSAA_QUALITY2.NONE = 0] = "NONE", MSAA_QUALITY2[MSAA_QUALITY2.LOW = 2] = "LOW", MSAA_QUALITY2[MSAA_QUALITY2.MEDIUM = 4] = "MEDIUM", MSAA_QUALITY2[MSAA_QUALITY2.HIGH = 8] = "HIGH", MSAA_QUALITY2))(MSAA_QUALITY || {}), BUFFER_TYPE = /* @__PURE__ */ ((BUFFER_TYPE2) => (BUFFER_TYPE2[BUFFER_TYPE2.ELEMENT_ARRAY_BUFFER = 34963] = "ELEMENT_ARRAY_BUFFER", BUFFER_TYPE2[BUFFER_TYPE2.ARRAY_BUFFER = 34962] = "ARRAY_BUFFER", BUFFER_TYPE2[BUFFER_TYPE2.UNIFORM_BUFFER = 35345] = "UNIFORM_BUFFER", BUFFER_TYPE2))(BUFFER_TYPE || {});
exports.ALPHA_MODES = ALPHA_MODES;
exports.BLEND_MODES = BLEND_MODES;
exports.BUFFER_BITS = BUFFER_BITS;
exports.BUFFER_TYPE = BUFFER_TYPE;
exports.CLEAR_MODES = CLEAR_MODES;
exports.COLOR_MASK_BITS = COLOR_MASK_BITS;
exports.DRAW_MODES = DRAW_MODES;
exports.ENV = ENV;
exports.FORMATS = FORMATS;
exports.GC_MODES = GC_MODES;
exports.MASK_TYPES = MASK_TYPES;
exports.MIPMAP_MODES = MIPMAP_MODES;
exports.MSAA_QUALITY = MSAA_QUALITY;
exports.PRECISION = PRECISION;
exports.RENDERER_TYPE = RENDERER_TYPE;
exports.SAMPLER_TYPES = SAMPLER_TYPES;
exports.SCALE_MODES = SCALE_MODES;
exports.TARGETS = TARGETS;
exports.TYPES = TYPES;
exports.WRAP_MODES = WRAP_MODES;


},{}],32:[function(require,module,exports){
"use strict";


},{}],33:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), extensions = require("@pixi/extensions"), math = require("@pixi/math"), settings = require("@pixi/settings"), utils = require("@pixi/utils"), UniformGroup = require("./shader/UniformGroup.js"), SystemManager = require("./system/SystemManager.js");
const _Renderer = class _Renderer2 extends SystemManager.SystemManager {
  /**
   * @param {PIXI.IRendererOptions} [options] - See {@link PIXI.settings.RENDER_OPTIONS} for defaults.
   */
  constructor(options) {
    super(), this.type = constants.RENDERER_TYPE.WEBGL, options = Object.assign({}, settings.settings.RENDER_OPTIONS, options), this.gl = null, this.CONTEXT_UID = 0, this.globalUniforms = new UniformGroup.UniformGroup({
      projectionMatrix: new math.Matrix()
    }, !0);
    const systemConfig = {
      runners: [
        "init",
        "destroy",
        "contextChange",
        "resolutionChange",
        "reset",
        "update",
        "postrender",
        "prerender",
        "resize"
      ],
      systems: _Renderer2.__systems,
      priority: [
        "_view",
        "textureGenerator",
        "background",
        "_plugin",
        "startup",
        // low level WebGL systems
        "context",
        "state",
        "texture",
        "buffer",
        "geometry",
        "framebuffer",
        "transformFeedback",
        // high level pixi specific rendering
        "mask",
        "scissor",
        "stencil",
        "projection",
        "textureGC",
        "filter",
        "renderTexture",
        "batch",
        "objectRenderer",
        "_multisample"
      ]
    };
    this.setup(systemConfig), "useContextAlpha" in options && (utils.deprecation("7.0.0", "options.useContextAlpha is deprecated, use options.premultipliedAlpha and options.backgroundAlpha instead"), options.premultipliedAlpha = options.useContextAlpha && options.useContextAlpha !== "notMultiplied", options.backgroundAlpha = options.useContextAlpha === !1 ? 1 : options.backgroundAlpha), this._plugin.rendererPlugins = _Renderer2.__plugins, this.options = options, this.startup.run(this.options);
  }
  /**
   * Create renderer if WebGL is available. Overrideable
   * by the **@pixi/canvas-renderer** package to allow fallback.
   * throws error if WebGL is not available.
   * @param options
   * @private
   */
  static test(options) {
    return options?.forceCanvas ? !1 : utils.isWebGLSupported();
  }
  /**
   * Renders the object to its WebGL view.
   * @param displayObject - The object to be rendered.
   * @param {object} [options] - Object to use for render options.
   * @param {PIXI.RenderTexture} [options.renderTexture] - The render texture to render to.
   * @param {boolean} [options.clear=true] - Should the canvas be cleared before the new render.
   * @param {PIXI.Matrix} [options.transform] - A transform to apply to the render texture before rendering.
   * @param {boolean} [options.skipUpdateTransform=false] - Should we skip the update transform pass?
   */
  render(displayObject, options) {
    this.objectRenderer.render(displayObject, options);
  }
  /**
   * Resizes the WebGL view to the specified width and height.
   * @param desiredScreenWidth - The desired width of the screen.
   * @param desiredScreenHeight - The desired height of the screen.
   */
  resize(desiredScreenWidth, desiredScreenHeight) {
    this._view.resizeView(desiredScreenWidth, desiredScreenHeight);
  }
  /**
   * Resets the WebGL state so you can render things however you fancy!
   * @returns Returns itself.
   */
  reset() {
    return this.runners.reset.emit(), this;
  }
  /** Clear the frame buffer. */
  clear() {
    this.renderTexture.bind(), this.renderTexture.clear();
  }
  /**
   * Removes everything from the renderer (event listeners, spritebatch, etc...)
   * @param [removeView=false] - Removes the Canvas element from the DOM.
   *  See: https://github.com/pixijs/pixijs/issues/2233
   */
  destroy(removeView = !1) {
    this.runners.destroy.items.reverse(), this.emitWithCustomOptions(this.runners.destroy, {
      _view: removeView
    }), super.destroy();
  }
  /** Collection of plugins */
  get plugins() {
    return this._plugin.plugins;
  }
  /** The number of msaa samples of the canvas. */
  get multisample() {
    return this._multisample.multisample;
  }
  /**
   * Same as view.width, actual number of pixels in the canvas by horizontal.
   * @member {number}
   * @readonly
   * @default 800
   */
  get width() {
    return this._view.element.width;
  }
  /**
   * Same as view.height, actual number of pixels in the canvas by vertical.
   * @default 600
   */
  get height() {
    return this._view.element.height;
  }
  /** The resolution / device pixel ratio of the renderer. */
  get resolution() {
    return this._view.resolution;
  }
  set resolution(value) {
    this._view.resolution = value, this.runners.resolutionChange.emit(value);
  }
  /** Whether CSS dimensions of canvas view should be resized to screen dimensions automatically. */
  get autoDensity() {
    return this._view.autoDensity;
  }
  /** The canvas element that everything is drawn to.*/
  get view() {
    return this._view.element;
  }
  /**
   * Measurements of the screen. (0, 0, screenWidth, screenHeight).
   *
   * Its safe to use as filterArea or hitArea for the whole stage.
   * @member {PIXI.Rectangle}
   */
  get screen() {
    return this._view.screen;
  }
  /** the last object rendered by the renderer. Useful for other plugins like interaction managers */
  get lastObjectRendered() {
    return this.objectRenderer.lastObjectRendered;
  }
  /** Flag if we are rendering to the screen vs renderTexture */
  get renderingToScreen() {
    return this.objectRenderer.renderingToScreen;
  }
  /** When logging Pixi to the console, this is the name we will show */
  get rendererLogId() {
    return `WebGL ${this.context.webGLVersion}`;
  }
  /**
   * This sets weather the screen is totally cleared between each frame withthe background color and alpha
   * @deprecated since 7.0.0
   */
  get clearBeforeRender() {
    return utils.deprecation("7.0.0", "renderer.clearBeforeRender has been deprecated, please use renderer.background.clearBeforeRender instead."), this.background.clearBeforeRender;
  }
  /**
   * Pass-thru setting for the canvas' context `alpha` property. This is typically
   * not something you need to fiddle with. If you want transparency, use `backgroundAlpha`.
   * @deprecated since 7.0.0
   * @member {boolean}
   */
  get useContextAlpha() {
    return utils.deprecation("7.0.0", "renderer.useContextAlpha has been deprecated, please use renderer.context.premultipliedAlpha instead."), this.context.useContextAlpha;
  }
  /**
   * readonly drawing buffer preservation
   * we can only know this if Pixi created the context
   * @deprecated since 7.0.0
   */
  get preserveDrawingBuffer() {
    return utils.deprecation("7.0.0", "renderer.preserveDrawingBuffer has been deprecated, we cannot truly know this unless pixi created the context"), this.context.preserveDrawingBuffer;
  }
  /**
   * The background color to fill if not transparent
   * @member {number}
   * @deprecated since 7.0.0
   */
  get backgroundColor() {
    return utils.deprecation("7.0.0", "renderer.backgroundColor has been deprecated, use renderer.background.color instead."), this.background.color;
  }
  set backgroundColor(value) {
    utils.deprecation("7.0.0", "renderer.backgroundColor has been deprecated, use renderer.background.color instead."), this.background.color = value;
  }
  /**
   * The background color alpha. Setting this to 0 will make the canvas transparent.
   * @member {number}
   * @deprecated since 7.0.0
   */
  get backgroundAlpha() {
    return utils.deprecation("7.0.0", "renderer.backgroundAlpha has been deprecated, use renderer.background.alpha instead."), this.background.alpha;
  }
  /**
   * @deprecated since 7.0.0
   */
  set backgroundAlpha(value) {
    utils.deprecation("7.0.0", "renderer.backgroundAlpha has been deprecated, use renderer.background.alpha instead."), this.background.alpha = value;
  }
  /**
   * @deprecated since 7.0.0
   */
  get powerPreference() {
    return utils.deprecation("7.0.0", "renderer.powerPreference has been deprecated, we can only know this if pixi creates the context"), this.context.powerPreference;
  }
  /**
   * Useful function that returns a texture of the display object that can then be used to create sprites
   * This can be quite useful if your displayObject is complicated and needs to be reused multiple times.
   * @param displayObject - The displayObject the object will be generated from.
   * @param {IGenerateTextureOptions} options - Generate texture options.
   * @param {PIXI.Rectangle} options.region - The region of the displayObject, that shall be rendered,
   *        if no region is specified, defaults to the local bounds of the displayObject.
   * @param {number} [options.resolution] - If not given, the renderer's resolution is used.
   * @param {PIXI.MSAA_QUALITY} [options.multisample] - If not given, the renderer's multisample is used.
   * @returns A texture of the graphics object.
   */
  generateTexture(displayObject, options) {
    return this.textureGenerator.generateTexture(displayObject, options);
  }
};
_Renderer.extension = {
  type: extensions.ExtensionType.Renderer,
  priority: 1
}, /**
* Collection of installed plugins. These are included by default in PIXI, but can be excluded
* by creating a custom build. Consult the README for more information about creating custom
* builds and excluding plugins.
* @private
*/
_Renderer.__plugins = {}, /**
* The collection of installed systems.
* @private
*/
_Renderer.__systems = {};
let Renderer = _Renderer;
extensions.extensions.handleByMap(extensions.ExtensionType.RendererPlugin, Renderer.__plugins);
extensions.extensions.handleByMap(extensions.ExtensionType.RendererSystem, Renderer.__systems);
extensions.extensions.add(Renderer);
exports.Renderer = Renderer;


},{"./shader/UniformGroup.js":91,"./system/SystemManager.js":116,"@pixi/constants":31,"@pixi/extensions":160,"@pixi/math":169,"@pixi/settings":180,"@pixi/utils":202}],34:[function(require,module,exports){
"use strict";
var extensions = require("@pixi/extensions");
const renderers = [];
extensions.extensions.handleByList(extensions.ExtensionType.Renderer, renderers);
function autoDetectRenderer(options) {
  for (const RendererType of renderers)
    if (RendererType.test(options))
      return new RendererType(options);
  throw new Error("Unable to auto-detect a suitable renderer.");
}
exports.autoDetectRenderer = autoDetectRenderer;


},{"@pixi/extensions":160}],35:[function(require,module,exports){
"use strict";
var color = require("@pixi/color"), extensions = require("@pixi/extensions");
class BackgroundSystem {
  constructor() {
    this.clearBeforeRender = !0, this._backgroundColor = new color.Color(0), this.alpha = 1;
  }
  /**
   * initiates the background system
   * @param {PIXI.IRendererOptions} options - the options for the background colors
   */
  init(options) {
    this.clearBeforeRender = options.clearBeforeRender;
    const { backgroundColor, background, backgroundAlpha } = options, color2 = background ?? backgroundColor;
    color2 !== void 0 && (this.color = color2), this.alpha = backgroundAlpha;
  }
  /**
   * The background color to fill if not transparent.
   * @member {PIXI.ColorSource}
   */
  get color() {
    return this._backgroundColor.value;
  }
  set color(value) {
    this._backgroundColor.setValue(value);
  }
  /**
   * The background color alpha. Setting this to 0 will make the canvas transparent.
   * @member {number}
   */
  get alpha() {
    return this._backgroundColor.alpha;
  }
  set alpha(value) {
    this._backgroundColor.setAlpha(value);
  }
  /** The background color object. */
  get backgroundColor() {
    return this._backgroundColor;
  }
  destroy() {
  }
}
BackgroundSystem.defaultOptions = {
  /**
   * {@link PIXI.IRendererOptions.backgroundAlpha}
   * @default 1
   * @memberof PIXI.settings.RENDER_OPTIONS
   */
  backgroundAlpha: 1,
  /**
   * {@link PIXI.IRendererOptions.backgroundColor}
   * @default 0x000000
   * @memberof PIXI.settings.RENDER_OPTIONS
   */
  backgroundColor: 0,
  /**
   * {@link PIXI.IRendererOptions.clearBeforeRender}
   * @default true
   * @memberof PIXI.settings.RENDER_OPTIONS
   */
  clearBeforeRender: !0
}, /** @ignore */
BackgroundSystem.extension = {
  type: [
    extensions.ExtensionType.RendererSystem,
    extensions.ExtensionType.CanvasRendererSystem
  ],
  name: "background"
};
extensions.extensions.add(BackgroundSystem);
exports.BackgroundSystem = BackgroundSystem;


},{"@pixi/color":28,"@pixi/extensions":160}],36:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants");
class BatchDrawCall {
  constructor() {
    this.texArray = null, this.blend = 0, this.type = constants.DRAW_MODES.TRIANGLES, this.start = 0, this.size = 0, this.data = null;
  }
}
exports.BatchDrawCall = BatchDrawCall;


},{"@pixi/constants":31}],37:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), Buffer = require("../geometry/Buffer.js"), Geometry = require("../geometry/Geometry.js");
class BatchGeometry extends Geometry.Geometry {
  /**
   * @param {boolean} [_static=false] - Optimization flag, where `false`
   *        is updated every frame, `true` doesn't change frame-to-frame.
   */
  constructor(_static = !1) {
    super(), this._buffer = new Buffer.Buffer(null, _static, !1), this._indexBuffer = new Buffer.Buffer(null, _static, !0), this.addAttribute("aVertexPosition", this._buffer, 2, !1, constants.TYPES.FLOAT).addAttribute("aTextureCoord", this._buffer, 2, !1, constants.TYPES.FLOAT).addAttribute("aColor", this._buffer, 4, !0, constants.TYPES.UNSIGNED_BYTE).addAttribute("aTextureId", this._buffer, 1, !0, constants.TYPES.FLOAT).addIndex(this._indexBuffer);
  }
}
exports.BatchGeometry = BatchGeometry;


},{"../geometry/Buffer.js":65,"../geometry/Geometry.js":68,"@pixi/constants":31}],38:[function(require,module,exports){
"use strict";
var color = require("@pixi/color"), constants = require("@pixi/constants"), extensions = require("@pixi/extensions"), settings = require("@pixi/settings"), utils = require("@pixi/utils"), ViewableBuffer = require("../geometry/ViewableBuffer.js"), checkMaxIfStatementsInShader = require("../shader/utils/checkMaxIfStatementsInShader.js"), State = require("../state/State.js"), BaseTexture = require("../textures/BaseTexture.js"), BatchDrawCall = require("./BatchDrawCall.js"), BatchGeometry = require("./BatchGeometry.js"), BatchShaderGenerator = require("./BatchShaderGenerator.js"), BatchTextureArray = require("./BatchTextureArray.js"), canUploadSameBuffer = require("./canUploadSameBuffer.js"), maxRecommendedTextures = require("./maxRecommendedTextures.js"), ObjectRenderer = require("./ObjectRenderer.js"), texture$1 = require("./texture.frag.js"), texture = require("./texture.vert.js");
const _BatchRenderer = class _BatchRenderer2 extends ObjectRenderer.ObjectRenderer {
  /**
   * This will hook onto the renderer's `contextChange`
   * and `prerender` signals.
   * @param {PIXI.Renderer} renderer - The renderer this works for.
   */
  constructor(renderer) {
    super(renderer), this.setShaderGenerator(), this.geometryClass = BatchGeometry.BatchGeometry, this.vertexSize = 6, this.state = State.State.for2d(), this.size = _BatchRenderer2.defaultBatchSize * 4, this._vertexCount = 0, this._indexCount = 0, this._bufferedElements = [], this._bufferedTextures = [], this._bufferSize = 0, this._shader = null, this._packedGeometries = [], this._packedGeometryPoolSize = 2, this._flushId = 0, this._aBuffers = {}, this._iBuffers = {}, this.maxTextures = 1, this.renderer.on("prerender", this.onPrerender, this), renderer.runners.contextChange.add(this), this._dcIndex = 0, this._aIndex = 0, this._iIndex = 0, this._attributeBuffer = null, this._indexBuffer = null, this._tempBoundTextures = [];
  }
  /**
   * The maximum textures that this device supports.
   * @static
   * @default 32
   */
  static get defaultMaxTextures() {
    return this._defaultMaxTextures = this._defaultMaxTextures ?? maxRecommendedTextures.maxRecommendedTextures(32), this._defaultMaxTextures;
  }
  static set defaultMaxTextures(value) {
    this._defaultMaxTextures = value;
  }
  /**
   * Can we upload the same buffer in a single frame?
   * @static
   */
  static get canUploadSameBuffer() {
    return this._canUploadSameBuffer = this._canUploadSameBuffer ?? canUploadSameBuffer.canUploadSameBuffer(), this._canUploadSameBuffer;
  }
  static set canUploadSameBuffer(value) {
    this._canUploadSameBuffer = value;
  }
  /**
   * @see PIXI.BatchRenderer#maxTextures
   * @deprecated since 7.1.0
   * @readonly
   */
  get MAX_TEXTURES() {
    return utils.deprecation("7.1.0", "BatchRenderer#MAX_TEXTURES renamed to BatchRenderer#maxTextures"), this.maxTextures;
  }
  /**
   * The default vertex shader source
   * @readonly
   */
  static get defaultVertexSrc() {
    return texture.default;
  }
  /**
   * The default fragment shader source
   * @readonly
   */
  static get defaultFragmentTemplate() {
    return texture$1.default;
  }
  /**
   * Set the shader generator.
   * @param {object} [options]
   * @param {string} [options.vertex=PIXI.BatchRenderer.defaultVertexSrc] - Vertex shader source
   * @param {string} [options.fragment=PIXI.BatchRenderer.defaultFragmentTemplate] - Fragment shader template
   */
  setShaderGenerator({
    vertex = _BatchRenderer2.defaultVertexSrc,
    fragment = _BatchRenderer2.defaultFragmentTemplate
  } = {}) {
    this.shaderGenerator = new BatchShaderGenerator.BatchShaderGenerator(vertex, fragment);
  }
  /**
   * Handles the `contextChange` signal.
   *
   * It calculates `this.maxTextures` and allocating the packed-geometry object pool.
   */
  contextChange() {
    const gl = this.renderer.gl;
    settings.settings.PREFER_ENV === constants.ENV.WEBGL_LEGACY ? this.maxTextures = 1 : (this.maxTextures = Math.min(
      gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
      _BatchRenderer2.defaultMaxTextures
    ), this.maxTextures = checkMaxIfStatementsInShader.checkMaxIfStatementsInShader(
      this.maxTextures,
      gl
    )), this._shader = this.shaderGenerator.generateShader(this.maxTextures);
    for (let i = 0; i < this._packedGeometryPoolSize; i++)
      this._packedGeometries[i] = new this.geometryClass();
    this.initFlushBuffers();
  }
  /** Makes sure that static and dynamic flush pooled objects have correct dimensions. */
  initFlushBuffers() {
    const {
      _drawCallPool,
      _textureArrayPool
    } = _BatchRenderer2, MAX_SPRITES = this.size / 4, MAX_TA = Math.floor(MAX_SPRITES / this.maxTextures) + 1;
    for (; _drawCallPool.length < MAX_SPRITES; )
      _drawCallPool.push(new BatchDrawCall.BatchDrawCall());
    for (; _textureArrayPool.length < MAX_TA; )
      _textureArrayPool.push(new BatchTextureArray.BatchTextureArray());
    for (let i = 0; i < this.maxTextures; i++)
      this._tempBoundTextures[i] = null;
  }
  /** Handles the `prerender` signal. It ensures that flushes start from the first geometry object again. */
  onPrerender() {
    this._flushId = 0;
  }
  /**
   * Buffers the "batchable" object. It need not be rendered immediately.
   * @param {PIXI.DisplayObject} element - the element to render when
   *    using this renderer
   */
  render(element) {
    element._texture.valid && (this._vertexCount + element.vertexData.length / 2 > this.size && this.flush(), this._vertexCount += element.vertexData.length / 2, this._indexCount += element.indices.length, this._bufferedTextures[this._bufferSize] = element._texture.baseTexture, this._bufferedElements[this._bufferSize++] = element);
  }
  buildTexturesAndDrawCalls() {
    const {
      _bufferedTextures: textures,
      maxTextures
    } = this, textureArrays = _BatchRenderer2._textureArrayPool, batch = this.renderer.batch, boundTextures = this._tempBoundTextures, touch = this.renderer.textureGC.count;
    let TICK = ++BaseTexture.BaseTexture._globalBatch, countTexArrays = 0, texArray = textureArrays[0], start = 0;
    batch.copyBoundTextures(boundTextures, maxTextures);
    for (let i = 0; i < this._bufferSize; ++i) {
      const tex = textures[i];
      textures[i] = null, tex._batchEnabled !== TICK && (texArray.count >= maxTextures && (batch.boundArray(texArray, boundTextures, TICK, maxTextures), this.buildDrawCalls(texArray, start, i), start = i, texArray = textureArrays[++countTexArrays], ++TICK), tex._batchEnabled = TICK, tex.touched = touch, texArray.elements[texArray.count++] = tex);
    }
    texArray.count > 0 && (batch.boundArray(texArray, boundTextures, TICK, maxTextures), this.buildDrawCalls(texArray, start, this._bufferSize), ++countTexArrays, ++TICK);
    for (let i = 0; i < boundTextures.length; i++)
      boundTextures[i] = null;
    BaseTexture.BaseTexture._globalBatch = TICK;
  }
  /**
   * Populating drawcalls for rendering
   * @param texArray
   * @param start
   * @param finish
   */
  buildDrawCalls(texArray, start, finish) {
    const {
      _bufferedElements: elements,
      _attributeBuffer,
      _indexBuffer,
      vertexSize
    } = this, drawCalls = _BatchRenderer2._drawCallPool;
    let dcIndex = this._dcIndex, aIndex = this._aIndex, iIndex = this._iIndex, drawCall = drawCalls[dcIndex];
    drawCall.start = this._iIndex, drawCall.texArray = texArray;
    for (let i = start; i < finish; ++i) {
      const sprite = elements[i], tex = sprite._texture.baseTexture, spriteBlendMode = utils.premultiplyBlendMode[tex.alphaMode ? 1 : 0][sprite.blendMode];
      elements[i] = null, start < i && drawCall.blend !== spriteBlendMode && (drawCall.size = iIndex - drawCall.start, start = i, drawCall = drawCalls[++dcIndex], drawCall.texArray = texArray, drawCall.start = iIndex), this.packInterleavedGeometry(sprite, _attributeBuffer, _indexBuffer, aIndex, iIndex), aIndex += sprite.vertexData.length / 2 * vertexSize, iIndex += sprite.indices.length, drawCall.blend = spriteBlendMode;
    }
    start < finish && (drawCall.size = iIndex - drawCall.start, ++dcIndex), this._dcIndex = dcIndex, this._aIndex = aIndex, this._iIndex = iIndex;
  }
  /**
   * Bind textures for current rendering
   * @param texArray
   */
  bindAndClearTexArray(texArray) {
    const textureSystem = this.renderer.texture;
    for (let j = 0; j < texArray.count; j++)
      textureSystem.bind(texArray.elements[j], texArray.ids[j]), texArray.elements[j] = null;
    texArray.count = 0;
  }
  updateGeometry() {
    const {
      _packedGeometries: packedGeometries,
      _attributeBuffer: attributeBuffer,
      _indexBuffer: indexBuffer
    } = this;
    _BatchRenderer2.canUploadSameBuffer ? (packedGeometries[this._flushId]._buffer.update(attributeBuffer.rawBinaryData), packedGeometries[this._flushId]._indexBuffer.update(indexBuffer), this.renderer.geometry.updateBuffers()) : (this._packedGeometryPoolSize <= this._flushId && (this._packedGeometryPoolSize++, packedGeometries[this._flushId] = new this.geometryClass()), packedGeometries[this._flushId]._buffer.update(attributeBuffer.rawBinaryData), packedGeometries[this._flushId]._indexBuffer.update(indexBuffer), this.renderer.geometry.bind(packedGeometries[this._flushId]), this.renderer.geometry.updateBuffers(), this._flushId++);
  }
  drawBatches() {
    const dcCount = this._dcIndex, { gl, state: stateSystem } = this.renderer, drawCalls = _BatchRenderer2._drawCallPool;
    let curTexArray = null;
    for (let i = 0; i < dcCount; i++) {
      const { texArray, type, size, start, blend } = drawCalls[i];
      curTexArray !== texArray && (curTexArray = texArray, this.bindAndClearTexArray(texArray)), this.state.blendMode = blend, stateSystem.set(this.state), gl.drawElements(type, size, gl.UNSIGNED_SHORT, start * 2);
    }
  }
  /** Renders the content _now_ and empties the current batch. */
  flush() {
    this._vertexCount !== 0 && (this._attributeBuffer = this.getAttributeBuffer(this._vertexCount), this._indexBuffer = this.getIndexBuffer(this._indexCount), this._aIndex = 0, this._iIndex = 0, this._dcIndex = 0, this.buildTexturesAndDrawCalls(), this.updateGeometry(), this.drawBatches(), this._bufferSize = 0, this._vertexCount = 0, this._indexCount = 0);
  }
  /** Starts a new sprite batch. */
  start() {
    this.renderer.state.set(this.state), this.renderer.texture.ensureSamplerType(this.maxTextures), this.renderer.shader.bind(this._shader), _BatchRenderer2.canUploadSameBuffer && this.renderer.geometry.bind(this._packedGeometries[this._flushId]);
  }
  /** Stops and flushes the current batch. */
  stop() {
    this.flush();
  }
  /** Destroys this `BatchRenderer`. It cannot be used again. */
  destroy() {
    for (let i = 0; i < this._packedGeometryPoolSize; i++)
      this._packedGeometries[i] && this._packedGeometries[i].destroy();
    this.renderer.off("prerender", this.onPrerender, this), this._aBuffers = null, this._iBuffers = null, this._packedGeometries = null, this._attributeBuffer = null, this._indexBuffer = null, this._shader && (this._shader.destroy(), this._shader = null), super.destroy();
  }
  /**
   * Fetches an attribute buffer from `this._aBuffers` that can hold atleast `size` floats.
   * @param size - minimum capacity required
   * @returns - buffer than can hold atleast `size` floats
   */
  getAttributeBuffer(size) {
    const roundedP2 = utils.nextPow2(Math.ceil(size / 8)), roundedSizeIndex = utils.log2(roundedP2), roundedSize = roundedP2 * 8;
    this._aBuffers.length <= roundedSizeIndex && (this._iBuffers.length = roundedSizeIndex + 1);
    let buffer = this._aBuffers[roundedSize];
    return buffer || (this._aBuffers[roundedSize] = buffer = new ViewableBuffer.ViewableBuffer(roundedSize * this.vertexSize * 4)), buffer;
  }
  /**
   * Fetches an index buffer from `this._iBuffers` that can
   * have at least `size` capacity.
   * @param size - minimum required capacity
   * @returns - buffer that can fit `size` indices.
   */
  getIndexBuffer(size) {
    const roundedP2 = utils.nextPow2(Math.ceil(size / 12)), roundedSizeIndex = utils.log2(roundedP2), roundedSize = roundedP2 * 12;
    this._iBuffers.length <= roundedSizeIndex && (this._iBuffers.length = roundedSizeIndex + 1);
    let buffer = this._iBuffers[roundedSizeIndex];
    return buffer || (this._iBuffers[roundedSizeIndex] = buffer = new Uint16Array(roundedSize)), buffer;
  }
  /**
   * Takes the four batching parameters of `element`, interleaves
   * and pushes them into the batching attribute/index buffers given.
   *
   * It uses these properties: `vertexData` `uvs`, `textureId` and
   * `indicies`. It also uses the "tint" of the base-texture, if
   * present.
   * @param {PIXI.DisplayObject} element - element being rendered
   * @param attributeBuffer - attribute buffer.
   * @param indexBuffer - index buffer
   * @param aIndex - number of floats already in the attribute buffer
   * @param iIndex - number of indices already in `indexBuffer`
   */
  packInterleavedGeometry(element, attributeBuffer, indexBuffer, aIndex, iIndex) {
    const {
      uint32View,
      float32View
    } = attributeBuffer, packedVertices = aIndex / this.vertexSize, uvs = element.uvs, indicies = element.indices, vertexData = element.vertexData, textureId = element._texture.baseTexture._batchLocation, alpha = Math.min(element.worldAlpha, 1), argb = color.Color.shared.setValue(element._tintRGB).toPremultiplied(alpha, element._texture.baseTexture.alphaMode > 0);
    for (let i = 0; i < vertexData.length; i += 2)
      float32View[aIndex++] = vertexData[i], float32View[aIndex++] = vertexData[i + 1], float32View[aIndex++] = uvs[i], float32View[aIndex++] = uvs[i + 1], uint32View[aIndex++] = argb, float32View[aIndex++] = textureId;
    for (let i = 0; i < indicies.length; i++)
      indexBuffer[iIndex++] = packedVertices + indicies[i];
  }
};
_BatchRenderer.defaultBatchSize = 4096, /** @ignore */
_BatchRenderer.extension = {
  name: "batch",
  type: extensions.ExtensionType.RendererPlugin
}, /**
* Pool of `BatchDrawCall` objects that `flush` used
* to create "batches" of the objects being rendered.
*
* These are never re-allocated again.
* Shared between all batch renderers because it can be only one "flush" working at the moment.
* @member {PIXI.BatchDrawCall[]}
*/
_BatchRenderer._drawCallPool = [], /**
* Pool of `BatchDrawCall` objects that `flush` used
* to create "batches" of the objects being rendered.
*
* These are never re-allocated again.
* Shared between all batch renderers because it can be only one "flush" working at the moment.
* @member {PIXI.BatchTextureArray[]}
*/
_BatchRenderer._textureArrayPool = [];
let BatchRenderer = _BatchRenderer;
extensions.extensions.add(BatchRenderer);
exports.BatchRenderer = BatchRenderer;


},{"../geometry/ViewableBuffer.js":70,"../shader/utils/checkMaxIfStatementsInShader.js":94,"../state/State.js":112,"../textures/BaseTexture.js":118,"./BatchDrawCall.js":36,"./BatchGeometry.js":37,"./BatchShaderGenerator.js":39,"./BatchTextureArray.js":41,"./ObjectRenderer.js":42,"./canUploadSameBuffer.js":43,"./maxRecommendedTextures.js":44,"./texture.frag.js":45,"./texture.vert.js":46,"@pixi/color":28,"@pixi/constants":31,"@pixi/extensions":160,"@pixi/settings":180,"@pixi/utils":202}],39:[function(require,module,exports){
"use strict";
var math = require("@pixi/math"), Program = require("../shader/Program.js"), Shader = require("../shader/Shader.js"), UniformGroup = require("../shader/UniformGroup.js");
class BatchShaderGenerator {
  /**
   * @param vertexSrc - Vertex shader
   * @param fragTemplate - Fragment shader template
   */
  constructor(vertexSrc, fragTemplate) {
    if (this.vertexSrc = vertexSrc, this.fragTemplate = fragTemplate, this.programCache = {}, this.defaultGroupCache = {}, !fragTemplate.includes("%count%"))
      throw new Error('Fragment template must contain "%count%".');
    if (!fragTemplate.includes("%forloop%"))
      throw new Error('Fragment template must contain "%forloop%".');
  }
  generateShader(maxTextures) {
    if (!this.programCache[maxTextures]) {
      const sampleValues = new Int32Array(maxTextures);
      for (let i = 0; i < maxTextures; i++)
        sampleValues[i] = i;
      this.defaultGroupCache[maxTextures] = UniformGroup.UniformGroup.from({ uSamplers: sampleValues }, !0);
      let fragmentSrc = this.fragTemplate;
      fragmentSrc = fragmentSrc.replace(/%count%/gi, `${maxTextures}`), fragmentSrc = fragmentSrc.replace(/%forloop%/gi, this.generateSampleSrc(maxTextures)), this.programCache[maxTextures] = new Program.Program(this.vertexSrc, fragmentSrc);
    }
    const uniforms = {
      tint: new Float32Array([1, 1, 1, 1]),
      translationMatrix: new math.Matrix(),
      default: this.defaultGroupCache[maxTextures]
    };
    return new Shader.Shader(this.programCache[maxTextures], uniforms);
  }
  generateSampleSrc(maxTextures) {
    let src = "";
    src += `
`, src += `
`;
    for (let i = 0; i < maxTextures; i++)
      i > 0 && (src += `
else `), i < maxTextures - 1 && (src += `if(vTextureId < ${i}.5)`), src += `
{`, src += `
	color = texture2D(uSamplers[${i}], vTextureCoord);`, src += `
}`;
    return src += `
`, src += `
`, src;
  }
}
exports.BatchShaderGenerator = BatchShaderGenerator;


},{"../shader/Program.js":88,"../shader/Shader.js":89,"../shader/UniformGroup.js":91,"@pixi/math":169}],40:[function(require,module,exports){
"use strict";
var extensions = require("@pixi/extensions"), ObjectRenderer = require("./ObjectRenderer.js");
class BatchSystem {
  /**
   * @param renderer - The renderer this System works for.
   */
  constructor(renderer) {
    this.renderer = renderer, this.emptyRenderer = new ObjectRenderer.ObjectRenderer(renderer), this.currentRenderer = this.emptyRenderer;
  }
  /**
   * Changes the current renderer to the one given in parameter
   * @param objectRenderer - The object renderer to use.
   */
  setObjectRenderer(objectRenderer) {
    this.currentRenderer !== objectRenderer && (this.currentRenderer.stop(), this.currentRenderer = objectRenderer, this.currentRenderer.start());
  }
  /**
   * This should be called if you wish to do some custom rendering
   * It will basically render anything that may be batched up such as sprites
   */
  flush() {
    this.setObjectRenderer(this.emptyRenderer);
  }
  /** Reset the system to an empty renderer */
  reset() {
    this.setObjectRenderer(this.emptyRenderer);
  }
  /**
   * Handy function for batch renderers: copies bound textures in first maxTextures locations to array
   * sets actual _batchLocation for them
   * @param arr - arr copy destination
   * @param maxTextures - number of copied elements
   */
  copyBoundTextures(arr, maxTextures) {
    const { boundTextures } = this.renderer.texture;
    for (let i = maxTextures - 1; i >= 0; --i)
      arr[i] = boundTextures[i] || null, arr[i] && (arr[i]._batchLocation = i);
  }
  /**
   * Assigns batch locations to textures in array based on boundTextures state.
   * All textures in texArray should have `_batchEnabled = _batchId`,
   * and their count should be less than `maxTextures`.
   * @param texArray - textures to bound
   * @param boundTextures - current state of bound textures
   * @param batchId - marker for _batchEnabled param of textures in texArray
   * @param maxTextures - number of texture locations to manipulate
   */
  boundArray(texArray, boundTextures, batchId, maxTextures) {
    const { elements, ids, count } = texArray;
    let j = 0;
    for (let i = 0; i < count; i++) {
      const tex = elements[i], loc = tex._batchLocation;
      if (loc >= 0 && loc < maxTextures && boundTextures[loc] === tex) {
        ids[i] = loc;
        continue;
      }
      for (; j < maxTextures; ) {
        const bound = boundTextures[j];
        if (bound && bound._batchEnabled === batchId && bound._batchLocation === j) {
          j++;
          continue;
        }
        ids[i] = j, tex._batchLocation = j, boundTextures[j] = tex;
        break;
      }
    }
  }
  /**
   * @ignore
   */
  destroy() {
    this.renderer = null;
  }
}
BatchSystem.extension = {
  type: extensions.ExtensionType.RendererSystem,
  name: "batch"
};
extensions.extensions.add(BatchSystem);
exports.BatchSystem = BatchSystem;


},{"./ObjectRenderer.js":42,"@pixi/extensions":160}],41:[function(require,module,exports){
"use strict";
class BatchTextureArray {
  constructor() {
    this.elements = [], this.ids = [], this.count = 0;
  }
  clear() {
    for (let i = 0; i < this.count; i++)
      this.elements[i] = null;
    this.count = 0;
  }
}
exports.BatchTextureArray = BatchTextureArray;


},{}],42:[function(require,module,exports){
"use strict";
class ObjectRenderer {
  /**
   * @param renderer - The renderer this manager works for.
   */
  constructor(renderer) {
    this.renderer = renderer;
  }
  /** Stub method that should be used to empty the current batch by rendering objects now. */
  flush() {
  }
  /** Generic destruction method that frees all resources. This should be called by subclasses. */
  destroy() {
    this.renderer = null;
  }
  /**
   * Stub method that initializes any state required before
   * rendering starts. It is different from the `prerender`
   * signal, which occurs every frame, in that it is called
   * whenever an object requests _this_ renderer specifically.
   */
  start() {
  }
  /** Stops the renderer. It should free up any state and become dormant. */
  stop() {
    this.flush();
  }
  /**
   * Keeps the object to render. It doesn't have to be
   * rendered immediately.
   * @param {PIXI.DisplayObject} _object - The object to render.
   */
  render(_object) {
  }
}
exports.ObjectRenderer = ObjectRenderer;


},{}],43:[function(require,module,exports){
"use strict";
var settings = require("@pixi/settings");
function canUploadSameBuffer() {
  return !settings.isMobile.apple.device;
}
exports.canUploadSameBuffer = canUploadSameBuffer;


},{"@pixi/settings":180}],44:[function(require,module,exports){
"use strict";
var settings = require("@pixi/settings");
function maxRecommendedTextures(max) {
  let allowMax = !0;
  const navigator = settings.settings.ADAPTER.getNavigator();
  if (settings.isMobile.tablet || settings.isMobile.phone) {
    if (settings.isMobile.apple.device) {
      const match = navigator.userAgent.match(/OS (\d+)_(\d+)?/);
      match && parseInt(match[1], 10) < 11 && (allowMax = !1);
    }
    if (settings.isMobile.android.device) {
      const match = navigator.userAgent.match(/Android\s([0-9.]*)/);
      match && parseInt(match[1], 10) < 7 && (allowMax = !1);
    }
  }
  return allowMax ? max : 4;
}
exports.maxRecommendedTextures = maxRecommendedTextures;


},{"@pixi/settings":180}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
var defaultFragment = `varying vec2 vTextureCoord;
varying vec4 vColor;
varying float vTextureId;
uniform sampler2D uSamplers[%count%];

void main(void){
    vec4 color;
    %forloop%
    gl_FragColor = color * vColor;
}
`;
exports.default = defaultFragment;


},{}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
var defaultVertex = `precision highp float;
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;
attribute float aTextureId;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform vec4 tint;

varying vec2 vTextureCoord;
varying vec4 vColor;
varying float vTextureId;

void main(void){
    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    vTextureCoord = aTextureCoord;
    vTextureId = aTextureId;
    vColor = aColor * tint;
}
`;
exports.default = defaultVertex;


},{}],47:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), extensions = require("@pixi/extensions"), settings = require("@pixi/settings");
let CONTEXT_UID_COUNTER = 0;
class ContextSystem {
  /** @param renderer - The renderer this System works for. */
  constructor(renderer) {
    this.renderer = renderer, this.webGLVersion = 1, this.extensions = {}, this.supports = {
      uint32Indices: !1
    }, this.handleContextLost = this.handleContextLost.bind(this), this.handleContextRestored = this.handleContextRestored.bind(this);
  }
  /**
   * `true` if the context is lost
   * @readonly
   */
  get isLost() {
    return !this.gl || this.gl.isContextLost();
  }
  /**
   * Handles the context change event.
   * @param {WebGLRenderingContext} gl - New WebGL context.
   */
  contextChange(gl) {
    this.gl = gl, this.renderer.gl = gl, this.renderer.CONTEXT_UID = CONTEXT_UID_COUNTER++;
  }
  init(options) {
    if (options.context)
      this.initFromContext(options.context);
    else {
      const alpha = this.renderer.background.alpha < 1, premultipliedAlpha = options.premultipliedAlpha;
      this.preserveDrawingBuffer = options.preserveDrawingBuffer, this.useContextAlpha = options.useContextAlpha, this.powerPreference = options.powerPreference, this.initFromOptions({
        alpha,
        premultipliedAlpha,
        antialias: options.antialias,
        stencil: !0,
        preserveDrawingBuffer: options.preserveDrawingBuffer,
        powerPreference: options.powerPreference
      });
    }
  }
  /**
   * Initializes the context.
   * @protected
   * @param {WebGLRenderingContext} gl - WebGL context
   */
  initFromContext(gl) {
    this.gl = gl, this.validateContext(gl), this.renderer.gl = gl, this.renderer.CONTEXT_UID = CONTEXT_UID_COUNTER++, this.renderer.runners.contextChange.emit(gl);
    const view = this.renderer.view;
    view.addEventListener !== void 0 && (view.addEventListener("webglcontextlost", this.handleContextLost, !1), view.addEventListener("webglcontextrestored", this.handleContextRestored, !1));
  }
  /**
   * Initialize from context options
   * @protected
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
   * @param {object} options - context attributes
   */
  initFromOptions(options) {
    const gl = this.createContext(this.renderer.view, options);
    this.initFromContext(gl);
  }
  /**
   * Helper class to create a WebGL Context
   * @param canvas - the canvas element that we will get the context from
   * @param options - An options object that gets passed in to the canvas element containing the
   *    context attributes
   * @see https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement/getContext
   * @returns {WebGLRenderingContext} the WebGL context
   */
  createContext(canvas, options) {
    let gl;
    if (settings.settings.PREFER_ENV >= constants.ENV.WEBGL2 && (gl = canvas.getContext("webgl2", options)), gl)
      this.webGLVersion = 2;
    else if (this.webGLVersion = 1, gl = canvas.getContext("webgl", options) || canvas.getContext("experimental-webgl", options), !gl)
      throw new Error("This browser does not support WebGL. Try using the canvas renderer");
    return this.gl = gl, this.getExtensions(), this.gl;
  }
  /** Auto-populate the {@link PIXI.ContextSystem.extensions extensions}. */
  getExtensions() {
    const { gl } = this, common = {
      loseContext: gl.getExtension("WEBGL_lose_context"),
      anisotropicFiltering: gl.getExtension("EXT_texture_filter_anisotropic"),
      floatTextureLinear: gl.getExtension("OES_texture_float_linear"),
      s3tc: gl.getExtension("WEBGL_compressed_texture_s3tc"),
      s3tc_sRGB: gl.getExtension("WEBGL_compressed_texture_s3tc_srgb"),
      // eslint-disable-line camelcase
      etc: gl.getExtension("WEBGL_compressed_texture_etc"),
      etc1: gl.getExtension("WEBGL_compressed_texture_etc1"),
      pvrtc: gl.getExtension("WEBGL_compressed_texture_pvrtc") || gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc"),
      atc: gl.getExtension("WEBGL_compressed_texture_atc"),
      astc: gl.getExtension("WEBGL_compressed_texture_astc")
    };
    this.webGLVersion === 1 ? Object.assign(this.extensions, common, {
      drawBuffers: gl.getExtension("WEBGL_draw_buffers"),
      depthTexture: gl.getExtension("WEBGL_depth_texture"),
      vertexArrayObject: gl.getExtension("OES_vertex_array_object") || gl.getExtension("MOZ_OES_vertex_array_object") || gl.getExtension("WEBKIT_OES_vertex_array_object"),
      uint32ElementIndex: gl.getExtension("OES_element_index_uint"),
      // Floats and half-floats
      floatTexture: gl.getExtension("OES_texture_float"),
      floatTextureLinear: gl.getExtension("OES_texture_float_linear"),
      textureHalfFloat: gl.getExtension("OES_texture_half_float"),
      textureHalfFloatLinear: gl.getExtension("OES_texture_half_float_linear")
    }) : this.webGLVersion === 2 && Object.assign(this.extensions, common, {
      // Floats and half-floats
      colorBufferFloat: gl.getExtension("EXT_color_buffer_float")
    });
  }
  /**
   * Handles a lost webgl context
   * @param {WebGLContextEvent} event - The context lost event.
   */
  handleContextLost(event) {
    event.preventDefault(), setTimeout(() => {
      this.gl.isContextLost() && this.extensions.loseContext && this.extensions.loseContext.restoreContext();
    }, 0);
  }
  /** Handles a restored webgl context. */
  handleContextRestored() {
    this.renderer.runners.contextChange.emit(this.gl);
  }
  destroy() {
    const view = this.renderer.view;
    this.renderer = null, view.removeEventListener !== void 0 && (view.removeEventListener("webglcontextlost", this.handleContextLost), view.removeEventListener("webglcontextrestored", this.handleContextRestored)), this.gl.useProgram(null), this.extensions.loseContext && this.extensions.loseContext.loseContext();
  }
  /** Handle the post-render runner event. */
  postrender() {
    this.renderer.objectRenderer.renderingToScreen && this.gl.flush();
  }
  /**
   * Validate context.
   * @param {WebGLRenderingContext} gl - Render context.
   */
  validateContext(gl) {
    const attributes = gl.getContextAttributes(), isWebGl2 = "WebGL2RenderingContext" in globalThis && gl instanceof globalThis.WebGL2RenderingContext;
    isWebGl2 && (this.webGLVersion = 2), attributes && !attributes.stencil && console.warn("Provided WebGL context does not have a stencil buffer, masks may not render correctly");
    const hasuint32 = isWebGl2 || !!gl.getExtension("OES_element_index_uint");
    this.supports.uint32Indices = hasuint32, hasuint32 || console.warn("Provided WebGL context does not support 32 index buffer, complex graphics may not render correctly");
  }
}
ContextSystem.defaultOptions = {
  /**
   * {@link PIXI.IRendererOptions.context}
   * @default null
   * @memberof PIXI.settings.RENDER_OPTIONS
   */
  context: null,
  /**
   * {@link PIXI.IRendererOptions.antialias}
   * @default false
   * @memberof PIXI.settings.RENDER_OPTIONS
   */
  antialias: !1,
  /**
   * {@link PIXI.IRendererOptions.premultipliedAlpha}
   * @default true
   * @memberof PIXI.settings.RENDER_OPTIONS
   */
  premultipliedAlpha: !0,
  /**
   * {@link PIXI.IRendererOptions.preserveDrawingBuffer}
   * @default false
   * @memberof PIXI.settings.RENDER_OPTIONS
   */
  preserveDrawingBuffer: !1,
  /**
   * {@link PIXI.IRendererOptions.powerPreference}
   * @default default
   * @memberof PIXI.settings.RENDER_OPTIONS
   */
  powerPreference: "default"
}, /** @ignore */
ContextSystem.extension = {
  type: extensions.ExtensionType.RendererSystem,
  name: "context"
};
extensions.extensions.add(ContextSystem);
exports.ContextSystem = ContextSystem;


},{"@pixi/constants":31,"@pixi/extensions":160,"@pixi/settings":180}],48:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), Program = require("../shader/Program.js"), Shader = require("../shader/Shader.js"), State = require("../state/State.js"), defaultFilter$1 = require("./defaultFilter.frag.js"), defaultFilter = require("./defaultFilter.vert.js");
const _Filter = class _Filter2 extends Shader.Shader {
  /**
   * @param vertexSrc - The source of the vertex shader.
   * @param fragmentSrc - The source of the fragment shader.
   * @param uniforms - Custom uniforms to use to augment the built-in ones.
   */
  constructor(vertexSrc, fragmentSrc, uniforms) {
    const program = Program.Program.from(
      vertexSrc || _Filter2.defaultVertexSrc,
      fragmentSrc || _Filter2.defaultFragmentSrc
    );
    super(program, uniforms), this.padding = 0, this.resolution = _Filter2.defaultResolution, this.multisample = _Filter2.defaultMultisample, this.enabled = !0, this.autoFit = !0, this.state = new State.State();
  }
  /**
   * Applies the filter
   * @param {PIXI.FilterSystem} filterManager - The renderer to retrieve the filter from
   * @param {PIXI.RenderTexture} input - The input render target.
   * @param {PIXI.RenderTexture} output - The target to output to.
   * @param {PIXI.CLEAR_MODES} [clearMode] - Should the output be cleared before rendering to it.
   * @param {object} [_currentState] - It's current state of filter.
   *        There are some useful properties in the currentState :
   *        target, filters, sourceFrame, destinationFrame, renderTarget, resolution
   */
  apply(filterManager, input, output, clearMode, _currentState) {
    filterManager.applyFilter(this, input, output, clearMode);
  }
  /**
   * Sets the blend mode of the filter.
   * @default PIXI.BLEND_MODES.NORMAL
   */
  get blendMode() {
    return this.state.blendMode;
  }
  set blendMode(value) {
    this.state.blendMode = value;
  }
  /**
   * The resolution of the filter. Setting this to be lower will lower the quality but
   * increase the performance of the filter.
   * If set to `null` or `0`, the resolution of the current render target is used.
   * @default PIXI.Filter.defaultResolution
   */
  get resolution() {
    return this._resolution;
  }
  set resolution(value) {
    this._resolution = value;
  }
  /**
   * The default vertex shader source
   * @readonly
   */
  static get defaultVertexSrc() {
    return defaultFilter.default;
  }
  /**
   * The default fragment shader source
   * @readonly
   */
  static get defaultFragmentSrc() {
    return defaultFilter$1.default;
  }
};
_Filter.defaultResolution = 1, /**
* Default filter samples for any filter.
* @static
* @type {PIXI.MSAA_QUALITY|null}
* @default PIXI.MSAA_QUALITY.NONE
*/
_Filter.defaultMultisample = constants.MSAA_QUALITY.NONE;
let Filter = _Filter;
exports.Filter = Filter;


},{"../shader/Program.js":88,"../shader/Shader.js":89,"../state/State.js":112,"./defaultFilter.frag.js":52,"./defaultFilter.vert.js":53,"@pixi/constants":31}],49:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), math = require("@pixi/math");
class FilterState {
  constructor() {
    this.renderTexture = null, this.target = null, this.legacy = !1, this.resolution = 1, this.multisample = constants.MSAA_QUALITY.NONE, this.sourceFrame = new math.Rectangle(), this.destinationFrame = new math.Rectangle(), this.bindingSourceFrame = new math.Rectangle(), this.bindingDestinationFrame = new math.Rectangle(), this.filters = [], this.transform = null;
  }
  /** Clears the state */
  clear() {
    this.target = null, this.filters = null, this.renderTexture = null;
  }
}
exports.FilterState = FilterState;


},{"@pixi/constants":31,"@pixi/math":169}],50:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), extensions = require("@pixi/extensions"), math = require("@pixi/math"), RenderTexturePool = require("../renderTexture/RenderTexturePool.js"), UniformGroup = require("../shader/UniformGroup.js"), Quad = require("../utils/Quad.js"), QuadUv = require("../utils/QuadUv.js"), FilterState = require("./FilterState.js");
const tempPoints = [new math.Point(), new math.Point(), new math.Point(), new math.Point()], tempMatrix = new math.Matrix();
class FilterSystem {
  /**
   * @param renderer - The renderer this System works for.
   */
  constructor(renderer) {
    this.renderer = renderer, this.defaultFilterStack = [{}], this.texturePool = new RenderTexturePool.RenderTexturePool(), this.statePool = [], this.quad = new Quad.Quad(), this.quadUv = new QuadUv.QuadUv(), this.tempRect = new math.Rectangle(), this.activeState = {}, this.globalUniforms = new UniformGroup.UniformGroup({
      outputFrame: new math.Rectangle(),
      inputSize: new Float32Array(4),
      inputPixel: new Float32Array(4),
      inputClamp: new Float32Array(4),
      resolution: 1,
      // legacy variables
      filterArea: new Float32Array(4),
      filterClamp: new Float32Array(4)
    }, !0), this.forceClear = !1, this.useMaxPadding = !1;
  }
  init() {
    this.texturePool.setScreenSize(this.renderer.view);
  }
  /**
   * Pushes a set of filters to be applied later to the system. This will redirect further rendering into an
   * input render-texture for the rest of the filtering pipeline.
   * @param {PIXI.DisplayObject} target - The target of the filter to render.
   * @param filters - The filters to apply.
   */
  push(target, filters) {
    const renderer = this.renderer, filterStack = this.defaultFilterStack, state = this.statePool.pop() || new FilterState.FilterState(), renderTextureSystem = renderer.renderTexture;
    let currentResolution, currentMultisample;
    if (renderTextureSystem.current) {
      const renderTexture = renderTextureSystem.current;
      currentResolution = renderTexture.resolution, currentMultisample = renderTexture.multisample;
    } else
      currentResolution = renderer.resolution, currentMultisample = renderer.multisample;
    let resolution = filters[0].resolution || currentResolution, multisample = filters[0].multisample ?? currentMultisample, padding = filters[0].padding, autoFit = filters[0].autoFit, legacy = filters[0].legacy ?? !0;
    for (let i = 1; i < filters.length; i++) {
      const filter = filters[i];
      resolution = Math.min(resolution, filter.resolution || currentResolution), multisample = Math.min(multisample, filter.multisample ?? currentMultisample), padding = this.useMaxPadding ? Math.max(padding, filter.padding) : padding + filter.padding, autoFit = autoFit && filter.autoFit, legacy = legacy || (filter.legacy ?? !0);
    }
    filterStack.length === 1 && (this.defaultFilterStack[0].renderTexture = renderTextureSystem.current), filterStack.push(state), state.resolution = resolution, state.multisample = multisample, state.legacy = legacy, state.target = target, state.sourceFrame.copyFrom(target.filterArea || target.getBounds(!0)), state.sourceFrame.pad(padding);
    const sourceFrameProjected = this.tempRect.copyFrom(renderTextureSystem.sourceFrame);
    renderer.projection.transform && this.transformAABB(
      tempMatrix.copyFrom(renderer.projection.transform).invert(),
      sourceFrameProjected
    ), autoFit ? (state.sourceFrame.fit(sourceFrameProjected), (state.sourceFrame.width <= 0 || state.sourceFrame.height <= 0) && (state.sourceFrame.width = 0, state.sourceFrame.height = 0)) : state.sourceFrame.intersects(sourceFrameProjected) || (state.sourceFrame.width = 0, state.sourceFrame.height = 0), this.roundFrame(
      state.sourceFrame,
      renderTextureSystem.current ? renderTextureSystem.current.resolution : renderer.resolution,
      renderTextureSystem.sourceFrame,
      renderTextureSystem.destinationFrame,
      renderer.projection.transform
    ), state.renderTexture = this.getOptimalFilterTexture(
      state.sourceFrame.width,
      state.sourceFrame.height,
      resolution,
      multisample
    ), state.filters = filters, state.destinationFrame.width = state.renderTexture.width, state.destinationFrame.height = state.renderTexture.height;
    const destinationFrame = this.tempRect;
    destinationFrame.x = 0, destinationFrame.y = 0, destinationFrame.width = state.sourceFrame.width, destinationFrame.height = state.sourceFrame.height, state.renderTexture.filterFrame = state.sourceFrame, state.bindingSourceFrame.copyFrom(renderTextureSystem.sourceFrame), state.bindingDestinationFrame.copyFrom(renderTextureSystem.destinationFrame), state.transform = renderer.projection.transform, renderer.projection.transform = null, renderTextureSystem.bind(state.renderTexture, state.sourceFrame, destinationFrame), renderer.framebuffer.clear(0, 0, 0, 0);
  }
  /** Pops off the filter and applies it. */
  pop() {
    const filterStack = this.defaultFilterStack, state = filterStack.pop(), filters = state.filters;
    this.activeState = state;
    const globalUniforms = this.globalUniforms.uniforms;
    globalUniforms.outputFrame = state.sourceFrame, globalUniforms.resolution = state.resolution;
    const inputSize = globalUniforms.inputSize, inputPixel = globalUniforms.inputPixel, inputClamp = globalUniforms.inputClamp;
    if (inputSize[0] = state.destinationFrame.width, inputSize[1] = state.destinationFrame.height, inputSize[2] = 1 / inputSize[0], inputSize[3] = 1 / inputSize[1], inputPixel[0] = Math.round(inputSize[0] * state.resolution), inputPixel[1] = Math.round(inputSize[1] * state.resolution), inputPixel[2] = 1 / inputPixel[0], inputPixel[3] = 1 / inputPixel[1], inputClamp[0] = 0.5 * inputPixel[2], inputClamp[1] = 0.5 * inputPixel[3], inputClamp[2] = state.sourceFrame.width * inputSize[2] - 0.5 * inputPixel[2], inputClamp[3] = state.sourceFrame.height * inputSize[3] - 0.5 * inputPixel[3], state.legacy) {
      const filterArea = globalUniforms.filterArea;
      filterArea[0] = state.destinationFrame.width, filterArea[1] = state.destinationFrame.height, filterArea[2] = state.sourceFrame.x, filterArea[3] = state.sourceFrame.y, globalUniforms.filterClamp = globalUniforms.inputClamp;
    }
    this.globalUniforms.update();
    const lastState = filterStack[filterStack.length - 1];
    if (this.renderer.framebuffer.blit(), filters.length === 1)
      filters[0].apply(this, state.renderTexture, lastState.renderTexture, constants.CLEAR_MODES.BLEND, state), this.returnFilterTexture(state.renderTexture);
    else {
      let flip = state.renderTexture, flop = this.getOptimalFilterTexture(
        flip.width,
        flip.height,
        state.resolution
      );
      flop.filterFrame = flip.filterFrame;
      let i = 0;
      for (i = 0; i < filters.length - 1; ++i) {
        i === 1 && state.multisample > 1 && (flop = this.getOptimalFilterTexture(
          flip.width,
          flip.height,
          state.resolution
        ), flop.filterFrame = flip.filterFrame), filters[i].apply(this, flip, flop, constants.CLEAR_MODES.CLEAR, state);
        const t = flip;
        flip = flop, flop = t;
      }
      filters[i].apply(this, flip, lastState.renderTexture, constants.CLEAR_MODES.BLEND, state), i > 1 && state.multisample > 1 && this.returnFilterTexture(state.renderTexture), this.returnFilterTexture(flip), this.returnFilterTexture(flop);
    }
    state.clear(), this.statePool.push(state);
  }
  /**
   * Binds a renderTexture with corresponding `filterFrame`, clears it if mode corresponds.
   * @param filterTexture - renderTexture to bind, should belong to filter pool or filter stack
   * @param clearMode - clearMode, by default its CLEAR/YES. See {@link PIXI.CLEAR_MODES}
   */
  bindAndClear(filterTexture, clearMode = constants.CLEAR_MODES.CLEAR) {
    const {
      renderTexture: renderTextureSystem,
      state: stateSystem
    } = this.renderer;
    if (filterTexture === this.defaultFilterStack[this.defaultFilterStack.length - 1].renderTexture ? this.renderer.projection.transform = this.activeState.transform : this.renderer.projection.transform = null, filterTexture?.filterFrame) {
      const destinationFrame = this.tempRect;
      destinationFrame.x = 0, destinationFrame.y = 0, destinationFrame.width = filterTexture.filterFrame.width, destinationFrame.height = filterTexture.filterFrame.height, renderTextureSystem.bind(filterTexture, filterTexture.filterFrame, destinationFrame);
    } else
      filterTexture !== this.defaultFilterStack[this.defaultFilterStack.length - 1].renderTexture ? renderTextureSystem.bind(filterTexture) : this.renderer.renderTexture.bind(
        filterTexture,
        this.activeState.bindingSourceFrame,
        this.activeState.bindingDestinationFrame
      );
    const autoClear = stateSystem.stateId & 1 || this.forceClear;
    (clearMode === constants.CLEAR_MODES.CLEAR || clearMode === constants.CLEAR_MODES.BLIT && autoClear) && this.renderer.framebuffer.clear(0, 0, 0, 0);
  }
  /**
   * Draws a filter using the default rendering process.
   *
   * This should be called only by {@link PIXI.Filter#apply}.
   * @param filter - The filter to draw.
   * @param input - The input render target.
   * @param output - The target to output to.
   * @param clearMode - Should the output be cleared before rendering to it
   */
  applyFilter(filter, input, output, clearMode) {
    const renderer = this.renderer;
    renderer.state.set(filter.state), this.bindAndClear(output, clearMode), filter.uniforms.uSampler = input, filter.uniforms.filterGlobals = this.globalUniforms, renderer.shader.bind(filter), filter.legacy = !!filter.program.attributeData.aTextureCoord, filter.legacy ? (this.quadUv.map(input._frame, input.filterFrame), renderer.geometry.bind(this.quadUv), renderer.geometry.draw(constants.DRAW_MODES.TRIANGLES)) : (renderer.geometry.bind(this.quad), renderer.geometry.draw(constants.DRAW_MODES.TRIANGLE_STRIP));
  }
  /**
   * Multiply _input normalized coordinates_ to this matrix to get _sprite texture normalized coordinates_.
   *
   * Use `outputMatrix * vTextureCoord` in the shader.
   * @param outputMatrix - The matrix to output to.
   * @param {PIXI.Sprite} sprite - The sprite to map to.
   * @returns The mapped matrix.
   */
  calculateSpriteMatrix(outputMatrix, sprite) {
    const { sourceFrame, destinationFrame } = this.activeState, { orig } = sprite._texture, mappedMatrix = outputMatrix.set(
      destinationFrame.width,
      0,
      0,
      destinationFrame.height,
      sourceFrame.x,
      sourceFrame.y
    ), worldTransform = sprite.worldTransform.copyTo(math.Matrix.TEMP_MATRIX);
    return worldTransform.invert(), mappedMatrix.prepend(worldTransform), mappedMatrix.scale(1 / orig.width, 1 / orig.height), mappedMatrix.translate(sprite.anchor.x, sprite.anchor.y), mappedMatrix;
  }
  /** Destroys this Filter System. */
  destroy() {
    this.renderer = null, this.texturePool.clear(!1);
  }
  /**
   * Gets a Power-of-Two render texture or fullScreen texture
   * @param minWidth - The minimum width of the render texture in real pixels.
   * @param minHeight - The minimum height of the render texture in real pixels.
   * @param resolution - The resolution of the render texture.
   * @param multisample - Number of samples of the render texture.
   * @returns - The new render texture.
   */
  getOptimalFilterTexture(minWidth, minHeight, resolution = 1, multisample = constants.MSAA_QUALITY.NONE) {
    return this.texturePool.getOptimalTexture(minWidth, minHeight, resolution, multisample);
  }
  /**
   * Gets extra render texture to use inside current filter
   * To be compliant with older filters, you can use params in any order
   * @param input - renderTexture from which size and resolution will be copied
   * @param resolution - override resolution of the renderTexture
   * @param multisample - number of samples of the renderTexture
   */
  getFilterTexture(input, resolution, multisample) {
    if (typeof input == "number") {
      const swap = input;
      input = resolution, resolution = swap;
    }
    input = input || this.activeState.renderTexture;
    const filterTexture = this.texturePool.getOptimalTexture(
      input.width,
      input.height,
      resolution || input.resolution,
      multisample || constants.MSAA_QUALITY.NONE
    );
    return filterTexture.filterFrame = input.filterFrame, filterTexture;
  }
  /**
   * Frees a render texture back into the pool.
   * @param renderTexture - The renderTarget to free
   */
  returnFilterTexture(renderTexture) {
    this.texturePool.returnTexture(renderTexture);
  }
  /** Empties the texture pool. */
  emptyPool() {
    this.texturePool.clear(!0);
  }
  /** Calls `texturePool.resize()`, affects fullScreen renderTextures. */
  resize() {
    this.texturePool.setScreenSize(this.renderer.view);
  }
  /**
   * @param matrix - first param
   * @param rect - second param
   */
  transformAABB(matrix, rect) {
    const lt = tempPoints[0], lb = tempPoints[1], rt = tempPoints[2], rb = tempPoints[3];
    lt.set(rect.left, rect.top), lb.set(rect.left, rect.bottom), rt.set(rect.right, rect.top), rb.set(rect.right, rect.bottom), matrix.apply(lt, lt), matrix.apply(lb, lb), matrix.apply(rt, rt), matrix.apply(rb, rb);
    const x0 = Math.min(lt.x, lb.x, rt.x, rb.x), y0 = Math.min(lt.y, lb.y, rt.y, rb.y), x1 = Math.max(lt.x, lb.x, rt.x, rb.x), y1 = Math.max(lt.y, lb.y, rt.y, rb.y);
    rect.x = x0, rect.y = y0, rect.width = x1 - x0, rect.height = y1 - y0;
  }
  roundFrame(frame, resolution, bindingSourceFrame, bindingDestinationFrame, transform) {
    if (!(frame.width <= 0 || frame.height <= 0 || bindingSourceFrame.width <= 0 || bindingSourceFrame.height <= 0)) {
      if (transform) {
        const { a, b, c, d } = transform;
        if ((Math.abs(b) > 1e-4 || Math.abs(c) > 1e-4) && (Math.abs(a) > 1e-4 || Math.abs(d) > 1e-4))
          return;
      }
      transform = transform ? tempMatrix.copyFrom(transform) : tempMatrix.identity(), transform.translate(-bindingSourceFrame.x, -bindingSourceFrame.y).scale(
        bindingDestinationFrame.width / bindingSourceFrame.width,
        bindingDestinationFrame.height / bindingSourceFrame.height
      ).translate(bindingDestinationFrame.x, bindingDestinationFrame.y), this.transformAABB(transform, frame), frame.ceil(resolution), this.transformAABB(transform.invert(), frame);
    }
  }
}
FilterSystem.extension = {
  type: extensions.ExtensionType.RendererSystem,
  name: "filter"
};
extensions.extensions.add(FilterSystem);
exports.FilterSystem = FilterSystem;


},{"../renderTexture/RenderTexturePool.js":83,"../shader/UniformGroup.js":91,"../utils/Quad.js":142,"../utils/QuadUv.js":143,"./FilterState.js":49,"@pixi/constants":31,"@pixi/extensions":160,"@pixi/math":169}],51:[function(require,module,exports){
"use strict";


},{}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
var defaultFragment = `varying vec2 vTextureCoord;

uniform sampler2D uSampler;

void main(void){
   gl_FragColor = texture2D(uSampler, vTextureCoord);
}
`;
exports.default = defaultFragment;


},{}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
var defaultVertex = `attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;

vec4 filterVertexPosition( void )
{
    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aVertexPosition * (outputFrame.zw * inputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}
`;
exports.default = defaultVertex;


},{}],54:[function(require,module,exports){
"use strict";
var math = require("@pixi/math"), TextureMatrix = require("../../textures/TextureMatrix.js"), Filter = require("../Filter.js"), spriteMaskFilter$1 = require("./spriteMaskFilter.frag.js"), spriteMaskFilter = require("./spriteMaskFilter.vert.js");
class SpriteMaskFilter extends Filter.Filter {
  /** @ignore */
  constructor(vertexSrc, fragmentSrc, uniforms) {
    let sprite = null;
    typeof vertexSrc != "string" && fragmentSrc === void 0 && uniforms === void 0 && (sprite = vertexSrc, vertexSrc = void 0, fragmentSrc = void 0, uniforms = void 0), super(vertexSrc || spriteMaskFilter.default, fragmentSrc || spriteMaskFilter$1.default, uniforms), this.maskSprite = sprite, this.maskMatrix = new math.Matrix();
  }
  /**
   * Sprite mask
   * @type {PIXI.DisplayObject}
   */
  get maskSprite() {
    return this._maskSprite;
  }
  set maskSprite(value) {
    this._maskSprite = value, this._maskSprite && (this._maskSprite.renderable = !1);
  }
  /**
   * Applies the filter
   * @param filterManager - The renderer to retrieve the filter from
   * @param input - The input render target.
   * @param output - The target to output to.
   * @param clearMode - Should the output be cleared before rendering to it.
   */
  apply(filterManager, input, output, clearMode) {
    const maskSprite = this._maskSprite, tex = maskSprite._texture;
    tex.valid && (tex.uvMatrix || (tex.uvMatrix = new TextureMatrix.TextureMatrix(tex, 0)), tex.uvMatrix.update(), this.uniforms.npmAlpha = tex.baseTexture.alphaMode ? 0 : 1, this.uniforms.mask = tex, this.uniforms.otherMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, maskSprite).prepend(tex.uvMatrix.mapCoord), this.uniforms.alpha = maskSprite.worldAlpha, this.uniforms.maskClamp = tex.uvMatrix.uClampFrame, filterManager.applyFilter(this, input, output, clearMode));
  }
}
exports.SpriteMaskFilter = SpriteMaskFilter;


},{"../../textures/TextureMatrix.js":122,"../Filter.js":48,"./spriteMaskFilter.frag.js":55,"./spriteMaskFilter.vert.js":56,"@pixi/math":169}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
var fragment = `varying vec2 vMaskCoord;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D mask;
uniform float alpha;
uniform float npmAlpha;
uniform vec4 maskClamp;

void main(void)
{
    float clip = step(3.5,
        step(maskClamp.x, vMaskCoord.x) +
        step(maskClamp.y, vMaskCoord.y) +
        step(vMaskCoord.x, maskClamp.z) +
        step(vMaskCoord.y, maskClamp.w));

    vec4 original = texture2D(uSampler, vTextureCoord);
    vec4 masky = texture2D(mask, vMaskCoord);
    float alphaMul = 1.0 - npmAlpha * (1.0 - masky.a);

    original *= (alphaMul * masky.r * alpha * clip);

    gl_FragColor = original;
}
`;
exports.default = fragment;


},{}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
var vertex = `attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;
uniform mat3 otherMatrix;

varying vec2 vMaskCoord;
varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    vTextureCoord = aTextureCoord;
    vMaskCoord = ( otherMatrix * vec3( aTextureCoord, 1.0)  ).xy;
}
`;
exports.default = vertex;


},{}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
var $defaultVertex = `attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`;
exports.default = $defaultVertex;


},{}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
var $defaultFilterVertex = `attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;

vec4 filterVertexPosition( void )
{
    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aVertexPosition * (outputFrame.zw * inputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}
`;
exports.default = $defaultFilterVertex;


},{}],59:[function(require,module,exports){
"use strict";
var _default = require("./default.vert.js"), defaultFilter = require("./defaultFilter.vert.js");
const defaultVertex = _default.default, defaultFilterVertex = defaultFilter.default;
exports.defaultFilterVertex = defaultFilterVertex;
exports.defaultVertex = defaultVertex;


},{"./default.vert.js":57,"./defaultFilter.vert.js":58}],60:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), runner = require("@pixi/runner"), BaseTexture = require("../textures/BaseTexture.js");
class Framebuffer {
  /**
   * @param width - Width of the frame buffer
   * @param height - Height of the frame buffer
   */
  constructor(width, height) {
    if (this.width = Math.round(width), this.height = Math.round(height), !this.width || !this.height)
      throw new Error("Framebuffer width or height is zero");
    this.stencil = !1, this.depth = !1, this.dirtyId = 0, this.dirtyFormat = 0, this.dirtySize = 0, this.depthTexture = null, this.colorTextures = [], this.glFramebuffers = {}, this.disposeRunner = new runner.Runner("disposeFramebuffer"), this.multisample = constants.MSAA_QUALITY.NONE;
  }
  /**
   * Reference to the colorTexture.
   * @readonly
   */
  get colorTexture() {
    return this.colorTextures[0];
  }
  /**
   * Add texture to the colorTexture array.
   * @param index - Index of the array to add the texture to
   * @param texture - Texture to add to the array
   */
  addColorTexture(index = 0, texture) {
    return this.colorTextures[index] = texture || new BaseTexture.BaseTexture(null, {
      scaleMode: constants.SCALE_MODES.NEAREST,
      resolution: 1,
      mipmap: constants.MIPMAP_MODES.OFF,
      width: this.width,
      height: this.height
    }), this.dirtyId++, this.dirtyFormat++, this;
  }
  /**
   * Add a depth texture to the frame buffer.
   * @param texture - Texture to add.
   */
  addDepthTexture(texture) {
    return this.depthTexture = texture || new BaseTexture.BaseTexture(null, {
      scaleMode: constants.SCALE_MODES.NEAREST,
      resolution: 1,
      width: this.width,
      height: this.height,
      mipmap: constants.MIPMAP_MODES.OFF,
      format: constants.FORMATS.DEPTH_COMPONENT,
      type: constants.TYPES.UNSIGNED_SHORT
    }), this.dirtyId++, this.dirtyFormat++, this;
  }
  /** Enable depth on the frame buffer. */
  enableDepth() {
    return this.depth = !0, this.dirtyId++, this.dirtyFormat++, this;
  }
  /** Enable stencil on the frame buffer. */
  enableStencil() {
    return this.stencil = !0, this.dirtyId++, this.dirtyFormat++, this;
  }
  /**
   * Resize the frame buffer
   * @param width - Width of the frame buffer to resize to
   * @param height - Height of the frame buffer to resize to
   */
  resize(width, height) {
    if (width = Math.round(width), height = Math.round(height), !width || !height)
      throw new Error("Framebuffer width and height must not be zero");
    if (!(width === this.width && height === this.height)) {
      this.width = width, this.height = height, this.dirtyId++, this.dirtySize++;
      for (let i = 0; i < this.colorTextures.length; i++) {
        const texture = this.colorTextures[i], resolution = texture.resolution;
        texture.setSize(width / resolution, height / resolution);
      }
      if (this.depthTexture) {
        const resolution = this.depthTexture.resolution;
        this.depthTexture.setSize(width / resolution, height / resolution);
      }
    }
  }
  /** Disposes WebGL resources that are connected to this geometry. */
  dispose() {
    this.disposeRunner.emit(this, !1);
  }
  /** Destroys and removes the depth texture added to this framebuffer. */
  destroyDepthTexture() {
    this.depthTexture && (this.depthTexture.destroy(), this.depthTexture = null, ++this.dirtyId, ++this.dirtyFormat);
  }
}
exports.Framebuffer = Framebuffer;


},{"../textures/BaseTexture.js":118,"@pixi/constants":31,"@pixi/runner":176}],61:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), extensions = require("@pixi/extensions"), math = require("@pixi/math"), settings = require("@pixi/settings"), Framebuffer = require("./Framebuffer.js"), GLFramebuffer = require("./GLFramebuffer.js");
const tempRectangle = new math.Rectangle();
class FramebufferSystem {
  /**
   * @param renderer - The renderer this System works for.
   */
  constructor(renderer) {
    this.renderer = renderer, this.managedFramebuffers = [], this.unknownFramebuffer = new Framebuffer.Framebuffer(10, 10), this.msaaSamples = null;
  }
  /** Sets up the renderer context and necessary buffers. */
  contextChange() {
    this.disposeAll(!0);
    const gl = this.gl = this.renderer.gl;
    if (this.CONTEXT_UID = this.renderer.CONTEXT_UID, this.current = this.unknownFramebuffer, this.viewport = new math.Rectangle(), this.hasMRT = !0, this.writeDepthTexture = !0, this.renderer.context.webGLVersion === 1) {
      let nativeDrawBuffersExtension = this.renderer.context.extensions.drawBuffers, nativeDepthTextureExtension = this.renderer.context.extensions.depthTexture;
      settings.settings.PREFER_ENV === constants.ENV.WEBGL_LEGACY && (nativeDrawBuffersExtension = null, nativeDepthTextureExtension = null), nativeDrawBuffersExtension ? gl.drawBuffers = (activeTextures) => nativeDrawBuffersExtension.drawBuffersWEBGL(activeTextures) : (this.hasMRT = !1, gl.drawBuffers = () => {
      }), nativeDepthTextureExtension || (this.writeDepthTexture = !1);
    } else
      this.msaaSamples = gl.getInternalformatParameter(gl.RENDERBUFFER, gl.RGBA8, gl.SAMPLES);
  }
  /**
   * Bind a framebuffer.
   * @param framebuffer
   * @param frame - frame, default is framebuffer size
   * @param mipLevel - optional mip level to set on the framebuffer - defaults to 0
   */
  bind(framebuffer, frame, mipLevel = 0) {
    const { gl } = this;
    if (framebuffer) {
      const fbo = framebuffer.glFramebuffers[this.CONTEXT_UID] || this.initFramebuffer(framebuffer);
      this.current !== framebuffer && (this.current = framebuffer, gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.framebuffer)), fbo.mipLevel !== mipLevel && (framebuffer.dirtyId++, framebuffer.dirtyFormat++, fbo.mipLevel = mipLevel), fbo.dirtyId !== framebuffer.dirtyId && (fbo.dirtyId = framebuffer.dirtyId, fbo.dirtyFormat !== framebuffer.dirtyFormat ? (fbo.dirtyFormat = framebuffer.dirtyFormat, fbo.dirtySize = framebuffer.dirtySize, this.updateFramebuffer(framebuffer, mipLevel)) : fbo.dirtySize !== framebuffer.dirtySize && (fbo.dirtySize = framebuffer.dirtySize, this.resizeFramebuffer(framebuffer)));
      for (let i = 0; i < framebuffer.colorTextures.length; i++) {
        const tex = framebuffer.colorTextures[i];
        this.renderer.texture.unbind(tex.parentTextureArray || tex);
      }
      if (framebuffer.depthTexture && this.renderer.texture.unbind(framebuffer.depthTexture), frame) {
        const mipWidth = frame.width >> mipLevel, mipHeight = frame.height >> mipLevel, scale = mipWidth / frame.width;
        this.setViewport(
          frame.x * scale,
          frame.y * scale,
          mipWidth,
          mipHeight
        );
      } else {
        const mipWidth = framebuffer.width >> mipLevel, mipHeight = framebuffer.height >> mipLevel;
        this.setViewport(0, 0, mipWidth, mipHeight);
      }
    } else
      this.current && (this.current = null, gl.bindFramebuffer(gl.FRAMEBUFFER, null)), frame ? this.setViewport(frame.x, frame.y, frame.width, frame.height) : this.setViewport(0, 0, this.renderer.width, this.renderer.height);
  }
  /**
   * Set the WebGLRenderingContext's viewport.
   * @param x - X position of viewport
   * @param y - Y position of viewport
   * @param width - Width of viewport
   * @param height - Height of viewport
   */
  setViewport(x, y, width, height) {
    const v = this.viewport;
    x = Math.round(x), y = Math.round(y), width = Math.round(width), height = Math.round(height), (v.width !== width || v.height !== height || v.x !== x || v.y !== y) && (v.x = x, v.y = y, v.width = width, v.height = height, this.gl.viewport(x, y, width, height));
  }
  /**
   * Get the size of the current width and height. Returns object with `width` and `height` values.
   * @readonly
   */
  get size() {
    return this.current ? { x: 0, y: 0, width: this.current.width, height: this.current.height } : { x: 0, y: 0, width: this.renderer.width, height: this.renderer.height };
  }
  /**
   * Clear the color of the context
   * @param r - Red value from 0 to 1
   * @param g - Green value from 0 to 1
   * @param b - Blue value from 0 to 1
   * @param a - Alpha value from 0 to 1
   * @param {PIXI.BUFFER_BITS} [mask=BUFFER_BITS.COLOR | BUFFER_BITS.DEPTH] - Bitwise OR of masks
   *  that indicate the buffers to be cleared, by default COLOR and DEPTH buffers.
   */
  clear(r, g, b, a, mask = constants.BUFFER_BITS.COLOR | constants.BUFFER_BITS.DEPTH) {
    const { gl } = this;
    gl.clearColor(r, g, b, a), gl.clear(mask);
  }
  /**
   * Initialize framebuffer for this context
   * @protected
   * @param framebuffer
   * @returns - created GLFramebuffer
   */
  initFramebuffer(framebuffer) {
    const { gl } = this, fbo = new GLFramebuffer.GLFramebuffer(gl.createFramebuffer());
    return fbo.multisample = this.detectSamples(framebuffer.multisample), framebuffer.glFramebuffers[this.CONTEXT_UID] = fbo, this.managedFramebuffers.push(framebuffer), framebuffer.disposeRunner.add(this), fbo;
  }
  /**
   * Resize the framebuffer
   * @param framebuffer
   * @protected
   */
  resizeFramebuffer(framebuffer) {
    const { gl } = this, fbo = framebuffer.glFramebuffers[this.CONTEXT_UID];
    if (fbo.stencil) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.stencil);
      let stencilFormat;
      this.renderer.context.webGLVersion === 1 ? stencilFormat = gl.DEPTH_STENCIL : framebuffer.depth && framebuffer.stencil ? stencilFormat = gl.DEPTH24_STENCIL8 : framebuffer.depth ? stencilFormat = gl.DEPTH_COMPONENT24 : stencilFormat = gl.STENCIL_INDEX8, fbo.msaaBuffer ? gl.renderbufferStorageMultisample(
        gl.RENDERBUFFER,
        fbo.multisample,
        stencilFormat,
        framebuffer.width,
        framebuffer.height
      ) : gl.renderbufferStorage(gl.RENDERBUFFER, stencilFormat, framebuffer.width, framebuffer.height);
    }
    const colorTextures = framebuffer.colorTextures;
    let count = colorTextures.length;
    gl.drawBuffers || (count = Math.min(count, 1));
    for (let i = 0; i < count; i++) {
      const texture = colorTextures[i], parentTexture = texture.parentTextureArray || texture;
      this.renderer.texture.bind(parentTexture, 0), i === 0 && fbo.msaaBuffer && (gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.msaaBuffer), gl.renderbufferStorageMultisample(
        gl.RENDERBUFFER,
        fbo.multisample,
        parentTexture._glTextures[this.CONTEXT_UID].internalFormat,
        framebuffer.width,
        framebuffer.height
      ));
    }
    framebuffer.depthTexture && this.writeDepthTexture && this.renderer.texture.bind(framebuffer.depthTexture, 0);
  }
  /**
   * Update the framebuffer
   * @param framebuffer
   * @param mipLevel
   * @protected
   */
  updateFramebuffer(framebuffer, mipLevel) {
    const { gl } = this, fbo = framebuffer.glFramebuffers[this.CONTEXT_UID], colorTextures = framebuffer.colorTextures;
    let count = colorTextures.length;
    gl.drawBuffers || (count = Math.min(count, 1)), fbo.multisample > 1 && this.canMultisampleFramebuffer(framebuffer) ? fbo.msaaBuffer = fbo.msaaBuffer || gl.createRenderbuffer() : fbo.msaaBuffer && (gl.deleteRenderbuffer(fbo.msaaBuffer), fbo.msaaBuffer = null, fbo.blitFramebuffer && (fbo.blitFramebuffer.dispose(), fbo.blitFramebuffer = null));
    const activeTextures = [];
    for (let i = 0; i < count; i++) {
      const texture = colorTextures[i], parentTexture = texture.parentTextureArray || texture;
      this.renderer.texture.bind(parentTexture, 0), i === 0 && fbo.msaaBuffer ? (gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.msaaBuffer), gl.renderbufferStorageMultisample(
        gl.RENDERBUFFER,
        fbo.multisample,
        parentTexture._glTextures[this.CONTEXT_UID].internalFormat,
        framebuffer.width,
        framebuffer.height
      ), gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, fbo.msaaBuffer)) : (gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0 + i,
        texture.target,
        parentTexture._glTextures[this.CONTEXT_UID].texture,
        mipLevel
      ), activeTextures.push(gl.COLOR_ATTACHMENT0 + i));
    }
    if (activeTextures.length > 1 && gl.drawBuffers(activeTextures), framebuffer.depthTexture && this.writeDepthTexture) {
      const depthTexture = framebuffer.depthTexture;
      this.renderer.texture.bind(depthTexture, 0), gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.TEXTURE_2D,
        depthTexture._glTextures[this.CONTEXT_UID].texture,
        mipLevel
      );
    }
    if ((framebuffer.stencil || framebuffer.depth) && !(framebuffer.depthTexture && this.writeDepthTexture)) {
      fbo.stencil = fbo.stencil || gl.createRenderbuffer();
      let stencilAttachment, stencilFormat;
      this.renderer.context.webGLVersion === 1 ? (stencilAttachment = gl.DEPTH_STENCIL_ATTACHMENT, stencilFormat = gl.DEPTH_STENCIL) : framebuffer.depth && framebuffer.stencil ? (stencilAttachment = gl.DEPTH_STENCIL_ATTACHMENT, stencilFormat = gl.DEPTH24_STENCIL8) : framebuffer.depth ? (stencilAttachment = gl.DEPTH_ATTACHMENT, stencilFormat = gl.DEPTH_COMPONENT24) : (stencilAttachment = gl.STENCIL_ATTACHMENT, stencilFormat = gl.STENCIL_INDEX8), gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.stencil), fbo.msaaBuffer ? gl.renderbufferStorageMultisample(
        gl.RENDERBUFFER,
        fbo.multisample,
        stencilFormat,
        framebuffer.width,
        framebuffer.height
      ) : gl.renderbufferStorage(gl.RENDERBUFFER, stencilFormat, framebuffer.width, framebuffer.height), gl.framebufferRenderbuffer(gl.FRAMEBUFFER, stencilAttachment, gl.RENDERBUFFER, fbo.stencil);
    } else
      fbo.stencil && (gl.deleteRenderbuffer(fbo.stencil), fbo.stencil = null);
  }
  /**
   * Returns true if the frame buffer can be multisampled.
   * @param framebuffer
   */
  canMultisampleFramebuffer(framebuffer) {
    return this.renderer.context.webGLVersion !== 1 && framebuffer.colorTextures.length <= 1 && !framebuffer.depthTexture;
  }
  /**
   * Detects number of samples that is not more than a param but as close to it as possible
   * @param samples - number of samples
   * @returns - recommended number of samples
   */
  detectSamples(samples) {
    const { msaaSamples } = this;
    let res = constants.MSAA_QUALITY.NONE;
    if (samples <= 1 || msaaSamples === null)
      return res;
    for (let i = 0; i < msaaSamples.length; i++)
      if (msaaSamples[i] <= samples) {
        res = msaaSamples[i];
        break;
      }
    return res === 1 && (res = constants.MSAA_QUALITY.NONE), res;
  }
  /**
   * Only works with WebGL2
   *
   * blits framebuffer to another of the same or bigger size
   * after that target framebuffer is bound
   *
   * Fails with WebGL warning if blits multisample framebuffer to different size
   * @param framebuffer - by default it blits "into itself", from renderBuffer to texture.
   * @param sourcePixels - source rectangle in pixels
   * @param destPixels - dest rectangle in pixels, assumed to be the same as sourcePixels
   */
  blit(framebuffer, sourcePixels, destPixels) {
    const { current, renderer, gl, CONTEXT_UID } = this;
    if (renderer.context.webGLVersion !== 2 || !current)
      return;
    const fbo = current.glFramebuffers[CONTEXT_UID];
    if (!fbo)
      return;
    if (!framebuffer) {
      if (!fbo.msaaBuffer)
        return;
      const colorTexture = current.colorTextures[0];
      if (!colorTexture)
        return;
      fbo.blitFramebuffer || (fbo.blitFramebuffer = new Framebuffer.Framebuffer(current.width, current.height), fbo.blitFramebuffer.addColorTexture(0, colorTexture)), framebuffer = fbo.blitFramebuffer, framebuffer.colorTextures[0] !== colorTexture && (framebuffer.colorTextures[0] = colorTexture, framebuffer.dirtyId++, framebuffer.dirtyFormat++), (framebuffer.width !== current.width || framebuffer.height !== current.height) && (framebuffer.width = current.width, framebuffer.height = current.height, framebuffer.dirtyId++, framebuffer.dirtySize++);
    }
    sourcePixels || (sourcePixels = tempRectangle, sourcePixels.width = current.width, sourcePixels.height = current.height), destPixels || (destPixels = sourcePixels);
    const sameSize = sourcePixels.width === destPixels.width && sourcePixels.height === destPixels.height;
    this.bind(framebuffer), gl.bindFramebuffer(gl.READ_FRAMEBUFFER, fbo.framebuffer), gl.blitFramebuffer(
      sourcePixels.left,
      sourcePixels.top,
      sourcePixels.right,
      sourcePixels.bottom,
      destPixels.left,
      destPixels.top,
      destPixels.right,
      destPixels.bottom,
      gl.COLOR_BUFFER_BIT,
      sameSize ? gl.NEAREST : gl.LINEAR
    ), gl.bindFramebuffer(gl.READ_FRAMEBUFFER, framebuffer.glFramebuffers[this.CONTEXT_UID].framebuffer);
  }
  /**
   * Disposes framebuffer.
   * @param framebuffer - framebuffer that has to be disposed of
   * @param contextLost - If context was lost, we suppress all delete function calls
   */
  disposeFramebuffer(framebuffer, contextLost) {
    const fbo = framebuffer.glFramebuffers[this.CONTEXT_UID], gl = this.gl;
    if (!fbo)
      return;
    delete framebuffer.glFramebuffers[this.CONTEXT_UID];
    const index = this.managedFramebuffers.indexOf(framebuffer);
    index >= 0 && this.managedFramebuffers.splice(index, 1), framebuffer.disposeRunner.remove(this), contextLost || (gl.deleteFramebuffer(fbo.framebuffer), fbo.msaaBuffer && gl.deleteRenderbuffer(fbo.msaaBuffer), fbo.stencil && gl.deleteRenderbuffer(fbo.stencil)), fbo.blitFramebuffer && this.disposeFramebuffer(fbo.blitFramebuffer, contextLost);
  }
  /**
   * Disposes all framebuffers, but not textures bound to them.
   * @param [contextLost=false] - If context was lost, we suppress all delete function calls
   */
  disposeAll(contextLost) {
    const list = this.managedFramebuffers;
    this.managedFramebuffers = [];
    for (let i = 0; i < list.length; i++)
      this.disposeFramebuffer(list[i], contextLost);
  }
  /**
   * Forcing creation of stencil buffer for current framebuffer, if it wasn't done before.
   * Used by MaskSystem, when its time to use stencil mask for Graphics element.
   *
   * Its an alternative for public lazy `framebuffer.enableStencil`, in case we need stencil without rebind.
   * @private
   */
  forceStencil() {
    const framebuffer = this.current;
    if (!framebuffer)
      return;
    const fbo = framebuffer.glFramebuffers[this.CONTEXT_UID];
    if (!fbo || fbo.stencil && framebuffer.stencil)
      return;
    framebuffer.stencil = !0;
    const w = framebuffer.width, h = framebuffer.height, gl = this.gl, stencil = fbo.stencil = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, stencil);
    let stencilAttachment, stencilFormat;
    this.renderer.context.webGLVersion === 1 ? (stencilAttachment = gl.DEPTH_STENCIL_ATTACHMENT, stencilFormat = gl.DEPTH_STENCIL) : framebuffer.depth ? (stencilAttachment = gl.DEPTH_STENCIL_ATTACHMENT, stencilFormat = gl.DEPTH24_STENCIL8) : (stencilAttachment = gl.STENCIL_ATTACHMENT, stencilFormat = gl.STENCIL_INDEX8), fbo.msaaBuffer ? gl.renderbufferStorageMultisample(gl.RENDERBUFFER, fbo.multisample, stencilFormat, w, h) : gl.renderbufferStorage(gl.RENDERBUFFER, stencilFormat, w, h), gl.framebufferRenderbuffer(gl.FRAMEBUFFER, stencilAttachment, gl.RENDERBUFFER, stencil);
  }
  /** Resets framebuffer stored state, binds screen framebuffer. Should be called before renderTexture reset(). */
  reset() {
    this.current = this.unknownFramebuffer, this.viewport = new math.Rectangle();
  }
  destroy() {
    this.renderer = null;
  }
}
FramebufferSystem.extension = {
  type: extensions.ExtensionType.RendererSystem,
  name: "framebuffer"
};
extensions.extensions.add(FramebufferSystem);
exports.FramebufferSystem = FramebufferSystem;


},{"./Framebuffer.js":60,"./GLFramebuffer.js":62,"@pixi/constants":31,"@pixi/extensions":160,"@pixi/math":169,"@pixi/settings":180}],62:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants");
class GLFramebuffer {
  constructor(framebuffer) {
    this.framebuffer = framebuffer, this.stencil = null, this.dirtyId = -1, this.dirtyFormat = -1, this.dirtySize = -1, this.multisample = constants.MSAA_QUALITY.NONE, this.msaaBuffer = null, this.blitFramebuffer = null, this.mipLevel = 0;
  }
}
exports.GLFramebuffer = GLFramebuffer;


},{"@pixi/constants":31}],63:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), extensions = require("@pixi/extensions");
class MultisampleSystem {
  constructor(renderer) {
    this.renderer = renderer;
  }
  contextChange(gl) {
    let samples;
    if (this.renderer.context.webGLVersion === 1) {
      const framebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null), samples = gl.getParameter(gl.SAMPLES), gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    } else {
      const framebuffer = gl.getParameter(gl.DRAW_FRAMEBUFFER_BINDING);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null), samples = gl.getParameter(gl.SAMPLES), gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebuffer);
    }
    samples >= constants.MSAA_QUALITY.HIGH ? this.multisample = constants.MSAA_QUALITY.HIGH : samples >= constants.MSAA_QUALITY.MEDIUM ? this.multisample = constants.MSAA_QUALITY.MEDIUM : samples >= constants.MSAA_QUALITY.LOW ? this.multisample = constants.MSAA_QUALITY.LOW : this.multisample = constants.MSAA_QUALITY.NONE;
  }
  destroy() {
  }
}
MultisampleSystem.extension = {
  type: extensions.ExtensionType.RendererSystem,
  name: "_multisample"
};
extensions.extensions.add(MultisampleSystem);
exports.MultisampleSystem = MultisampleSystem;


},{"@pixi/constants":31,"@pixi/extensions":160}],64:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants");
class Attribute {
  /**
   * @param buffer - the id of the buffer that this attribute will look for
   * @param size - the size of the attribute. If you have 2 floats per vertex (eg position x and y) this would be 2.
   * @param normalized - should the data be normalized.
   * @param {PIXI.TYPES} [type=PIXI.TYPES.FLOAT] - what type of number is the attribute. Check {@link PIXI.TYPES} to see the ones available
   * @param [stride=0] - How far apart, in bytes, the start of each value is. (used for interleaving data)
   * @param [start=0] - How far into the array to start reading values (used for interleaving data)
   * @param [instance=false] - Whether the geometry is instanced.
   * @param [divisor=1] - Divisor to use when doing instanced rendering
   */
  constructor(buffer, size = 0, normalized = !1, type = constants.TYPES.FLOAT, stride, start, instance, divisor = 1) {
    this.buffer = buffer, this.size = size, this.normalized = normalized, this.type = type, this.stride = stride, this.start = start, this.instance = instance, this.divisor = divisor;
  }
  /** Destroys the Attribute. */
  destroy() {
    this.buffer = null;
  }
  /**
   * Helper function that creates an Attribute based on the information provided
   * @param buffer - the id of the buffer that this attribute will look for
   * @param [size=0] - the size of the attribute. If you have 2 floats per vertex (eg position x and y) this would be 2
   * @param [normalized=false] - should the data be normalized.
   * @param [type=PIXI.TYPES.FLOAT] - what type of number is the attribute. Check {@link PIXI.TYPES} to see the ones available
   * @param [stride=0] - How far apart, in bytes, the start of each value is. (used for interleaving data)
   * @returns - A new {@link PIXI.Attribute} based on the information provided
   */
  static from(buffer, size, normalized, type, stride) {
    return new Attribute(buffer, size, normalized, type, stride);
  }
}
exports.Attribute = Attribute;


},{"@pixi/constants":31}],65:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), runner = require("@pixi/runner");
let UID = 0;
class Buffer {
  /**
   * @param {PIXI.IArrayBuffer} data - the data to store in the buffer.
   * @param _static - `true` for static buffer
   * @param index - `true` for index buffer
   */
  constructor(data, _static = !0, index = !1) {
    this.data = data || new Float32Array(1), this._glBuffers = {}, this._updateID = 0, this.index = index, this.static = _static, this.id = UID++, this.disposeRunner = new runner.Runner("disposeBuffer");
  }
  // TODO could explore flagging only a partial upload?
  /**
   * Flags this buffer as requiring an upload to the GPU.
   * @param {PIXI.IArrayBuffer|number[]} [data] - the data to update in the buffer.
   */
  update(data) {
    data instanceof Array && (data = new Float32Array(data)), this.data = data || this.data, this._updateID++;
  }
  /** Disposes WebGL resources that are connected to this geometry. */
  dispose() {
    this.disposeRunner.emit(this, !1);
  }
  /** Destroys the buffer. */
  destroy() {
    this.dispose(), this.data = null;
  }
  /**
   * Flags whether this is an index buffer.
   *
   * Index buffers are of type `ELEMENT_ARRAY_BUFFER`. Note that setting this property to false will make
   * the buffer of type `ARRAY_BUFFER`.
   *
   * For backwards compatibility.
   */
  set index(value) {
    this.type = value ? constants.BUFFER_TYPE.ELEMENT_ARRAY_BUFFER : constants.BUFFER_TYPE.ARRAY_BUFFER;
  }
  get index() {
    return this.type === constants.BUFFER_TYPE.ELEMENT_ARRAY_BUFFER;
  }
  /**
   * Helper function that creates a buffer based on an array or TypedArray
   * @param {ArrayBufferView | number[]} data - the TypedArray that the buffer will store. If this is a regular Array it will be converted to a Float32Array.
   * @returns - A new Buffer based on the data provided.
   */
  static from(data) {
    return data instanceof Array && (data = new Float32Array(data)), new Buffer(data);
  }
}
exports.Buffer = Buffer;


},{"@pixi/constants":31,"@pixi/runner":176}],66:[function(require,module,exports){
"use strict";
var extensions = require("@pixi/extensions"), GLBuffer = require("./GLBuffer.js");
class BufferSystem {
  /**
   * @param {PIXI.Renderer} renderer - The renderer this System works for.
   */
  constructor(renderer) {
    this.renderer = renderer, this.managedBuffers = {}, this.boundBufferBases = {};
  }
  /**
   * @ignore
   */
  destroy() {
    this.renderer = null;
  }
  /** Sets up the renderer context and necessary buffers. */
  contextChange() {
    this.disposeAll(!0), this.gl = this.renderer.gl, this.CONTEXT_UID = this.renderer.CONTEXT_UID;
  }
  /**
   * This binds specified buffer. On first run, it will create the webGL buffers for the context too
   * @param buffer - the buffer to bind to the renderer
   */
  bind(buffer) {
    const { gl, CONTEXT_UID } = this, glBuffer = buffer._glBuffers[CONTEXT_UID] || this.createGLBuffer(buffer);
    gl.bindBuffer(buffer.type, glBuffer.buffer);
  }
  unbind(type) {
    const { gl } = this;
    gl.bindBuffer(type, null);
  }
  /**
   * Binds an uniform buffer to at the given index.
   *
   * A cache is used so a buffer will not be bound again if already bound.
   * @param buffer - the buffer to bind
   * @param index - the base index to bind it to.
   */
  bindBufferBase(buffer, index) {
    const { gl, CONTEXT_UID } = this;
    if (this.boundBufferBases[index] !== buffer) {
      const glBuffer = buffer._glBuffers[CONTEXT_UID] || this.createGLBuffer(buffer);
      this.boundBufferBases[index] = buffer, gl.bindBufferBase(gl.UNIFORM_BUFFER, index, glBuffer.buffer);
    }
  }
  /**
   * Binds a buffer whilst also binding its range.
   * This will make the buffer start from the offset supplied rather than 0 when it is read.
   * @param buffer - the buffer to bind
   * @param index - the base index to bind at, defaults to 0
   * @param offset - the offset to bind at (this is blocks of 256). 0 = 0, 1 = 256, 2 = 512 etc
   */
  bindBufferRange(buffer, index, offset) {
    const { gl, CONTEXT_UID } = this;
    offset = offset || 0;
    const glBuffer = buffer._glBuffers[CONTEXT_UID] || this.createGLBuffer(buffer);
    gl.bindBufferRange(gl.UNIFORM_BUFFER, index || 0, glBuffer.buffer, offset * 256, 256);
  }
  /**
   * Will ensure the data in the buffer is uploaded to the GPU.
   * @param {PIXI.Buffer} buffer - the buffer to update
   */
  update(buffer) {
    const { gl, CONTEXT_UID } = this, glBuffer = buffer._glBuffers[CONTEXT_UID] || this.createGLBuffer(buffer);
    if (buffer._updateID !== glBuffer.updateID)
      if (glBuffer.updateID = buffer._updateID, gl.bindBuffer(buffer.type, glBuffer.buffer), glBuffer.byteLength >= buffer.data.byteLength)
        gl.bufferSubData(buffer.type, 0, buffer.data);
      else {
        const drawType = buffer.static ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW;
        glBuffer.byteLength = buffer.data.byteLength, gl.bufferData(buffer.type, buffer.data, drawType);
      }
  }
  /**
   * Disposes buffer
   * @param {PIXI.Buffer} buffer - buffer with data
   * @param {boolean} [contextLost=false] - If context was lost, we suppress deleteVertexArray
   */
  dispose(buffer, contextLost) {
    if (!this.managedBuffers[buffer.id])
      return;
    delete this.managedBuffers[buffer.id];
    const glBuffer = buffer._glBuffers[this.CONTEXT_UID], gl = this.gl;
    buffer.disposeRunner.remove(this), glBuffer && (contextLost || gl.deleteBuffer(glBuffer.buffer), delete buffer._glBuffers[this.CONTEXT_UID]);
  }
  /**
   * dispose all WebGL resources of all managed buffers
   * @param {boolean} [contextLost=false] - If context was lost, we suppress `gl.delete` calls
   */
  disposeAll(contextLost) {
    const all = Object.keys(this.managedBuffers);
    for (let i = 0; i < all.length; i++)
      this.dispose(this.managedBuffers[all[i]], contextLost);
  }
  /**
   * creates and attaches a GLBuffer object tied to the current context.
   * @param buffer
   * @protected
   */
  createGLBuffer(buffer) {
    const { CONTEXT_UID, gl } = this;
    return buffer._glBuffers[CONTEXT_UID] = new GLBuffer.GLBuffer(gl.createBuffer()), this.managedBuffers[buffer.id] = buffer, buffer.disposeRunner.add(this), buffer._glBuffers[CONTEXT_UID];
  }
}
BufferSystem.extension = {
  type: extensions.ExtensionType.RendererSystem,
  name: "buffer"
};
extensions.extensions.add(BufferSystem);
exports.BufferSystem = BufferSystem;


},{"./GLBuffer.js":67,"@pixi/extensions":160}],67:[function(require,module,exports){
"use strict";
class GLBuffer {
  constructor(buffer) {
    this.buffer = buffer || null, this.updateID = -1, this.byteLength = -1, this.refCount = 0;
  }
}
exports.GLBuffer = GLBuffer;


},{}],68:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), runner = require("@pixi/runner"), utils = require("@pixi/utils"), Attribute = require("./Attribute.js"), Buffer = require("./Buffer.js"), interleaveTypedArrays = require("./utils/interleaveTypedArrays.js");
const byteSizeMap = { 5126: 4, 5123: 2, 5121: 1 };
let UID = 0;
const map = {
  Float32Array,
  Uint32Array,
  Int32Array,
  Uint8Array,
  Uint16Array
};
class Geometry {
  /**
   * @param buffers - An array of buffers. optional.
   * @param attributes - Of the geometry, optional structure of the attributes layout
   */
  constructor(buffers = [], attributes = {}) {
    this.buffers = buffers, this.indexBuffer = null, this.attributes = attributes, this.glVertexArrayObjects = {}, this.id = UID++, this.instanced = !1, this.instanceCount = 1, this.disposeRunner = new runner.Runner("disposeGeometry"), this.refCount = 0;
  }
  /**
   *
   * Adds an attribute to the geometry
   * Note: `stride` and `start` should be `undefined` if you dont know them, not 0!
   * @param id - the name of the attribute (matching up to a shader)
   * @param {PIXI.Buffer|number[]} buffer - the buffer that holds the data of the attribute . You can also provide an Array and a buffer will be created from it.
   * @param size - the size of the attribute. If you have 2 floats per vertex (eg position x and y) this would be 2
   * @param normalized - should the data be normalized.
   * @param [type=PIXI.TYPES.FLOAT] - what type of number is the attribute. Check {@link PIXI.TYPES} to see the ones available
   * @param [stride=0] - How far apart, in bytes, the start of each value is. (used for interleaving data)
   * @param [start=0] - How far into the array to start reading values (used for interleaving data)
   * @param instance - Instancing flag
   * @returns - Returns self, useful for chaining.
   */
  addAttribute(id, buffer, size = 0, normalized = !1, type, stride, start, instance = !1) {
    if (!buffer)
      throw new Error("You must pass a buffer when creating an attribute");
    buffer instanceof Buffer.Buffer || (buffer instanceof Array && (buffer = new Float32Array(buffer)), buffer = new Buffer.Buffer(buffer));
    const ids = id.split("|");
    if (ids.length > 1) {
      for (let i = 0; i < ids.length; i++)
        this.addAttribute(ids[i], buffer, size, normalized, type);
      return this;
    }
    let bufferIndex = this.buffers.indexOf(buffer);
    return bufferIndex === -1 && (this.buffers.push(buffer), bufferIndex = this.buffers.length - 1), this.attributes[id] = new Attribute.Attribute(bufferIndex, size, normalized, type, stride, start, instance), this.instanced = this.instanced || instance, this;
  }
  /**
   * Returns the requested attribute.
   * @param id - The name of the attribute required
   * @returns - The attribute requested.
   */
  getAttribute(id) {
    return this.attributes[id];
  }
  /**
   * Returns the requested buffer.
   * @param id - The name of the buffer required.
   * @returns - The buffer requested.
   */
  getBuffer(id) {
    return this.buffers[this.getAttribute(id).buffer];
  }
  /**
   *
   * Adds an index buffer to the geometry
   * The index buffer contains integers, three for each triangle in the geometry, which reference the various attribute buffers (position, colour, UV coordinates, other UV coordinates, normal, …). There is only ONE index buffer.
   * @param {PIXI.Buffer|number[]} [buffer] - The buffer that holds the data of the index buffer. You can also provide an Array and a buffer will be created from it.
   * @returns - Returns self, useful for chaining.
   */
  addIndex(buffer) {
    return buffer instanceof Buffer.Buffer || (buffer instanceof Array && (buffer = new Uint16Array(buffer)), buffer = new Buffer.Buffer(buffer)), buffer.type = constants.BUFFER_TYPE.ELEMENT_ARRAY_BUFFER, this.indexBuffer = buffer, this.buffers.includes(buffer) || this.buffers.push(buffer), this;
  }
  /**
   * Returns the index buffer
   * @returns - The index buffer.
   */
  getIndex() {
    return this.indexBuffer;
  }
  /**
   * This function modifies the structure so that all current attributes become interleaved into a single buffer
   * This can be useful if your model remains static as it offers a little performance boost
   * @returns - Returns self, useful for chaining.
   */
  interleave() {
    if (this.buffers.length === 1 || this.buffers.length === 2 && this.indexBuffer)
      return this;
    const arrays = [], sizes = [], interleavedBuffer = new Buffer.Buffer();
    let i;
    for (i in this.attributes) {
      const attribute = this.attributes[i], buffer = this.buffers[attribute.buffer];
      arrays.push(buffer.data), sizes.push(attribute.size * byteSizeMap[attribute.type] / 4), attribute.buffer = 0;
    }
    for (interleavedBuffer.data = interleaveTypedArrays.interleaveTypedArrays(arrays, sizes), i = 0; i < this.buffers.length; i++)
      this.buffers[i] !== this.indexBuffer && this.buffers[i].destroy();
    return this.buffers = [interleavedBuffer], this.indexBuffer && this.buffers.push(this.indexBuffer), this;
  }
  /** Get the size of the geometries, in vertices. */
  getSize() {
    for (const i in this.attributes) {
      const attribute = this.attributes[i];
      return this.buffers[attribute.buffer].data.length / (attribute.stride / 4 || attribute.size);
    }
    return 0;
  }
  /** Disposes WebGL resources that are connected to this geometry. */
  dispose() {
    this.disposeRunner.emit(this, !1);
  }
  /** Destroys the geometry. */
  destroy() {
    this.dispose(), this.buffers = null, this.indexBuffer = null, this.attributes = null;
  }
  /**
   * Returns a clone of the geometry.
   * @returns - A new clone of this geometry.
   */
  clone() {
    const geometry = new Geometry();
    for (let i = 0; i < this.buffers.length; i++)
      geometry.buffers[i] = new Buffer.Buffer(this.buffers[i].data.slice(0));
    for (const i in this.attributes) {
      const attrib = this.attributes[i];
      geometry.attributes[i] = new Attribute.Attribute(
        attrib.buffer,
        attrib.size,
        attrib.normalized,
        attrib.type,
        attrib.stride,
        attrib.start,
        attrib.instance
      );
    }
    return this.indexBuffer && (geometry.indexBuffer = geometry.buffers[this.buffers.indexOf(this.indexBuffer)], geometry.indexBuffer.type = constants.BUFFER_TYPE.ELEMENT_ARRAY_BUFFER), geometry;
  }
  /**
   * Merges an array of geometries into a new single one.
   *
   * Geometry attribute styles must match for this operation to work.
   * @param geometries - array of geometries to merge
   * @returns - Shiny new geometry!
   */
  static merge(geometries) {
    const geometryOut = new Geometry(), arrays = [], sizes = [], offsets = [];
    let geometry;
    for (let i = 0; i < geometries.length; i++) {
      geometry = geometries[i];
      for (let j = 0; j < geometry.buffers.length; j++)
        sizes[j] = sizes[j] || 0, sizes[j] += geometry.buffers[j].data.length, offsets[j] = 0;
    }
    for (let i = 0; i < geometry.buffers.length; i++)
      arrays[i] = new map[utils.getBufferType(geometry.buffers[i].data)](sizes[i]), geometryOut.buffers[i] = new Buffer.Buffer(arrays[i]);
    for (let i = 0; i < geometries.length; i++) {
      geometry = geometries[i];
      for (let j = 0; j < geometry.buffers.length; j++)
        arrays[j].set(geometry.buffers[j].data, offsets[j]), offsets[j] += geometry.buffers[j].data.length;
    }
    if (geometryOut.attributes = geometry.attributes, geometry.indexBuffer) {
      geometryOut.indexBuffer = geometryOut.buffers[geometry.buffers.indexOf(geometry.indexBuffer)], geometryOut.indexBuffer.type = constants.BUFFER_TYPE.ELEMENT_ARRAY_BUFFER;
      let offset = 0, stride = 0, offset2 = 0, bufferIndexToCount = 0;
      for (let i = 0; i < geometry.buffers.length; i++)
        if (geometry.buffers[i] !== geometry.indexBuffer) {
          bufferIndexToCount = i;
          break;
        }
      for (const i in geometry.attributes) {
        const attribute = geometry.attributes[i];
        (attribute.buffer | 0) === bufferIndexToCount && (stride += attribute.size * byteSizeMap[attribute.type] / 4);
      }
      for (let i = 0; i < geometries.length; i++) {
        const indexBufferData = geometries[i].indexBuffer.data;
        for (let j = 0; j < indexBufferData.length; j++)
          geometryOut.indexBuffer.data[j + offset2] += offset;
        offset += geometries[i].buffers[bufferIndexToCount].data.length / stride, offset2 += indexBufferData.length;
      }
    }
    return geometryOut;
  }
}
exports.Geometry = Geometry;


},{"./Attribute.js":64,"./Buffer.js":65,"./utils/interleaveTypedArrays.js":71,"@pixi/constants":31,"@pixi/runner":176,"@pixi/utils":202}],69:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), extensions = require("@pixi/extensions"), settings = require("@pixi/settings");
const byteSizeMap = { 5126: 4, 5123: 2, 5121: 1 };
class GeometrySystem {
  /** @param renderer - The renderer this System works for. */
  constructor(renderer) {
    this.renderer = renderer, this._activeGeometry = null, this._activeVao = null, this.hasVao = !0, this.hasInstance = !0, this.canUseUInt32ElementIndex = !1, this.managedGeometries = {};
  }
  /** Sets up the renderer context and necessary buffers. */
  contextChange() {
    this.disposeAll(!0);
    const gl = this.gl = this.renderer.gl, context = this.renderer.context;
    if (this.CONTEXT_UID = this.renderer.CONTEXT_UID, context.webGLVersion !== 2) {
      let nativeVaoExtension = this.renderer.context.extensions.vertexArrayObject;
      settings.settings.PREFER_ENV === constants.ENV.WEBGL_LEGACY && (nativeVaoExtension = null), nativeVaoExtension ? (gl.createVertexArray = () => nativeVaoExtension.createVertexArrayOES(), gl.bindVertexArray = (vao) => nativeVaoExtension.bindVertexArrayOES(vao), gl.deleteVertexArray = (vao) => nativeVaoExtension.deleteVertexArrayOES(vao)) : (this.hasVao = !1, gl.createVertexArray = () => null, gl.bindVertexArray = () => null, gl.deleteVertexArray = () => null);
    }
    if (context.webGLVersion !== 2) {
      const instanceExt = gl.getExtension("ANGLE_instanced_arrays");
      instanceExt ? (gl.vertexAttribDivisor = (a, b) => instanceExt.vertexAttribDivisorANGLE(a, b), gl.drawElementsInstanced = (a, b, c, d, e) => instanceExt.drawElementsInstancedANGLE(a, b, c, d, e), gl.drawArraysInstanced = (a, b, c, d) => instanceExt.drawArraysInstancedANGLE(a, b, c, d)) : this.hasInstance = !1;
    }
    this.canUseUInt32ElementIndex = context.webGLVersion === 2 || !!context.extensions.uint32ElementIndex;
  }
  /**
   * Binds geometry so that is can be drawn. Creating a Vao if required
   * @param geometry - Instance of geometry to bind.
   * @param shader - Instance of shader to use vao for.
   */
  bind(geometry, shader) {
    shader = shader || this.renderer.shader.shader;
    const { gl } = this;
    let vaos = geometry.glVertexArrayObjects[this.CONTEXT_UID], incRefCount = !1;
    vaos || (this.managedGeometries[geometry.id] = geometry, geometry.disposeRunner.add(this), geometry.glVertexArrayObjects[this.CONTEXT_UID] = vaos = {}, incRefCount = !0);
    const vao = vaos[shader.program.id] || this.initGeometryVao(geometry, shader, incRefCount);
    this._activeGeometry = geometry, this._activeVao !== vao && (this._activeVao = vao, this.hasVao ? gl.bindVertexArray(vao) : this.activateVao(geometry, shader.program)), this.updateBuffers();
  }
  /** Reset and unbind any active VAO and geometry. */
  reset() {
    this.unbind();
  }
  /** Update buffers of the currently bound geometry. */
  updateBuffers() {
    const geometry = this._activeGeometry, bufferSystem = this.renderer.buffer;
    for (let i = 0; i < geometry.buffers.length; i++) {
      const buffer = geometry.buffers[i];
      bufferSystem.update(buffer);
    }
  }
  /**
   * Check compatibility between a geometry and a program
   * @param geometry - Geometry instance.
   * @param program - Program instance.
   */
  checkCompatibility(geometry, program) {
    const geometryAttributes = geometry.attributes, shaderAttributes = program.attributeData;
    for (const j in shaderAttributes)
      if (!geometryAttributes[j])
        throw new Error(`shader and geometry incompatible, geometry missing the "${j}" attribute`);
  }
  /**
   * Takes a geometry and program and generates a unique signature for them.
   * @param geometry - To get signature from.
   * @param program - To test geometry against.
   * @returns - Unique signature of the geometry and program
   */
  getSignature(geometry, program) {
    const attribs = geometry.attributes, shaderAttributes = program.attributeData, strings = ["g", geometry.id];
    for (const i in attribs)
      shaderAttributes[i] && strings.push(i, shaderAttributes[i].location);
    return strings.join("-");
  }
  /**
   * Creates or gets Vao with the same structure as the geometry and stores it on the geometry.
   * If vao is created, it is bound automatically. We use a shader to infer what and how to set up the
   * attribute locations.
   * @param geometry - Instance of geometry to to generate Vao for.
   * @param shader - Instance of the shader.
   * @param incRefCount - Increment refCount of all geometry buffers.
   */
  initGeometryVao(geometry, shader, incRefCount = !0) {
    const gl = this.gl, CONTEXT_UID = this.CONTEXT_UID, bufferSystem = this.renderer.buffer, program = shader.program;
    program.glPrograms[CONTEXT_UID] || this.renderer.shader.generateProgram(shader), this.checkCompatibility(geometry, program);
    const signature = this.getSignature(geometry, program), vaoObjectHash = geometry.glVertexArrayObjects[this.CONTEXT_UID];
    let vao = vaoObjectHash[signature];
    if (vao)
      return vaoObjectHash[program.id] = vao, vao;
    const buffers = geometry.buffers, attributes = geometry.attributes, tempStride = {}, tempStart = {};
    for (const j in buffers)
      tempStride[j] = 0, tempStart[j] = 0;
    for (const j in attributes)
      !attributes[j].size && program.attributeData[j] ? attributes[j].size = program.attributeData[j].size : attributes[j].size || console.warn(`PIXI Geometry attribute '${j}' size cannot be determined (likely the bound shader does not have the attribute)`), tempStride[attributes[j].buffer] += attributes[j].size * byteSizeMap[attributes[j].type];
    for (const j in attributes) {
      const attribute = attributes[j], attribSize = attribute.size;
      attribute.stride === void 0 && (tempStride[attribute.buffer] === attribSize * byteSizeMap[attribute.type] ? attribute.stride = 0 : attribute.stride = tempStride[attribute.buffer]), attribute.start === void 0 && (attribute.start = tempStart[attribute.buffer], tempStart[attribute.buffer] += attribSize * byteSizeMap[attribute.type]);
    }
    vao = gl.createVertexArray(), gl.bindVertexArray(vao);
    for (let i = 0; i < buffers.length; i++) {
      const buffer = buffers[i];
      bufferSystem.bind(buffer), incRefCount && buffer._glBuffers[CONTEXT_UID].refCount++;
    }
    return this.activateVao(geometry, program), vaoObjectHash[program.id] = vao, vaoObjectHash[signature] = vao, gl.bindVertexArray(null), bufferSystem.unbind(constants.BUFFER_TYPE.ARRAY_BUFFER), vao;
  }
  /**
   * Disposes geometry.
   * @param geometry - Geometry with buffers. Only VAO will be disposed
   * @param [contextLost=false] - If context was lost, we suppress deleteVertexArray
   */
  disposeGeometry(geometry, contextLost) {
    if (!this.managedGeometries[geometry.id])
      return;
    delete this.managedGeometries[geometry.id];
    const vaos = geometry.glVertexArrayObjects[this.CONTEXT_UID], gl = this.gl, buffers = geometry.buffers, bufferSystem = this.renderer?.buffer;
    if (geometry.disposeRunner.remove(this), !!vaos) {
      if (bufferSystem)
        for (let i = 0; i < buffers.length; i++) {
          const buf = buffers[i]._glBuffers[this.CONTEXT_UID];
          buf && (buf.refCount--, buf.refCount === 0 && !contextLost && bufferSystem.dispose(buffers[i], contextLost));
        }
      if (!contextLost) {
        for (const vaoId in vaos)
          if (vaoId[0] === "g") {
            const vao = vaos[vaoId];
            this._activeVao === vao && this.unbind(), gl.deleteVertexArray(vao);
          }
      }
      delete geometry.glVertexArrayObjects[this.CONTEXT_UID];
    }
  }
  /**
   * Dispose all WebGL resources of all managed geometries.
   * @param [contextLost=false] - If context was lost, we suppress `gl.delete` calls
   */
  disposeAll(contextLost) {
    const all = Object.keys(this.managedGeometries);
    for (let i = 0; i < all.length; i++)
      this.disposeGeometry(this.managedGeometries[all[i]], contextLost);
  }
  /**
   * Activate vertex array object.
   * @param geometry - Geometry instance.
   * @param program - Shader program instance.
   */
  activateVao(geometry, program) {
    const gl = this.gl, CONTEXT_UID = this.CONTEXT_UID, bufferSystem = this.renderer.buffer, buffers = geometry.buffers, attributes = geometry.attributes;
    geometry.indexBuffer && bufferSystem.bind(geometry.indexBuffer);
    let lastBuffer = null;
    for (const j in attributes) {
      const attribute = attributes[j], buffer = buffers[attribute.buffer], glBuffer = buffer._glBuffers[CONTEXT_UID];
      if (program.attributeData[j]) {
        lastBuffer !== glBuffer && (bufferSystem.bind(buffer), lastBuffer = glBuffer);
        const location = program.attributeData[j].location;
        if (gl.enableVertexAttribArray(location), gl.vertexAttribPointer(
          location,
          attribute.size,
          attribute.type || gl.FLOAT,
          attribute.normalized,
          attribute.stride,
          attribute.start
        ), attribute.instance)
          if (this.hasInstance)
            gl.vertexAttribDivisor(location, attribute.divisor);
          else
            throw new Error("geometry error, GPU Instancing is not supported on this device");
      }
    }
  }
  /**
   * Draws the currently bound geometry.
   * @param type - The type primitive to render.
   * @param size - The number of elements to be rendered. If not specified, all vertices after the
   *  starting vertex will be drawn.
   * @param start - The starting vertex in the geometry to start drawing from. If not specified,
   *  drawing will start from the first vertex.
   * @param instanceCount - The number of instances of the set of elements to execute. If not specified,
   *  all instances will be drawn.
   */
  draw(type, size, start, instanceCount) {
    const { gl } = this, geometry = this._activeGeometry;
    if (geometry.indexBuffer) {
      const byteSize = geometry.indexBuffer.data.BYTES_PER_ELEMENT, glType = byteSize === 2 ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;
      byteSize === 2 || byteSize === 4 && this.canUseUInt32ElementIndex ? geometry.instanced ? gl.drawElementsInstanced(type, size || geometry.indexBuffer.data.length, glType, (start || 0) * byteSize, instanceCount || 1) : gl.drawElements(type, size || geometry.indexBuffer.data.length, glType, (start || 0) * byteSize) : console.warn("unsupported index buffer type: uint32");
    } else
      geometry.instanced ? gl.drawArraysInstanced(type, start, size || geometry.getSize(), instanceCount || 1) : gl.drawArrays(type, start, size || geometry.getSize());
    return this;
  }
  /** Unbind/reset everything. */
  unbind() {
    this.gl.bindVertexArray(null), this._activeVao = null, this._activeGeometry = null;
  }
  destroy() {
    this.renderer = null;
  }
}
GeometrySystem.extension = {
  type: extensions.ExtensionType.RendererSystem,
  name: "geometry"
};
extensions.extensions.add(GeometrySystem);
exports.GeometrySystem = GeometrySystem;


},{"@pixi/constants":31,"@pixi/extensions":160,"@pixi/settings":180}],70:[function(require,module,exports){
"use strict";
class ViewableBuffer {
  constructor(sizeOrBuffer) {
    typeof sizeOrBuffer == "number" ? this.rawBinaryData = new ArrayBuffer(sizeOrBuffer) : sizeOrBuffer instanceof Uint8Array ? this.rawBinaryData = sizeOrBuffer.buffer : this.rawBinaryData = sizeOrBuffer, this.uint32View = new Uint32Array(this.rawBinaryData), this.float32View = new Float32Array(this.rawBinaryData);
  }
  /** View on the raw binary data as a `Int8Array`. */
  get int8View() {
    return this._int8View || (this._int8View = new Int8Array(this.rawBinaryData)), this._int8View;
  }
  /** View on the raw binary data as a `Uint8Array`. */
  get uint8View() {
    return this._uint8View || (this._uint8View = new Uint8Array(this.rawBinaryData)), this._uint8View;
  }
  /**  View on the raw binary data as a `Int16Array`. */
  get int16View() {
    return this._int16View || (this._int16View = new Int16Array(this.rawBinaryData)), this._int16View;
  }
  /** View on the raw binary data as a `Uint16Array`. */
  get uint16View() {
    return this._uint16View || (this._uint16View = new Uint16Array(this.rawBinaryData)), this._uint16View;
  }
  /** View on the raw binary data as a `Int32Array`. */
  get int32View() {
    return this._int32View || (this._int32View = new Int32Array(this.rawBinaryData)), this._int32View;
  }
  /**
   * Returns the view of the given type.
   * @param type - One of `int8`, `uint8`, `int16`,
   *    `uint16`, `int32`, `uint32`, and `float32`.
   * @returns - typed array of given type
   */
  view(type) {
    return this[`${type}View`];
  }
  /** Destroys all buffer references. Do not use after calling this. */
  destroy() {
    this.rawBinaryData = null, this._int8View = null, this._uint8View = null, this._int16View = null, this._uint16View = null, this._int32View = null, this.uint32View = null, this.float32View = null;
  }
  static sizeOf(type) {
    switch (type) {
      case "int8":
      case "uint8":
        return 1;
      case "int16":
      case "uint16":
        return 2;
      case "int32":
      case "uint32":
      case "float32":
        return 4;
      default:
        throw new Error(`${type} isn't a valid view type`);
    }
  }
}
exports.ViewableBuffer = ViewableBuffer;


},{}],71:[function(require,module,exports){
"use strict";
var utils = require("@pixi/utils");
const map = {
  Float32Array,
  Uint32Array,
  Int32Array,
  Uint8Array
};
function interleaveTypedArrays(arrays, sizes) {
  let outSize = 0, stride = 0;
  const views = {};
  for (let i = 0; i < arrays.length; i++)
    stride += sizes[i], outSize += arrays[i].length;
  const buffer = new ArrayBuffer(outSize * 4);
  let out = null, littleOffset = 0;
  for (let i = 0; i < arrays.length; i++) {
    const size = sizes[i], array = arrays[i], type = utils.getBufferType(array);
    views[type] || (views[type] = new map[type](buffer)), out = views[type];
    for (let j = 0; j < array.length; j++) {
      const indexStart = (j / size | 0) * stride + littleOffset, index = j % size;
      out[indexStart + index] = array[j];
    }
    littleOffset += size;
  }
  return new Float32Array(buffer);
}
exports.interleaveTypedArrays = interleaveTypedArrays;


},{"@pixi/utils":202}],72:[function(require,module,exports){
"use strict";
require("./settings.js");
var color = require("@pixi/color"), constants = require("@pixi/constants"), extensions = require("@pixi/extensions"), math = require("@pixi/math"), runner = require("@pixi/runner"), settings = require("@pixi/settings"), ticker = require("@pixi/ticker"), utils$1 = require("@pixi/utils"), autoDetectRenderer = require("./autoDetectRenderer.js"), BackgroundSystem = require("./background/BackgroundSystem.js"), BatchDrawCall = require("./batch/BatchDrawCall.js"), BatchGeometry = require("./batch/BatchGeometry.js"), BatchRenderer = require("./batch/BatchRenderer.js"), BatchShaderGenerator = require("./batch/BatchShaderGenerator.js"), BatchSystem = require("./batch/BatchSystem.js"), BatchTextureArray = require("./batch/BatchTextureArray.js"), ObjectRenderer = require("./batch/ObjectRenderer.js"), ContextSystem = require("./context/ContextSystem.js"), Filter = require("./filters/Filter.js"), FilterState = require("./filters/FilterState.js"), FilterSystem = require("./filters/FilterSystem.js");
require("./filters/IFilterTarget.js");
var SpriteMaskFilter = require("./filters/spriteMask/SpriteMaskFilter.js"), index = require("./fragments/index.js"), Framebuffer = require("./framebuffer/Framebuffer.js"), FramebufferSystem = require("./framebuffer/FramebufferSystem.js"), GLFramebuffer = require("./framebuffer/GLFramebuffer.js"), MultisampleSystem = require("./framebuffer/MultisampleSystem.js"), Attribute = require("./geometry/Attribute.js"), Buffer = require("./geometry/Buffer.js"), BufferSystem = require("./geometry/BufferSystem.js"), Geometry = require("./geometry/Geometry.js"), GeometrySystem = require("./geometry/GeometrySystem.js"), ViewableBuffer = require("./geometry/ViewableBuffer.js");
require("./IRenderer.js");
var MaskData = require("./mask/MaskData.js"), MaskSystem = require("./mask/MaskSystem.js"), ScissorSystem = require("./mask/ScissorSystem.js"), StencilSystem = require("./mask/StencilSystem.js"), PluginSystem = require("./plugin/PluginSystem.js"), ProjectionSystem = require("./projection/ProjectionSystem.js"), ObjectRendererSystem = require("./render/ObjectRendererSystem.js"), Renderer = require("./Renderer.js"), BaseRenderTexture = require("./renderTexture/BaseRenderTexture.js"), GenerateTextureSystem = require("./renderTexture/GenerateTextureSystem.js"), RenderTexture = require("./renderTexture/RenderTexture.js"), RenderTexturePool = require("./renderTexture/RenderTexturePool.js"), RenderTextureSystem = require("./renderTexture/RenderTextureSystem.js"), GLProgram = require("./shader/GLProgram.js"), Program = require("./shader/Program.js"), Shader = require("./shader/Shader.js"), ShaderSystem = require("./shader/ShaderSystem.js"), UniformGroup = require("./shader/UniformGroup.js"), checkMaxIfStatementsInShader = require("./shader/utils/checkMaxIfStatementsInShader.js"), generateProgram = require("./shader/utils/generateProgram.js"), generateUniformBufferSync = require("./shader/utils/generateUniformBufferSync.js"), getTestContext = require("./shader/utils/getTestContext.js"), uniformParsers = require("./shader/utils/uniformParsers.js"), unsafeEvalSupported = require("./shader/utils/unsafeEvalSupported.js"), StartupSystem = require("./startup/StartupSystem.js"), State = require("./state/State.js"), StateSystem = require("./state/StateSystem.js");
require("./system/ISystem.js");
require("./systems.js");
var BaseTexture = require("./textures/BaseTexture.js"), GLTexture = require("./textures/GLTexture.js");
require("./textures/resources/index.js");
var Texture = require("./textures/Texture.js"), TextureGCSystem = require("./textures/TextureGCSystem.js"), TextureMatrix = require("./textures/TextureMatrix.js"), TextureSystem = require("./textures/TextureSystem.js"), TextureUvs = require("./textures/TextureUvs.js"), TransformFeedback = require("./transformFeedback/TransformFeedback.js"), TransformFeedbackSystem = require("./transformFeedback/TransformFeedbackSystem.js"), Quad = require("./utils/Quad.js"), QuadUv = require("./utils/QuadUv.js"), ViewSystem = require("./view/ViewSystem.js"), SystemManager = require("./system/SystemManager.js"), BaseImageResource = require("./textures/resources/BaseImageResource.js"), Resource = require("./textures/resources/Resource.js"), AbstractMultiResource = require("./textures/resources/AbstractMultiResource.js"), ArrayResource = require("./textures/resources/ArrayResource.js"), autoDetectResource = require("./textures/resources/autoDetectResource.js"), BufferResource = require("./textures/resources/BufferResource.js"), CanvasResource = require("./textures/resources/CanvasResource.js"), CubeResource = require("./textures/resources/CubeResource.js"), ImageBitmapResource = require("./textures/resources/ImageBitmapResource.js"), ImageResource = require("./textures/resources/ImageResource.js"), SVGResource = require("./textures/resources/SVGResource.js"), VideoResource = require("./textures/resources/VideoResource.js");
function _interopNamespaceDefault(e) {
  var n = /* @__PURE__ */ Object.create(null);
  return e && Object.keys(e).forEach(function(k) {
    if (k !== "default") {
      var d = Object.getOwnPropertyDescriptor(e, k);
      Object.defineProperty(n, k, d.get ? d : {
        enumerable: !0,
        get: function() {
          return e[k];
        }
      });
    }
  }), n.default = e, n;
}
var utils__namespace = /* @__PURE__ */ _interopNamespaceDefault(utils$1);
const VERSION = "7.3.2";
exports.utils = utils__namespace;
exports.autoDetectRenderer = autoDetectRenderer.autoDetectRenderer;
exports.BackgroundSystem = BackgroundSystem.BackgroundSystem;
exports.BatchDrawCall = BatchDrawCall.BatchDrawCall;
exports.BatchGeometry = BatchGeometry.BatchGeometry;
exports.BatchRenderer = BatchRenderer.BatchRenderer;
exports.BatchShaderGenerator = BatchShaderGenerator.BatchShaderGenerator;
exports.BatchSystem = BatchSystem.BatchSystem;
exports.BatchTextureArray = BatchTextureArray.BatchTextureArray;
exports.ObjectRenderer = ObjectRenderer.ObjectRenderer;
exports.ContextSystem = ContextSystem.ContextSystem;
exports.Filter = Filter.Filter;
exports.FilterState = FilterState.FilterState;
exports.FilterSystem = FilterSystem.FilterSystem;
exports.SpriteMaskFilter = SpriteMaskFilter.SpriteMaskFilter;
exports.defaultFilterVertex = index.defaultFilterVertex;
exports.defaultVertex = index.defaultVertex;
exports.Framebuffer = Framebuffer.Framebuffer;
exports.FramebufferSystem = FramebufferSystem.FramebufferSystem;
exports.GLFramebuffer = GLFramebuffer.GLFramebuffer;
exports.MultisampleSystem = MultisampleSystem.MultisampleSystem;
exports.Attribute = Attribute.Attribute;
exports.Buffer = Buffer.Buffer;
exports.BufferSystem = BufferSystem.BufferSystem;
exports.Geometry = Geometry.Geometry;
exports.GeometrySystem = GeometrySystem.GeometrySystem;
exports.ViewableBuffer = ViewableBuffer.ViewableBuffer;
exports.MaskData = MaskData.MaskData;
exports.MaskSystem = MaskSystem.MaskSystem;
exports.ScissorSystem = ScissorSystem.ScissorSystem;
exports.StencilSystem = StencilSystem.StencilSystem;
exports.PluginSystem = PluginSystem.PluginSystem;
exports.ProjectionSystem = ProjectionSystem.ProjectionSystem;
exports.ObjectRendererSystem = ObjectRendererSystem.ObjectRendererSystem;
exports.Renderer = Renderer.Renderer;
exports.BaseRenderTexture = BaseRenderTexture.BaseRenderTexture;
exports.GenerateTextureSystem = GenerateTextureSystem.GenerateTextureSystem;
exports.RenderTexture = RenderTexture.RenderTexture;
exports.RenderTexturePool = RenderTexturePool.RenderTexturePool;
exports.RenderTextureSystem = RenderTextureSystem.RenderTextureSystem;
exports.GLProgram = GLProgram.GLProgram;
exports.IGLUniformData = GLProgram.IGLUniformData;
exports.Program = Program.Program;
exports.Shader = Shader.Shader;
exports.ShaderSystem = ShaderSystem.ShaderSystem;
exports.UniformGroup = UniformGroup.UniformGroup;
exports.checkMaxIfStatementsInShader = checkMaxIfStatementsInShader.checkMaxIfStatementsInShader;
exports.generateProgram = generateProgram.generateProgram;
exports.createUBOElements = generateUniformBufferSync.createUBOElements;
exports.generateUniformBufferSync = generateUniformBufferSync.generateUniformBufferSync;
exports.getUBOData = generateUniformBufferSync.getUBOData;
exports.getTestContext = getTestContext.getTestContext;
exports.uniformParsers = uniformParsers.uniformParsers;
exports.unsafeEvalSupported = unsafeEvalSupported.unsafeEvalSupported;
exports.StartupSystem = StartupSystem.StartupSystem;
exports.State = State.State;
exports.StateSystem = StateSystem.StateSystem;
exports.BaseTexture = BaseTexture.BaseTexture;
exports.GLTexture = GLTexture.GLTexture;
exports.Texture = Texture.Texture;
exports.TextureGCSystem = TextureGCSystem.TextureGCSystem;
exports.TextureMatrix = TextureMatrix.TextureMatrix;
exports.TextureSystem = TextureSystem.TextureSystem;
exports.TextureUvs = TextureUvs.TextureUvs;
exports.TransformFeedback = TransformFeedback.TransformFeedback;
exports.TransformFeedbackSystem = TransformFeedbackSystem.TransformFeedbackSystem;
exports.Quad = Quad.Quad;
exports.QuadUv = QuadUv.QuadUv;
exports.ViewSystem = ViewSystem.ViewSystem;
exports.SystemManager = SystemManager.SystemManager;
exports.BaseImageResource = BaseImageResource.BaseImageResource;
exports.Resource = Resource.Resource;
exports.AbstractMultiResource = AbstractMultiResource.AbstractMultiResource;
exports.ArrayResource = ArrayResource.ArrayResource;
exports.INSTALLED = autoDetectResource.INSTALLED;
exports.autoDetectResource = autoDetectResource.autoDetectResource;
exports.BufferResource = BufferResource.BufferResource;
exports.CanvasResource = CanvasResource.CanvasResource;
exports.CubeResource = CubeResource.CubeResource;
exports.ImageBitmapResource = ImageBitmapResource.ImageBitmapResource;
exports.ImageResource = ImageResource.ImageResource;
exports.SVGResource = SVGResource.SVGResource;
exports.VideoResource = VideoResource.VideoResource;
exports.VERSION = VERSION;
Object.keys(color).forEach(function(k) {
  k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k) && Object.defineProperty(exports, k, {
    enumerable: !0,
    get: function() {
      return color[k];
    }
  });
});
Object.keys(constants).forEach(function(k) {
  k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k) && Object.defineProperty(exports, k, {
    enumerable: !0,
    get: function() {
      return constants[k];
    }
  });
});
Object.keys(extensions).forEach(function(k) {
  k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k) && Object.defineProperty(exports, k, {
    enumerable: !0,
    get: function() {
      return extensions[k];
    }
  });
});
Object.keys(math).forEach(function(k) {
  k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k) && Object.defineProperty(exports, k, {
    enumerable: !0,
    get: function() {
      return math[k];
    }
  });
});
Object.keys(runner).forEach(function(k) {
  k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k) && Object.defineProperty(exports, k, {
    enumerable: !0,
    get: function() {
      return runner[k];
    }
  });
});
Object.keys(settings).forEach(function(k) {
  k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k) && Object.defineProperty(exports, k, {
    enumerable: !0,
    get: function() {
      return settings[k];
    }
  });
});
Object.keys(ticker).forEach(function(k) {
  k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k) && Object.defineProperty(exports, k, {
    enumerable: !0,
    get: function() {
      return ticker[k];
    }
  });
});


},{"./IRenderer.js":32,"./Renderer.js":33,"./autoDetectRenderer.js":34,"./background/BackgroundSystem.js":35,"./batch/BatchDrawCall.js":36,"./batch/BatchGeometry.js":37,"./batch/BatchRenderer.js":38,"./batch/BatchShaderGenerator.js":39,"./batch/BatchSystem.js":40,"./batch/BatchTextureArray.js":41,"./batch/ObjectRenderer.js":42,"./context/ContextSystem.js":47,"./filters/Filter.js":48,"./filters/FilterState.js":49,"./filters/FilterSystem.js":50,"./filters/IFilterTarget.js":51,"./filters/spriteMask/SpriteMaskFilter.js":54,"./fragments/index.js":59,"./framebuffer/Framebuffer.js":60,"./framebuffer/FramebufferSystem.js":61,"./framebuffer/GLFramebuffer.js":62,"./framebuffer/MultisampleSystem.js":63,"./geometry/Attribute.js":64,"./geometry/Buffer.js":65,"./geometry/BufferSystem.js":66,"./geometry/Geometry.js":68,"./geometry/GeometrySystem.js":69,"./geometry/ViewableBuffer.js":70,"./mask/MaskData.js":74,"./mask/MaskSystem.js":75,"./mask/ScissorSystem.js":76,"./mask/StencilSystem.js":77,"./plugin/PluginSystem.js":78,"./projection/ProjectionSystem.js":79,"./render/ObjectRendererSystem.js":85,"./renderTexture/BaseRenderTexture.js":80,"./renderTexture/GenerateTextureSystem.js":81,"./renderTexture/RenderTexture.js":82,"./renderTexture/RenderTexturePool.js":83,"./renderTexture/RenderTextureSystem.js":84,"./settings.js":86,"./shader/GLProgram.js":87,"./shader/Program.js":88,"./shader/Shader.js":89,"./shader/ShaderSystem.js":90,"./shader/UniformGroup.js":91,"./shader/utils/checkMaxIfStatementsInShader.js":94,"./shader/utils/generateProgram.js":97,"./shader/utils/generateUniformBufferSync.js":98,"./shader/utils/getTestContext.js":102,"./shader/utils/uniformParsers.js":109,"./shader/utils/unsafeEvalSupported.js":110,"./startup/StartupSystem.js":111,"./state/State.js":112,"./state/StateSystem.js":113,"./system/ISystem.js":115,"./system/SystemManager.js":116,"./systems.js":117,"./textures/BaseTexture.js":118,"./textures/GLTexture.js":119,"./textures/Texture.js":120,"./textures/TextureGCSystem.js":121,"./textures/TextureMatrix.js":122,"./textures/TextureSystem.js":123,"./textures/TextureUvs.js":124,"./textures/resources/AbstractMultiResource.js":125,"./textures/resources/ArrayResource.js":126,"./textures/resources/BaseImageResource.js":127,"./textures/resources/BufferResource.js":128,"./textures/resources/CanvasResource.js":129,"./textures/resources/CubeResource.js":130,"./textures/resources/ImageBitmapResource.js":131,"./textures/resources/ImageResource.js":132,"./textures/resources/Resource.js":133,"./textures/resources/SVGResource.js":134,"./textures/resources/VideoResource.js":135,"./textures/resources/autoDetectResource.js":136,"./textures/resources/index.js":137,"./transformFeedback/TransformFeedback.js":140,"./transformFeedback/TransformFeedbackSystem.js":141,"./utils/Quad.js":142,"./utils/QuadUv.js":143,"./view/ViewSystem.js":144,"@pixi/color":28,"@pixi/constants":31,"@pixi/extensions":160,"@pixi/math":169,"@pixi/runner":176,"@pixi/settings":180,"@pixi/ticker":187,"@pixi/utils":202}],73:[function(require,module,exports){
"use strict";
class AbstractMaskSystem {
  /**
   * @param renderer - The renderer this System works for.
   */
  constructor(renderer) {
    this.renderer = renderer, this.maskStack = [], this.glConst = 0;
  }
  /** Gets count of masks of certain type. */
  getStackLength() {
    return this.maskStack.length;
  }
  /**
   * Changes the mask stack that is used by this System.
   * @param {PIXI.MaskData[]} maskStack - The mask stack
   */
  setMaskStack(maskStack) {
    const { gl } = this.renderer, curStackLen = this.getStackLength();
    this.maskStack = maskStack;
    const newStackLen = this.getStackLength();
    newStackLen !== curStackLen && (newStackLen === 0 ? gl.disable(this.glConst) : (gl.enable(this.glConst), this._useCurrent()));
  }
  /**
   * Setup renderer to use the current mask data.
   * @private
   */
  _useCurrent() {
  }
  /** Destroys the mask stack. */
  destroy() {
    this.renderer = null, this.maskStack = null;
  }
}
exports.AbstractMaskSystem = AbstractMaskSystem;


},{}],74:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), Filter = require("../filters/Filter.js");
class MaskData {
  /**
   * Create MaskData
   * @param {PIXI.DisplayObject} [maskObject=null] - object that describes the mask
   */
  constructor(maskObject = null) {
    this.type = constants.MASK_TYPES.NONE, this.autoDetect = !0, this.maskObject = maskObject || null, this.pooled = !1, this.isMaskData = !0, this.resolution = null, this.multisample = Filter.Filter.defaultMultisample, this.enabled = !0, this.colorMask = 15, this._filters = null, this._stencilCounter = 0, this._scissorCounter = 0, this._scissorRect = null, this._scissorRectLocal = null, this._colorMask = 15, this._target = null;
  }
  /**
   * The sprite mask filter.
   * If set to `null`, the default sprite mask filter is used.
   * @default null
   */
  get filter() {
    return this._filters ? this._filters[0] : null;
  }
  set filter(value) {
    value ? this._filters ? this._filters[0] = value : this._filters = [value] : this._filters = null;
  }
  /** Resets the mask data after popMask(). */
  reset() {
    this.pooled && (this.maskObject = null, this.type = constants.MASK_TYPES.NONE, this.autoDetect = !0), this._target = null, this._scissorRectLocal = null;
  }
  /**
   * Copies counters from maskData above, called from pushMask().
   * @param maskAbove
   */
  copyCountersOrReset(maskAbove) {
    maskAbove ? (this._stencilCounter = maskAbove._stencilCounter, this._scissorCounter = maskAbove._scissorCounter, this._scissorRect = maskAbove._scissorRect) : (this._stencilCounter = 0, this._scissorCounter = 0, this._scissorRect = null);
  }
}
exports.MaskData = MaskData;


},{"../filters/Filter.js":48,"@pixi/constants":31}],75:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), extensions = require("@pixi/extensions"), SpriteMaskFilter = require("../filters/spriteMask/SpriteMaskFilter.js"), MaskData = require("./MaskData.js");
class MaskSystem {
  /**
   * @param renderer - The renderer this System works for.
   */
  constructor(renderer) {
    this.renderer = renderer, this.enableScissor = !0, this.alphaMaskPool = [], this.maskDataPool = [], this.maskStack = [], this.alphaMaskIndex = 0;
  }
  /**
   * Changes the mask stack that is used by this System.
   * @param maskStack - The mask stack
   */
  setMaskStack(maskStack) {
    this.maskStack = maskStack, this.renderer.scissor.setMaskStack(maskStack), this.renderer.stencil.setMaskStack(maskStack);
  }
  /**
   * Enables the mask and appends it to the current mask stack.
   *
   * NOTE: The batch renderer should be flushed beforehand to prevent pending renders from being masked.
   * @param {PIXI.DisplayObject} target - Display Object to push the mask to
   * @param {PIXI.MaskData|PIXI.Sprite|PIXI.Graphics|PIXI.DisplayObject} maskDataOrTarget - The masking data.
   */
  push(target, maskDataOrTarget) {
    let maskData = maskDataOrTarget;
    if (!maskData.isMaskData) {
      const d = this.maskDataPool.pop() || new MaskData.MaskData();
      d.pooled = !0, d.maskObject = maskDataOrTarget, maskData = d;
    }
    const maskAbove = this.maskStack.length !== 0 ? this.maskStack[this.maskStack.length - 1] : null;
    if (maskData.copyCountersOrReset(maskAbove), maskData._colorMask = maskAbove ? maskAbove._colorMask : 15, maskData.autoDetect && this.detect(maskData), maskData._target = target, maskData.type !== constants.MASK_TYPES.SPRITE && this.maskStack.push(maskData), maskData.enabled)
      switch (maskData.type) {
        case constants.MASK_TYPES.SCISSOR:
          this.renderer.scissor.push(maskData);
          break;
        case constants.MASK_TYPES.STENCIL:
          this.renderer.stencil.push(maskData);
          break;
        case constants.MASK_TYPES.SPRITE:
          maskData.copyCountersOrReset(null), this.pushSpriteMask(maskData);
          break;
        case constants.MASK_TYPES.COLOR:
          this.pushColorMask(maskData);
          break;
        default:
          break;
      }
    maskData.type === constants.MASK_TYPES.SPRITE && this.maskStack.push(maskData);
  }
  /**
   * Removes the last mask from the mask stack and doesn't return it.
   *
   * NOTE: The batch renderer should be flushed beforehand to render the masked contents before the mask is removed.
   * @param {PIXI.IMaskTarget} target - Display Object to pop the mask from
   */
  pop(target) {
    const maskData = this.maskStack.pop();
    if (!(!maskData || maskData._target !== target)) {
      if (maskData.enabled)
        switch (maskData.type) {
          case constants.MASK_TYPES.SCISSOR:
            this.renderer.scissor.pop(maskData);
            break;
          case constants.MASK_TYPES.STENCIL:
            this.renderer.stencil.pop(maskData.maskObject);
            break;
          case constants.MASK_TYPES.SPRITE:
            this.popSpriteMask(maskData);
            break;
          case constants.MASK_TYPES.COLOR:
            this.popColorMask(maskData);
            break;
          default:
            break;
        }
      if (maskData.reset(), maskData.pooled && this.maskDataPool.push(maskData), this.maskStack.length !== 0) {
        const maskCurrent = this.maskStack[this.maskStack.length - 1];
        maskCurrent.type === constants.MASK_TYPES.SPRITE && maskCurrent._filters && (maskCurrent._filters[0].maskSprite = maskCurrent.maskObject);
      }
    }
  }
  /**
   * Sets type of MaskData based on its maskObject.
   * @param maskData
   */
  detect(maskData) {
    const maskObject = maskData.maskObject;
    maskObject ? maskObject.isSprite ? maskData.type = constants.MASK_TYPES.SPRITE : this.enableScissor && this.renderer.scissor.testScissor(maskData) ? maskData.type = constants.MASK_TYPES.SCISSOR : maskData.type = constants.MASK_TYPES.STENCIL : maskData.type = constants.MASK_TYPES.COLOR;
  }
  /**
   * Applies the Mask and adds it to the current filter stack.
   * @param maskData - Sprite to be used as the mask.
   */
  pushSpriteMask(maskData) {
    const { maskObject } = maskData, target = maskData._target;
    let alphaMaskFilter = maskData._filters;
    alphaMaskFilter || (alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex], alphaMaskFilter || (alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex] = [new SpriteMaskFilter.SpriteMaskFilter()])), alphaMaskFilter[0].resolution = maskData.resolution, alphaMaskFilter[0].multisample = maskData.multisample, alphaMaskFilter[0].maskSprite = maskObject;
    const stashFilterArea = target.filterArea;
    target.filterArea = maskObject.getBounds(!0), this.renderer.filter.push(target, alphaMaskFilter), target.filterArea = stashFilterArea, maskData._filters || this.alphaMaskIndex++;
  }
  /**
   * Removes the last filter from the filter stack and doesn't return it.
   * @param maskData - Sprite to be used as the mask.
   */
  popSpriteMask(maskData) {
    this.renderer.filter.pop(), maskData._filters ? maskData._filters[0].maskSprite = null : (this.alphaMaskIndex--, this.alphaMaskPool[this.alphaMaskIndex][0].maskSprite = null);
  }
  /**
   * Pushes the color mask.
   * @param maskData - The mask data
   */
  pushColorMask(maskData) {
    const currColorMask = maskData._colorMask, nextColorMask = maskData._colorMask = currColorMask & maskData.colorMask;
    nextColorMask !== currColorMask && this.renderer.gl.colorMask(
      (nextColorMask & 1) !== 0,
      (nextColorMask & 2) !== 0,
      (nextColorMask & 4) !== 0,
      (nextColorMask & 8) !== 0
    );
  }
  /**
   * Pops the color mask.
   * @param maskData - The mask data
   */
  popColorMask(maskData) {
    const currColorMask = maskData._colorMask, nextColorMask = this.maskStack.length > 0 ? this.maskStack[this.maskStack.length - 1]._colorMask : 15;
    nextColorMask !== currColorMask && this.renderer.gl.colorMask(
      (nextColorMask & 1) !== 0,
      (nextColorMask & 2) !== 0,
      (nextColorMask & 4) !== 0,
      (nextColorMask & 8) !== 0
    );
  }
  destroy() {
    this.renderer = null;
  }
}
MaskSystem.extension = {
  type: extensions.ExtensionType.RendererSystem,
  name: "mask"
};
extensions.extensions.add(MaskSystem);
exports.MaskSystem = MaskSystem;


},{"../filters/spriteMask/SpriteMaskFilter.js":54,"./MaskData.js":74,"@pixi/constants":31,"@pixi/extensions":160}],76:[function(require,module,exports){
"use strict";
var extensions = require("@pixi/extensions"), math = require("@pixi/math"), settings = require("@pixi/settings"), AbstractMaskSystem = require("./AbstractMaskSystem.js");
const tempMatrix = new math.Matrix(), rectPool = [], _ScissorSystem = class _ScissorSystem2 extends AbstractMaskSystem.AbstractMaskSystem {
  /**
   * @param {PIXI.Renderer} renderer - The renderer this System works for.
   */
  constructor(renderer) {
    super(renderer), this.glConst = settings.settings.ADAPTER.getWebGLRenderingContext().SCISSOR_TEST;
  }
  getStackLength() {
    const maskData = this.maskStack[this.maskStack.length - 1];
    return maskData ? maskData._scissorCounter : 0;
  }
  /**
   * evaluates _boundsTransformed, _scissorRect for MaskData
   * @param maskData
   */
  calcScissorRect(maskData) {
    if (maskData._scissorRectLocal)
      return;
    const prevData = maskData._scissorRect, { maskObject } = maskData, { renderer } = this, renderTextureSystem = renderer.renderTexture, rect = maskObject.getBounds(!0, rectPool.pop() ?? new math.Rectangle());
    this.roundFrameToPixels(
      rect,
      renderTextureSystem.current ? renderTextureSystem.current.resolution : renderer.resolution,
      renderTextureSystem.sourceFrame,
      renderTextureSystem.destinationFrame,
      renderer.projection.transform
    ), prevData && rect.fit(prevData), maskData._scissorRectLocal = rect;
  }
  static isMatrixRotated(matrix) {
    if (!matrix)
      return !1;
    const { a, b, c, d } = matrix;
    return (Math.abs(b) > 1e-4 || Math.abs(c) > 1e-4) && (Math.abs(a) > 1e-4 || Math.abs(d) > 1e-4);
  }
  /**
   * Test, whether the object can be scissor mask with current renderer projection.
   * Calls "calcScissorRect()" if its true.
   * @param maskData - mask data
   * @returns whether Whether the object can be scissor mask
   */
  testScissor(maskData) {
    const { maskObject } = maskData;
    if (!maskObject.isFastRect || !maskObject.isFastRect() || _ScissorSystem2.isMatrixRotated(maskObject.worldTransform) || _ScissorSystem2.isMatrixRotated(this.renderer.projection.transform))
      return !1;
    this.calcScissorRect(maskData);
    const rect = maskData._scissorRectLocal;
    return rect.width > 0 && rect.height > 0;
  }
  roundFrameToPixels(frame, resolution, bindingSourceFrame, bindingDestinationFrame, transform) {
    _ScissorSystem2.isMatrixRotated(transform) || (transform = transform ? tempMatrix.copyFrom(transform) : tempMatrix.identity(), transform.translate(-bindingSourceFrame.x, -bindingSourceFrame.y).scale(
      bindingDestinationFrame.width / bindingSourceFrame.width,
      bindingDestinationFrame.height / bindingSourceFrame.height
    ).translate(bindingDestinationFrame.x, bindingDestinationFrame.y), this.renderer.filter.transformAABB(transform, frame), frame.fit(bindingDestinationFrame), frame.x = Math.round(frame.x * resolution), frame.y = Math.round(frame.y * resolution), frame.width = Math.round(frame.width * resolution), frame.height = Math.round(frame.height * resolution));
  }
  /**
   * Applies the Mask and adds it to the current stencil stack.
   * @author alvin
   * @param maskData - The mask data.
   */
  push(maskData) {
    maskData._scissorRectLocal || this.calcScissorRect(maskData);
    const { gl } = this.renderer;
    maskData._scissorRect || gl.enable(gl.SCISSOR_TEST), maskData._scissorCounter++, maskData._scissorRect = maskData._scissorRectLocal, this._useCurrent();
  }
  /**
   * This should be called after a mask is popped off the mask stack. It will rebind the scissor box to be latest with the
   * last mask in the stack.
   *
   * This can also be called when you directly modify the scissor box and want to restore PixiJS state.
   * @param maskData - The mask data.
   */
  pop(maskData) {
    const { gl } = this.renderer;
    maskData && rectPool.push(maskData._scissorRectLocal), this.getStackLength() > 0 ? this._useCurrent() : gl.disable(gl.SCISSOR_TEST);
  }
  /**
   * Setup renderer to use the current scissor data.
   * @private
   */
  _useCurrent() {
    const rect = this.maskStack[this.maskStack.length - 1]._scissorRect;
    let y;
    this.renderer.renderTexture.current ? y = rect.y : y = this.renderer.height - rect.height - rect.y, this.renderer.gl.scissor(rect.x, y, rect.width, rect.height);
  }
};
_ScissorSystem.extension = {
  type: extensions.ExtensionType.RendererSystem,
  name: "scissor"
};
let ScissorSystem = _ScissorSystem;
extensions.extensions.add(ScissorSystem);
exports.ScissorSystem = ScissorSystem;


},{"./AbstractMaskSystem.js":73,"@pixi/extensions":160,"@pixi/math":169,"@pixi/settings":180}],77:[function(require,module,exports){
"use strict";
var extensions = require("@pixi/extensions"), settings = require("@pixi/settings"), AbstractMaskSystem = require("./AbstractMaskSystem.js");
class StencilSystem extends AbstractMaskSystem.AbstractMaskSystem {
  /**
   * @param renderer - The renderer this System works for.
   */
  constructor(renderer) {
    super(renderer), this.glConst = settings.settings.ADAPTER.getWebGLRenderingContext().STENCIL_TEST;
  }
  getStackLength() {
    const maskData = this.maskStack[this.maskStack.length - 1];
    return maskData ? maskData._stencilCounter : 0;
  }
  /**
   * Applies the Mask and adds it to the current stencil stack.
   * @param maskData - The mask data
   */
  push(maskData) {
    const maskObject = maskData.maskObject, { gl } = this.renderer, prevMaskCount = maskData._stencilCounter;
    prevMaskCount === 0 && (this.renderer.framebuffer.forceStencil(), gl.clearStencil(0), gl.clear(gl.STENCIL_BUFFER_BIT), gl.enable(gl.STENCIL_TEST)), maskData._stencilCounter++;
    const colorMask = maskData._colorMask;
    colorMask !== 0 && (maskData._colorMask = 0, gl.colorMask(!1, !1, !1, !1)), gl.stencilFunc(gl.EQUAL, prevMaskCount, 4294967295), gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR), maskObject.renderable = !0, maskObject.render(this.renderer), this.renderer.batch.flush(), maskObject.renderable = !1, colorMask !== 0 && (maskData._colorMask = colorMask, gl.colorMask(
      (colorMask & 1) !== 0,
      (colorMask & 2) !== 0,
      (colorMask & 4) !== 0,
      (colorMask & 8) !== 0
    )), this._useCurrent();
  }
  /**
   * Pops stencil mask. MaskData is already removed from stack
   * @param {PIXI.DisplayObject} maskObject - object of popped mask data
   */
  pop(maskObject) {
    const gl = this.renderer.gl;
    if (this.getStackLength() === 0)
      gl.disable(gl.STENCIL_TEST);
    else {
      const maskData = this.maskStack.length !== 0 ? this.maskStack[this.maskStack.length - 1] : null, colorMask = maskData ? maskData._colorMask : 15;
      colorMask !== 0 && (maskData._colorMask = 0, gl.colorMask(!1, !1, !1, !1)), gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR), maskObject.renderable = !0, maskObject.render(this.renderer), this.renderer.batch.flush(), maskObject.renderable = !1, colorMask !== 0 && (maskData._colorMask = colorMask, gl.colorMask(
        (colorMask & 1) !== 0,
        (colorMask & 2) !== 0,
        (colorMask & 4) !== 0,
        (colorMask & 8) !== 0
      )), this._useCurrent();
    }
  }
  /**
   * Setup renderer to use the current stencil data.
   * @private
   */
  _useCurrent() {
    const gl = this.renderer.gl;
    gl.stencilFunc(gl.EQUAL, this.getStackLength(), 4294967295), gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
  }
}
StencilSystem.extension = {
  type: extensions.ExtensionType.RendererSystem,
  name: "stencil"
};
extensions.extensions.add(StencilSystem);
exports.StencilSystem = StencilSystem;


},{"./AbstractMaskSystem.js":73,"@pixi/extensions":160,"@pixi/settings":180}],78:[function(require,module,exports){
"use strict";
var extensions = require("@pixi/extensions"), utils = require("@pixi/utils");
class PluginSystem {
  constructor(renderer) {
    this.renderer = renderer, this.plugins = {}, Object.defineProperties(this.plugins, {
      extract: {
        enumerable: !1,
        get() {
          return utils.deprecation("7.0.0", "renderer.plugins.extract has moved to renderer.extract"), renderer.extract;
        }
      },
      prepare: {
        enumerable: !1,
        get() {
          return utils.deprecation("7.0.0", "renderer.plugins.prepare has moved to renderer.prepare"), renderer.prepare;
        }
      },
      interaction: {
        enumerable: !1,
        get() {
          return utils.deprecation("7.0.0", "renderer.plugins.interaction has been deprecated, use renderer.events"), renderer.events;
        }
      }
    });
  }
  /**
   * Initialize the plugins.
   * @protected
   */
  init() {
    const staticMap = this.rendererPlugins;
    for (const o in staticMap)
      this.plugins[o] = new staticMap[o](this.renderer);
  }
  destroy() {
    for (const o in this.plugins)
      this.plugins[o].destroy(), this.plugins[o] = null;
  }
}
PluginSystem.extension = {
  type: [
    extensions.ExtensionType.RendererSystem,
    extensions.ExtensionType.CanvasRendererSystem
  ],
  name: "_plugin"
};
extensions.extensions.add(PluginSystem);
exports.PluginSystem = PluginSystem;


},{"@pixi/extensions":160,"@pixi/utils":202}],79:[function(require,module,exports){
"use strict";
var extensions = require("@pixi/extensions"), math = require("@pixi/math");
class ProjectionSystem {
  /** @param renderer - The renderer this System works for. */
  constructor(renderer) {
    this.renderer = renderer, this.destinationFrame = null, this.sourceFrame = null, this.defaultFrame = null, this.projectionMatrix = new math.Matrix(), this.transform = null;
  }
  /**
   * Updates the projection-matrix based on the sourceFrame → destinationFrame mapping provided.
   *
   * NOTE: It is expected you call `renderer.framebuffer.setViewport(destinationFrame)` after this. This is because
   * the framebuffer viewport converts shader vertex output in normalized device coordinates to window coordinates.
   *
   * NOTE-2: {@link PIXI.RenderTextureSystem#bind} updates the projection-matrix when you bind a render-texture.
   * It is expected
   * that you dirty the current bindings when calling this manually.
   * @param destinationFrame - The rectangle in the render-target to render the contents into. If rendering to the canvas,
   *  the origin is on the top-left; if rendering to a render-texture, the origin is on the bottom-left.
   * @param sourceFrame - The rectangle in world space that contains the contents being rendered.
   * @param resolution - The resolution of the render-target, which is the ratio of
   *  world-space (or CSS) pixels to physical pixels.
   * @param root - Whether the render-target is the screen. This is required because rendering to textures
   *  is y-flipped (i.e. upside down relative to the screen).
   */
  update(destinationFrame, sourceFrame, resolution, root) {
    this.destinationFrame = destinationFrame || this.destinationFrame || this.defaultFrame, this.sourceFrame = sourceFrame || this.sourceFrame || destinationFrame, this.calculateProjection(this.destinationFrame, this.sourceFrame, resolution, root), this.transform && this.projectionMatrix.append(this.transform);
    const renderer = this.renderer;
    renderer.globalUniforms.uniforms.projectionMatrix = this.projectionMatrix, renderer.globalUniforms.update(), renderer.shader.shader && renderer.shader.syncUniformGroup(renderer.shader.shader.uniforms.globals);
  }
  /**
   * Calculates the `projectionMatrix` to map points inside `sourceFrame` to inside `destinationFrame`.
   * @param _destinationFrame - The destination frame in the render-target.
   * @param sourceFrame - The source frame in world space.
   * @param _resolution - The render-target's resolution, i.e. ratio of CSS to physical pixels.
   * @param root - Whether rendering into the screen. Otherwise, if rendering to a framebuffer, the projection
   *  is y-flipped.
   */
  calculateProjection(_destinationFrame, sourceFrame, _resolution, root) {
    const pm = this.projectionMatrix, sign = root ? -1 : 1;
    pm.identity(), pm.a = 1 / sourceFrame.width * 2, pm.d = sign * (1 / sourceFrame.height * 2), pm.tx = -1 - sourceFrame.x * pm.a, pm.ty = -sign - sourceFrame.y * pm.d;
  }
  /**
   * Sets the transform of the active render target to the given matrix.
   * @param _matrix - The transformation matrix
   */
  setTransform(_matrix) {
  }
  destroy() {
    this.renderer = null;
  }
}
ProjectionSystem.extension = {
  type: extensions.ExtensionType.RendererSystem,
  name: "projection"
};
extensions.extensions.add(ProjectionSystem);
exports.ProjectionSystem = ProjectionSystem;


},{"@pixi/extensions":160,"@pixi/math":169}],80:[function(require,module,exports){
"use strict";
var color = require("@pixi/color"), constants = require("@pixi/constants"), Framebuffer = require("../framebuffer/Framebuffer.js"), BaseTexture = require("../textures/BaseTexture.js");
class BaseRenderTexture extends BaseTexture.BaseTexture {
  /**
   * @param options
   * @param {number} [options.width=100] - The width of the base render texture.
   * @param {number} [options.height=100] - The height of the base render texture.
   * @param {PIXI.SCALE_MODES} [options.scaleMode=PIXI.BaseTexture.defaultOptions.scaleMode] - See {@link PIXI.SCALE_MODES}
   *   for possible values.
   * @param {number} [options.resolution=PIXI.settings.RESOLUTION] - The resolution / device pixel ratio
   *   of the texture being generated.
   * @param {PIXI.MSAA_QUALITY} [options.multisample=PIXI.MSAA_QUALITY.NONE] - The number of samples of the frame buffer.
   */
  constructor(options = {}) {
    if (typeof options == "number") {
      const width = arguments[0], height = arguments[1], scaleMode = arguments[2], resolution = arguments[3];
      options = { width, height, scaleMode, resolution };
    }
    options.width = options.width ?? 100, options.height = options.height ?? 100, options.multisample ?? (options.multisample = constants.MSAA_QUALITY.NONE), super(null, options), this.mipmap = constants.MIPMAP_MODES.OFF, this.valid = !0, this._clear = new color.Color([0, 0, 0, 0]), this.framebuffer = new Framebuffer.Framebuffer(this.realWidth, this.realHeight).addColorTexture(0, this), this.framebuffer.multisample = options.multisample, this.maskStack = [], this.filterStack = [{}];
  }
  /** Color when clearning the texture. */
  set clearColor(value) {
    this._clear.setValue(value);
  }
  get clearColor() {
    return this._clear.value;
  }
  /**
   * Color object when clearning the texture.
   * @readonly
   * @since 7.2.0
   */
  get clear() {
    return this._clear;
  }
  /**
   * Shortcut to `this.framebuffer.multisample`.
   * @default PIXI.MSAA_QUALITY.NONE
   */
  get multisample() {
    return this.framebuffer.multisample;
  }
  set multisample(value) {
    this.framebuffer.multisample = value;
  }
  /**
   * Resizes the BaseRenderTexture.
   * @param desiredWidth - The desired width to resize to.
   * @param desiredHeight - The desired height to resize to.
   */
  resize(desiredWidth, desiredHeight) {
    this.framebuffer.resize(desiredWidth * this.resolution, desiredHeight * this.resolution), this.setRealSize(this.framebuffer.width, this.framebuffer.height);
  }
  /**
   * Frees the texture and framebuffer from WebGL memory without destroying this texture object.
   * This means you can still use the texture later which will upload it to GPU
   * memory again.
   * @fires PIXI.BaseTexture#dispose
   */
  dispose() {
    this.framebuffer.dispose(), super.dispose();
  }
  /** Destroys this texture. */
  destroy() {
    super.destroy(), this.framebuffer.destroyDepthTexture(), this.framebuffer = null;
  }
}
exports.BaseRenderTexture = BaseRenderTexture;


},{"../framebuffer/Framebuffer.js":60,"../textures/BaseTexture.js":118,"@pixi/color":28,"@pixi/constants":31}],81:[function(require,module,exports){
"use strict";
var extensions = require("@pixi/extensions"), math = require("@pixi/math"), RenderTexture = require("./RenderTexture.js");
const tempTransform = new math.Transform(), tempRect = new math.Rectangle();
class GenerateTextureSystem {
  constructor(renderer) {
    this.renderer = renderer, this._tempMatrix = new math.Matrix();
  }
  /**
   * A Useful function that returns a texture of the display object that can then be used to create sprites
   * This can be quite useful if your displayObject is complicated and needs to be reused multiple times.
   * @param displayObject - The displayObject the object will be generated from.
   * @param {IGenerateTextureOptions} options - Generate texture options.
   * @param {PIXI.Rectangle} options.region - The region of the displayObject, that shall be rendered,
   *        if no region is specified, defaults to the local bounds of the displayObject.
   * @param {number} [options.resolution] - If not given, the renderer's resolution is used.
   * @param {PIXI.MSAA_QUALITY} [options.multisample] - If not given, the renderer's multisample is used.
   * @returns a shiny new texture of the display object passed in
   */
  generateTexture(displayObject, options) {
    const { region: manualRegion, ...textureOptions } = options || {}, region = manualRegion?.copyTo(tempRect) || displayObject.getLocalBounds(tempRect, !0), resolution = textureOptions.resolution || this.renderer.resolution;
    region.width = Math.max(region.width, 1 / resolution), region.height = Math.max(region.height, 1 / resolution), textureOptions.width = region.width, textureOptions.height = region.height, textureOptions.resolution = resolution, textureOptions.multisample ?? (textureOptions.multisample = this.renderer.multisample);
    const renderTexture = RenderTexture.RenderTexture.create(textureOptions);
    this._tempMatrix.tx = -region.x, this._tempMatrix.ty = -region.y;
    const transform = displayObject.transform;
    return displayObject.transform = tempTransform, this.renderer.render(displayObject, {
      renderTexture,
      transform: this._tempMatrix,
      skipUpdateTransform: !!displayObject.parent,
      blit: !0
    }), displayObject.transform = transform, renderTexture;
  }
  destroy() {
  }
}
GenerateTextureSystem.extension = {
  type: [
    extensions.ExtensionType.RendererSystem,
    extensions.ExtensionType.CanvasRendererSystem
  ],
  name: "textureGenerator"
};
extensions.extensions.add(GenerateTextureSystem);
exports.GenerateTextureSystem = GenerateTextureSystem;


},{"./RenderTexture.js":82,"@pixi/extensions":160,"@pixi/math":169}],82:[function(require,module,exports){
"use strict";
var Texture = require("../textures/Texture.js"), BaseRenderTexture = require("./BaseRenderTexture.js");
class RenderTexture extends Texture.Texture {
  /**
   * @param baseRenderTexture - The base texture object that this texture uses.
   * @param frame - The rectangle frame of the texture to show.
   */
  constructor(baseRenderTexture, frame) {
    super(baseRenderTexture, frame), this.valid = !0, this.filterFrame = null, this.filterPoolKey = null, this.updateUvs();
  }
  /**
   * Shortcut to `this.baseTexture.framebuffer`, saves baseTexture cast.
   * @readonly
   */
  get framebuffer() {
    return this.baseTexture.framebuffer;
  }
  /**
   * Shortcut to `this.framebuffer.multisample`.
   * @default PIXI.MSAA_QUALITY.NONE
   */
  get multisample() {
    return this.framebuffer.multisample;
  }
  set multisample(value) {
    this.framebuffer.multisample = value;
  }
  /**
   * Resizes the RenderTexture.
   * @param desiredWidth - The desired width to resize to.
   * @param desiredHeight - The desired height to resize to.
   * @param resizeBaseTexture - Should the baseTexture.width and height values be resized as well?
   */
  resize(desiredWidth, desiredHeight, resizeBaseTexture = !0) {
    const resolution = this.baseTexture.resolution, width = Math.round(desiredWidth * resolution) / resolution, height = Math.round(desiredHeight * resolution) / resolution;
    this.valid = width > 0 && height > 0, this._frame.width = this.orig.width = width, this._frame.height = this.orig.height = height, resizeBaseTexture && this.baseTexture.resize(width, height), this.updateUvs();
  }
  /**
   * Changes the resolution of baseTexture, but does not change framebuffer size.
   * @param resolution - The new resolution to apply to RenderTexture
   */
  setResolution(resolution) {
    const { baseTexture } = this;
    baseTexture.resolution !== resolution && (baseTexture.setResolution(resolution), this.resize(baseTexture.width, baseTexture.height, !1));
  }
  /**
   * A short hand way of creating a render texture.
   * @param options - Options
   * @param {number} [options.width=100] - The width of the render texture
   * @param {number} [options.height=100] - The height of the render texture
   * @param {PIXI.SCALE_MODES} [options.scaleMode=PIXI.BaseTexture.defaultOptions.scaleMode] - See {@link PIXI.SCALE_MODES}
   *    for possible values
   * @param {number} [options.resolution=PIXI.settings.RESOLUTION] - The resolution / device pixel ratio of the texture
   *    being generated
   * @param {PIXI.MSAA_QUALITY} [options.multisample=PIXI.MSAA_QUALITY.NONE] - The number of samples of the frame buffer
   * @returns The new render texture
   */
  static create(options) {
    return new RenderTexture(new BaseRenderTexture.BaseRenderTexture(options));
  }
}
exports.RenderTexture = RenderTexture;


},{"../textures/Texture.js":120,"./BaseRenderTexture.js":80}],83:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), utils = require("@pixi/utils"), BaseRenderTexture = require("./BaseRenderTexture.js"), RenderTexture = require("./RenderTexture.js");
class RenderTexturePool {
  /**
   * @param textureOptions - options that will be passed to BaseRenderTexture constructor
   * @param {PIXI.SCALE_MODES} [textureOptions.scaleMode] - See {@link PIXI.SCALE_MODES} for possible values.
   */
  constructor(textureOptions) {
    this.texturePool = {}, this.textureOptions = textureOptions || {}, this.enableFullScreen = !1, this._pixelsWidth = 0, this._pixelsHeight = 0;
  }
  /**
   * Creates texture with params that were specified in pool constructor.
   * @param realWidth - Width of texture in pixels.
   * @param realHeight - Height of texture in pixels.
   * @param multisample - Number of samples of the framebuffer.
   */
  createTexture(realWidth, realHeight, multisample = constants.MSAA_QUALITY.NONE) {
    const baseRenderTexture = new BaseRenderTexture.BaseRenderTexture(Object.assign({
      width: realWidth,
      height: realHeight,
      resolution: 1,
      multisample
    }, this.textureOptions));
    return new RenderTexture.RenderTexture(baseRenderTexture);
  }
  /**
   * Gets a Power-of-Two render texture or fullScreen texture
   * @param minWidth - The minimum width of the render texture.
   * @param minHeight - The minimum height of the render texture.
   * @param resolution - The resolution of the render texture.
   * @param multisample - Number of samples of the render texture.
   * @returns The new render texture.
   */
  getOptimalTexture(minWidth, minHeight, resolution = 1, multisample = constants.MSAA_QUALITY.NONE) {
    let key;
    minWidth = Math.max(Math.ceil(minWidth * resolution - 1e-6), 1), minHeight = Math.max(Math.ceil(minHeight * resolution - 1e-6), 1), !this.enableFullScreen || minWidth !== this._pixelsWidth || minHeight !== this._pixelsHeight ? (minWidth = utils.nextPow2(minWidth), minHeight = utils.nextPow2(minHeight), key = ((minWidth & 65535) << 16 | minHeight & 65535) >>> 0, multisample > 1 && (key += multisample * 4294967296)) : key = multisample > 1 ? -multisample : -1, this.texturePool[key] || (this.texturePool[key] = []);
    let renderTexture = this.texturePool[key].pop();
    return renderTexture || (renderTexture = this.createTexture(minWidth, minHeight, multisample)), renderTexture.filterPoolKey = key, renderTexture.setResolution(resolution), renderTexture;
  }
  /**
   * Gets extra texture of the same size as input renderTexture
   *
   * `getFilterTexture(input, 0.5)` or `getFilterTexture(0.5, input)`
   * @param input - renderTexture from which size and resolution will be copied
   * @param resolution - override resolution of the renderTexture
   *  It overrides, it does not multiply
   * @param multisample - number of samples of the renderTexture
   */
  getFilterTexture(input, resolution, multisample) {
    const filterTexture = this.getOptimalTexture(
      input.width,
      input.height,
      resolution || input.resolution,
      multisample || constants.MSAA_QUALITY.NONE
    );
    return filterTexture.filterFrame = input.filterFrame, filterTexture;
  }
  /**
   * Place a render texture back into the pool.
   * @param renderTexture - The renderTexture to free
   */
  returnTexture(renderTexture) {
    const key = renderTexture.filterPoolKey;
    renderTexture.filterFrame = null, this.texturePool[key].push(renderTexture);
  }
  /**
   * Alias for returnTexture, to be compliant with FilterSystem interface.
   * @param renderTexture - The renderTexture to free
   */
  returnFilterTexture(renderTexture) {
    this.returnTexture(renderTexture);
  }
  /**
   * Clears the pool.
   * @param destroyTextures - Destroy all stored textures.
   */
  clear(destroyTextures) {
    if (destroyTextures = destroyTextures !== !1, destroyTextures)
      for (const i in this.texturePool) {
        const textures = this.texturePool[i];
        if (textures)
          for (let j = 0; j < textures.length; j++)
            textures[j].destroy(!0);
      }
    this.texturePool = {};
  }
  /**
   * If screen size was changed, drops all screen-sized textures,
   * sets new screen size, sets `enableFullScreen` to true
   *
   * Size is measured in pixels, `renderer.view` can be passed here, not `renderer.screen`
   * @param size - Initial size of screen.
   */
  setScreenSize(size) {
    if (!(size.width === this._pixelsWidth && size.height === this._pixelsHeight)) {
      this.enableFullScreen = size.width > 0 && size.height > 0;
      for (const i in this.texturePool) {
        if (!(Number(i) < 0))
          continue;
        const textures = this.texturePool[i];
        if (textures)
          for (let j = 0; j < textures.length; j++)
            textures[j].destroy(!0);
        this.texturePool[i] = [];
      }
      this._pixelsWidth = size.width, this._pixelsHeight = size.height;
    }
  }
}
RenderTexturePool.SCREEN_KEY = -1;
exports.RenderTexturePool = RenderTexturePool;


},{"./BaseRenderTexture.js":80,"./RenderTexture.js":82,"@pixi/constants":31,"@pixi/utils":202}],84:[function(require,module,exports){
"use strict";
var color = require("@pixi/color"), extensions = require("@pixi/extensions"), math = require("@pixi/math");
const tempRect = new math.Rectangle(), tempRect2 = new math.Rectangle();
class RenderTextureSystem {
  /**
   * @param renderer - The renderer this System works for.
   */
  constructor(renderer) {
    this.renderer = renderer, this.defaultMaskStack = [], this.current = null, this.sourceFrame = new math.Rectangle(), this.destinationFrame = new math.Rectangle(), this.viewportFrame = new math.Rectangle();
  }
  contextChange() {
    const attributes = this.renderer?.gl.getContextAttributes();
    this._rendererPremultipliedAlpha = !!(attributes && attributes.alpha && attributes.premultipliedAlpha);
  }
  /**
   * Bind the current render texture.
   * @param renderTexture - RenderTexture to bind, by default its `null` - the screen.
   * @param sourceFrame - Part of world that is mapped to the renderTexture.
   * @param destinationFrame - Part of renderTexture, by default it has the same size as sourceFrame.
   */
  bind(renderTexture = null, sourceFrame, destinationFrame) {
    const renderer = this.renderer;
    this.current = renderTexture;
    let baseTexture, framebuffer, resolution;
    renderTexture ? (baseTexture = renderTexture.baseTexture, resolution = baseTexture.resolution, sourceFrame || (tempRect.width = renderTexture.frame.width, tempRect.height = renderTexture.frame.height, sourceFrame = tempRect), destinationFrame || (tempRect2.x = renderTexture.frame.x, tempRect2.y = renderTexture.frame.y, tempRect2.width = sourceFrame.width, tempRect2.height = sourceFrame.height, destinationFrame = tempRect2), framebuffer = baseTexture.framebuffer) : (resolution = renderer.resolution, sourceFrame || (tempRect.width = renderer._view.screen.width, tempRect.height = renderer._view.screen.height, sourceFrame = tempRect), destinationFrame || (destinationFrame = tempRect, destinationFrame.width = sourceFrame.width, destinationFrame.height = sourceFrame.height));
    const viewportFrame = this.viewportFrame;
    viewportFrame.x = destinationFrame.x * resolution, viewportFrame.y = destinationFrame.y * resolution, viewportFrame.width = destinationFrame.width * resolution, viewportFrame.height = destinationFrame.height * resolution, renderTexture || (viewportFrame.y = renderer.view.height - (viewportFrame.y + viewportFrame.height)), viewportFrame.ceil(), this.renderer.framebuffer.bind(framebuffer, viewportFrame), this.renderer.projection.update(destinationFrame, sourceFrame, resolution, !framebuffer), renderTexture ? this.renderer.mask.setMaskStack(baseTexture.maskStack) : this.renderer.mask.setMaskStack(this.defaultMaskStack), this.sourceFrame.copyFrom(sourceFrame), this.destinationFrame.copyFrom(destinationFrame);
  }
  /**
   * Erases the render texture and fills the drawing area with a colour.
   * @param clearColor - The color as rgba, default to use the renderer backgroundColor
   * @param [mask=BUFFER_BITS.COLOR | BUFFER_BITS.DEPTH] - Bitwise OR of masks
   *  that indicate the buffers to be cleared, by default COLOR and DEPTH buffers.
   */
  clear(clearColor, mask) {
    const fallbackColor = this.current ? this.current.baseTexture.clear : this.renderer.background.backgroundColor, color$1 = color.Color.shared.setValue(clearColor || fallbackColor);
    (this.current && this.current.baseTexture.alphaMode > 0 || !this.current && this._rendererPremultipliedAlpha) && color$1.premultiply(color$1.alpha);
    const destinationFrame = this.destinationFrame, baseFrame = this.current ? this.current.baseTexture : this.renderer._view.screen, clearMask = destinationFrame.width !== baseFrame.width || destinationFrame.height !== baseFrame.height;
    if (clearMask) {
      let { x, y, width, height } = this.viewportFrame;
      x = Math.round(x), y = Math.round(y), width = Math.round(width), height = Math.round(height), this.renderer.gl.enable(this.renderer.gl.SCISSOR_TEST), this.renderer.gl.scissor(x, y, width, height);
    }
    this.renderer.framebuffer.clear(color$1.red, color$1.green, color$1.blue, color$1.alpha, mask), clearMask && this.renderer.scissor.pop();
  }
  resize() {
    this.bind(null);
  }
  /** Resets render-texture state. */
  reset() {
    this.bind(null);
  }
  destroy() {
    this.renderer = null;
  }
}
RenderTextureSystem.extension = {
  type: extensions.ExtensionType.RendererSystem,
  name: "renderTexture"
};
extensions.extensions.add(RenderTextureSystem);
exports.RenderTextureSystem = RenderTextureSystem;


},{"@pixi/color":28,"@pixi/extensions":160,"@pixi/math":169}],85:[function(require,module,exports){
"use strict";
var extensions = require("@pixi/extensions");
class ObjectRendererSystem {
  // renderers scene graph!
  constructor(renderer) {
    this.renderer = renderer;
  }
  /**
   * Renders the object to its WebGL view.
   * @param displayObject - The object to be rendered.
   * @param options - the options to be passed to the renderer
   */
  render(displayObject, options) {
    const renderer = this.renderer;
    let renderTexture, clear, transform, skipUpdateTransform;
    if (options && (renderTexture = options.renderTexture, clear = options.clear, transform = options.transform, skipUpdateTransform = options.skipUpdateTransform), this.renderingToScreen = !renderTexture, renderer.runners.prerender.emit(), renderer.emit("prerender"), renderer.projection.transform = transform, !renderer.context.isLost) {
      if (renderTexture || (this.lastObjectRendered = displayObject), !skipUpdateTransform) {
        const cacheParent = displayObject.enableTempParent();
        displayObject.updateTransform(), displayObject.disableTempParent(cacheParent);
      }
      renderer.renderTexture.bind(renderTexture), renderer.batch.currentRenderer.start(), (clear ?? renderer.background.clearBeforeRender) && renderer.renderTexture.clear(), displayObject.render(renderer), renderer.batch.currentRenderer.flush(), renderTexture && (options.blit && renderer.framebuffer.blit(), renderTexture.baseTexture.update()), renderer.runners.postrender.emit(), renderer.projection.transform = null, renderer.emit("postrender");
    }
  }
  destroy() {
    this.renderer = null, this.lastObjectRendered = null;
  }
}
ObjectRendererSystem.extension = {
  type: extensions.ExtensionType.RendererSystem,
  name: "objectRenderer"
};
extensions.extensions.add(ObjectRendererSystem);
exports.ObjectRendererSystem = ObjectRendererSystem;


},{"@pixi/extensions":160}],86:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), settings = require("@pixi/settings"), utils = require("@pixi/utils"), BatchRenderer = require("./batch/BatchRenderer.js"), Filter = require("./filters/Filter.js"), Program = require("./shader/Program.js");
require("./systems.js");
var BaseTexture = require("./textures/BaseTexture.js"), ContextSystem = require("./context/ContextSystem.js"), BackgroundSystem = require("./background/BackgroundSystem.js"), ViewSystem = require("./view/ViewSystem.js"), StartupSystem = require("./startup/StartupSystem.js"), TextureGCSystem = require("./textures/TextureGCSystem.js");
settings.settings.PREFER_ENV = constants.ENV.WEBGL2;
settings.settings.STRICT_TEXTURE_CACHE = !1;
settings.settings.RENDER_OPTIONS = {
  ...ContextSystem.ContextSystem.defaultOptions,
  ...BackgroundSystem.BackgroundSystem.defaultOptions,
  ...ViewSystem.ViewSystem.defaultOptions,
  ...StartupSystem.StartupSystem.defaultOptions
};
Object.defineProperties(settings.settings, {
  /**
   * @static
   * @name WRAP_MODE
   * @memberof PIXI.settings
   * @type {PIXI.WRAP_MODES}
   * @deprecated since 7.1.0
   * @see PIXI.BaseTexture.defaultOptions.wrapMode
   */
  WRAP_MODE: {
    get() {
      return BaseTexture.BaseTexture.defaultOptions.wrapMode;
    },
    set(value) {
      utils.deprecation("7.1.0", "settings.WRAP_MODE is deprecated, use BaseTexture.defaultOptions.wrapMode"), BaseTexture.BaseTexture.defaultOptions.wrapMode = value;
    }
  },
  /**
   * @static
   * @name SCALE_MODE
   * @memberof PIXI.settings
   * @type {PIXI.SCALE_MODES}
   * @deprecated since 7.1.0
   * @see PIXI.BaseTexture.defaultOptions.scaleMode
   */
  SCALE_MODE: {
    get() {
      return BaseTexture.BaseTexture.defaultOptions.scaleMode;
    },
    set(value) {
      utils.deprecation("7.1.0", "settings.SCALE_MODE is deprecated, use BaseTexture.defaultOptions.scaleMode"), BaseTexture.BaseTexture.defaultOptions.scaleMode = value;
    }
  },
  /**
   * @static
   * @name MIPMAP_TEXTURES
   * @memberof PIXI.settings
   * @type {PIXI.MIPMAP_MODES}
   * @deprecated since 7.1.0
   * @see PIXI.BaseTexture.defaultOptions.mipmap
   */
  MIPMAP_TEXTURES: {
    get() {
      return BaseTexture.BaseTexture.defaultOptions.mipmap;
    },
    set(value) {
      utils.deprecation("7.1.0", "settings.MIPMAP_TEXTURES is deprecated, use BaseTexture.defaultOptions.mipmap"), BaseTexture.BaseTexture.defaultOptions.mipmap = value;
    }
    // MIPMAP_MODES.POW2,
  },
  /**
   * @static
   * @name ANISOTROPIC_LEVEL
   * @memberof PIXI.settings
   * @type {number}
   * @deprecated since 7.1.0
   * @see PIXI.BaseTexture.defaultOptions.anisotropicLevel
   */
  ANISOTROPIC_LEVEL: {
    get() {
      return BaseTexture.BaseTexture.defaultOptions.anisotropicLevel;
    },
    set(value) {
      utils.deprecation(
        "7.1.0",
        "settings.ANISOTROPIC_LEVEL is deprecated, use BaseTexture.defaultOptions.anisotropicLevel"
      ), BaseTexture.BaseTexture.defaultOptions.anisotropicLevel = value;
    }
  },
  /**
   * Default filter resolution.
   * @static
   * @name FILTER_RESOLUTION
   * @memberof PIXI.settings
   * @deprecated since 7.1.0
   * @type {number|null}
   * @see PIXI.Filter.defaultResolution
   */
  FILTER_RESOLUTION: {
    get() {
      return utils.deprecation("7.1.0", "settings.FILTER_RESOLUTION is deprecated, use Filter.defaultResolution"), Filter.Filter.defaultResolution;
    },
    set(value) {
      Filter.Filter.defaultResolution = value;
    }
  },
  /**
   * Default filter samples.
   * @static
   * @name FILTER_MULTISAMPLE
   * @memberof PIXI.settings
   * @deprecated since 7.1.0
   * @type {PIXI.MSAA_QUALITY}
   * @see PIXI.Filter.defaultMultisample
   */
  FILTER_MULTISAMPLE: {
    get() {
      return utils.deprecation("7.1.0", "settings.FILTER_MULTISAMPLE is deprecated, use Filter.defaultMultisample"), Filter.Filter.defaultMultisample;
    },
    set(value) {
      Filter.Filter.defaultMultisample = value;
    }
  },
  /**
   * The maximum textures that this device supports.
   * @static
   * @name SPRITE_MAX_TEXTURES
   * @memberof PIXI.settings
   * @deprecated since 7.1.0
   * @see PIXI.BatchRenderer.defaultMaxTextures
   * @type {number}
   */
  SPRITE_MAX_TEXTURES: {
    get() {
      return BatchRenderer.BatchRenderer.defaultMaxTextures;
    },
    set(value) {
      utils.deprecation("7.1.0", "settings.SPRITE_MAX_TEXTURES is deprecated, use BatchRenderer.defaultMaxTextures"), BatchRenderer.BatchRenderer.defaultMaxTextures = value;
    }
  },
  /**
   * The default sprite batch size.
   *
   * The default aims to balance desktop and mobile devices.
   * @static
   * @name SPRITE_BATCH_SIZE
   * @memberof PIXI.settings
   * @see PIXI.BatchRenderer.defaultBatchSize
   * @deprecated since 7.1.0
   * @type {number}
   */
  SPRITE_BATCH_SIZE: {
    get() {
      return BatchRenderer.BatchRenderer.defaultBatchSize;
    },
    set(value) {
      utils.deprecation("7.1.0", "settings.SPRITE_BATCH_SIZE is deprecated, use BatchRenderer.defaultBatchSize"), BatchRenderer.BatchRenderer.defaultBatchSize = value;
    }
  },
  /**
   * Can we upload the same buffer in a single frame?
   * @static
   * @name CAN_UPLOAD_SAME_BUFFER
   * @memberof PIXI.settings
   * @see PIXI.BatchRenderer.canUploadSameBuffer
   * @deprecated since 7.1.0
   * @type {boolean}
   */
  CAN_UPLOAD_SAME_BUFFER: {
    get() {
      return BatchRenderer.BatchRenderer.canUploadSameBuffer;
    },
    set(value) {
      utils.deprecation("7.1.0", "settings.CAN_UPLOAD_SAME_BUFFER is deprecated, use BatchRenderer.canUploadSameBuffer"), BatchRenderer.BatchRenderer.canUploadSameBuffer = value;
    }
  },
  /**
   * Default Garbage Collection mode.
   * @static
   * @name GC_MODE
   * @memberof PIXI.settings
   * @type {PIXI.GC_MODES}
   * @deprecated since 7.1.0
   * @see PIXI.TextureGCSystem.defaultMode
   */
  GC_MODE: {
    get() {
      return TextureGCSystem.TextureGCSystem.defaultMode;
    },
    set(value) {
      utils.deprecation("7.1.0", "settings.GC_MODE is deprecated, use TextureGCSystem.defaultMode"), TextureGCSystem.TextureGCSystem.defaultMode = value;
    }
  },
  /**
   * Default Garbage Collection max idle.
   * @static
   * @name GC_MAX_IDLE
   * @memberof PIXI.settings
   * @type {number}
   * @deprecated since 7.1.0
   * @see PIXI.TextureGCSystem.defaultMaxIdle
   */
  GC_MAX_IDLE: {
    get() {
      return TextureGCSystem.TextureGCSystem.defaultMaxIdle;
    },
    set(value) {
      utils.deprecation("7.1.0", "settings.GC_MAX_IDLE is deprecated, use TextureGCSystem.defaultMaxIdle"), TextureGCSystem.TextureGCSystem.defaultMaxIdle = value;
    }
  },
  /**
   * Default Garbage Collection maximum check count.
   * @static
   * @name GC_MAX_CHECK_COUNT
   * @memberof PIXI.settings
   * @type {number}
   * @deprecated since 7.1.0
   * @see PIXI.TextureGCSystem.defaultCheckCountMax
   */
  GC_MAX_CHECK_COUNT: {
    get() {
      return TextureGCSystem.TextureGCSystem.defaultCheckCountMax;
    },
    set(value) {
      utils.deprecation("7.1.0", "settings.GC_MAX_CHECK_COUNT is deprecated, use TextureGCSystem.defaultCheckCountMax"), TextureGCSystem.TextureGCSystem.defaultCheckCountMax = value;
    }
  },
  /**
   * Default specify float precision in vertex shader.
   * @static
   * @name PRECISION_VERTEX
   * @memberof PIXI.settings
   * @type {PIXI.PRECISION}
   * @deprecated since 7.1.0
   * @see PIXI.Program.defaultVertexPrecision
   */
  PRECISION_VERTEX: {
    get() {
      return Program.Program.defaultVertexPrecision;
    },
    set(value) {
      utils.deprecation("7.1.0", "settings.PRECISION_VERTEX is deprecated, use Program.defaultVertexPrecision"), Program.Program.defaultVertexPrecision = value;
    }
  },
  /**
   * Default specify float precision in fragment shader.
   * @static
   * @name PRECISION_FRAGMENT
   * @memberof PIXI.settings
   * @type {PIXI.PRECISION}
   * @deprecated since 7.1.0
   * @see PIXI.Program.defaultFragmentPrecision
   */
  PRECISION_FRAGMENT: {
    get() {
      return Program.Program.defaultFragmentPrecision;
    },
    set(value) {
      utils.deprecation("7.1.0", "settings.PRECISION_FRAGMENT is deprecated, use Program.defaultFragmentPrecision"), Program.Program.defaultFragmentPrecision = value;
    }
  }
});


},{"./background/BackgroundSystem.js":35,"./batch/BatchRenderer.js":38,"./context/ContextSystem.js":47,"./filters/Filter.js":48,"./shader/Program.js":88,"./startup/StartupSystem.js":111,"./systems.js":117,"./textures/BaseTexture.js":118,"./textures/TextureGCSystem.js":121,"./view/ViewSystem.js":144,"@pixi/constants":31,"@pixi/settings":180,"@pixi/utils":202}],87:[function(require,module,exports){
"use strict";
class IGLUniformData {
}
class GLProgram {
  /**
   * Makes a new Pixi program.
   * @param program - webgl program
   * @param uniformData - uniforms
   */
  constructor(program, uniformData) {
    this.program = program, this.uniformData = uniformData, this.uniformGroups = {}, this.uniformDirtyGroups = {}, this.uniformBufferBindings = {};
  }
  /** Destroys this program. */
  destroy() {
    this.uniformData = null, this.uniformGroups = null, this.uniformDirtyGroups = null, this.uniformBufferBindings = null, this.program = null;
  }
}
exports.GLProgram = GLProgram;
exports.IGLUniformData = IGLUniformData;


},{}],88:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), utils = require("@pixi/utils"), defaultProgram$1 = require("./defaultProgram.frag.js"), defaultProgram = require("./defaultProgram.vert.js");
require("./utils/index.js");
var setPrecision = require("./utils/setPrecision.js"), getMaxFragmentPrecision = require("./utils/getMaxFragmentPrecision.js");
let UID = 0;
const nameCache = {}, _Program = class _Program2 {
  /**
   * @param vertexSrc - The source of the vertex shader.
   * @param fragmentSrc - The source of the fragment shader.
   * @param name - Name for shader
   * @param extra - Extra data for shader
   */
  constructor(vertexSrc, fragmentSrc, name = "pixi-shader", extra = {}) {
    this.extra = {}, this.id = UID++, this.vertexSrc = vertexSrc || _Program2.defaultVertexSrc, this.fragmentSrc = fragmentSrc || _Program2.defaultFragmentSrc, this.vertexSrc = this.vertexSrc.trim(), this.fragmentSrc = this.fragmentSrc.trim(), this.extra = extra, this.vertexSrc.substring(0, 8) !== "#version" && (name = name.replace(/\s+/g, "-"), nameCache[name] ? (nameCache[name]++, name += `-${nameCache[name]}`) : nameCache[name] = 1, this.vertexSrc = `#define SHADER_NAME ${name}
${this.vertexSrc}`, this.fragmentSrc = `#define SHADER_NAME ${name}
${this.fragmentSrc}`, this.vertexSrc = setPrecision.setPrecision(
      this.vertexSrc,
      _Program2.defaultVertexPrecision,
      constants.PRECISION.HIGH
    ), this.fragmentSrc = setPrecision.setPrecision(
      this.fragmentSrc,
      _Program2.defaultFragmentPrecision,
      getMaxFragmentPrecision.getMaxFragmentPrecision()
    )), this.glPrograms = {}, this.syncUniforms = null;
  }
  /**
   * The default vertex shader source.
   * @readonly
   */
  static get defaultVertexSrc() {
    return defaultProgram.default;
  }
  /**
   * The default fragment shader source.
   * @readonly
   */
  static get defaultFragmentSrc() {
    return defaultProgram$1.default;
  }
  /**
   * A short hand function to create a program based of a vertex and fragment shader.
   *
   * This method will also check to see if there is a cached program.
   * @param vertexSrc - The source of the vertex shader.
   * @param fragmentSrc - The source of the fragment shader.
   * @param name - Name for shader
   * @returns A shiny new PixiJS shader program!
   */
  static from(vertexSrc, fragmentSrc, name) {
    const key = vertexSrc + fragmentSrc;
    let program = utils.ProgramCache[key];
    return program || (utils.ProgramCache[key] = program = new _Program2(vertexSrc, fragmentSrc, name)), program;
  }
};
_Program.defaultVertexPrecision = constants.PRECISION.HIGH, /**
* Default specify float precision in fragment shader.
* iOS is best set at highp due to https://github.com/pixijs/pixijs/issues/3742
* @static
* @type {PIXI.PRECISION}
* @default PIXI.PRECISION.MEDIUM
*/
_Program.defaultFragmentPrecision = utils.isMobile.apple.device ? constants.PRECISION.HIGH : constants.PRECISION.MEDIUM;
let Program = _Program;
exports.Program = Program;


},{"./defaultProgram.frag.js":92,"./defaultProgram.vert.js":93,"./utils/getMaxFragmentPrecision.js":101,"./utils/index.js":104,"./utils/setPrecision.js":108,"@pixi/constants":31,"@pixi/utils":202}],89:[function(require,module,exports){
"use strict";
var runner = require("@pixi/runner"), Program = require("./Program.js"), UniformGroup = require("./UniformGroup.js");
class Shader {
  /**
   * @param program - The program the shader will use.
   * @param uniforms - Custom uniforms to use to augment the built-in ones.
   */
  constructor(program, uniforms) {
    this.uniformBindCount = 0, this.program = program, uniforms ? uniforms instanceof UniformGroup.UniformGroup ? this.uniformGroup = uniforms : this.uniformGroup = new UniformGroup.UniformGroup(uniforms) : this.uniformGroup = new UniformGroup.UniformGroup({}), this.disposeRunner = new runner.Runner("disposeShader");
  }
  // TODO move to shader system..
  checkUniformExists(name, group) {
    if (group.uniforms[name])
      return !0;
    for (const i in group.uniforms) {
      const uniform = group.uniforms[i];
      if (uniform.group === !0 && this.checkUniformExists(name, uniform))
        return !0;
    }
    return !1;
  }
  destroy() {
    this.uniformGroup = null, this.disposeRunner.emit(this), this.disposeRunner.destroy();
  }
  /**
   * Shader uniform values, shortcut for `uniformGroup.uniforms`.
   * @readonly
   */
  get uniforms() {
    return this.uniformGroup.uniforms;
  }
  /**
   * A short hand function to create a shader based of a vertex and fragment shader.
   * @param vertexSrc - The source of the vertex shader.
   * @param fragmentSrc - The source of the fragment shader.
   * @param uniforms - Custom uniforms to use to augment the built-in ones.
   * @returns A shiny new PixiJS shader!
   */
  static from(vertexSrc, fragmentSrc, uniforms) {
    const program = Program.Program.from(vertexSrc, fragmentSrc);
    return new Shader(program, uniforms);
  }
}
exports.Shader = Shader;


},{"./Program.js":88,"./UniformGroup.js":91,"@pixi/runner":176}],90:[function(require,module,exports){
"use strict";
var extensions = require("@pixi/extensions");
require("./utils/index.js");
var generateProgram = require("./utils/generateProgram.js"), generateUniformBufferSync = require("./utils/generateUniformBufferSync.js"), unsafeEvalSupported = require("./utils/unsafeEvalSupported.js"), generateUniformsSync = require("./utils/generateUniformsSync.js");
let UID = 0;
const defaultSyncData = { textureCount: 0, uboCount: 0 };
class ShaderSystem {
  /** @param renderer - The renderer this System works for. */
  constructor(renderer) {
    this.destroyed = !1, this.renderer = renderer, this.systemCheck(), this.gl = null, this.shader = null, this.program = null, this.cache = {}, this._uboCache = {}, this.id = UID++;
  }
  /**
   * Overrideable function by `@pixi/unsafe-eval` to silence
   * throwing an error if platform doesn't support unsafe-evals.
   * @private
   */
  systemCheck() {
    if (!unsafeEvalSupported.unsafeEvalSupported())
      throw new Error("Current environment does not allow unsafe-eval, please use @pixi/unsafe-eval module to enable support.");
  }
  contextChange(gl) {
    this.gl = gl, this.reset();
  }
  /**
   * Changes the current shader to the one given in parameter.
   * @param shader - the new shader
   * @param dontSync - false if the shader should automatically sync its uniforms.
   * @returns the glProgram that belongs to the shader.
   */
  bind(shader, dontSync) {
    shader.disposeRunner.add(this), shader.uniforms.globals = this.renderer.globalUniforms;
    const program = shader.program, glProgram = program.glPrograms[this.renderer.CONTEXT_UID] || this.generateProgram(shader);
    return this.shader = shader, this.program !== program && (this.program = program, this.gl.useProgram(glProgram.program)), dontSync || (defaultSyncData.textureCount = 0, defaultSyncData.uboCount = 0, this.syncUniformGroup(shader.uniformGroup, defaultSyncData)), glProgram;
  }
  /**
   * Uploads the uniforms values to the currently bound shader.
   * @param uniforms - the uniforms values that be applied to the current shader
   */
  setUniforms(uniforms) {
    const shader = this.shader.program, glProgram = shader.glPrograms[this.renderer.CONTEXT_UID];
    shader.syncUniforms(glProgram.uniformData, uniforms, this.renderer);
  }
  /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
  /**
   * Syncs uniforms on the group
   * @param group - the uniform group to sync
   * @param syncData - this is data that is passed to the sync function and any nested sync functions
   */
  syncUniformGroup(group, syncData) {
    const glProgram = this.getGlProgram();
    (!group.static || group.dirtyId !== glProgram.uniformDirtyGroups[group.id]) && (glProgram.uniformDirtyGroups[group.id] = group.dirtyId, this.syncUniforms(group, glProgram, syncData));
  }
  /**
   * Overrideable by the @pixi/unsafe-eval package to use static syncUniforms instead.
   * @param group
   * @param glProgram
   * @param syncData
   */
  syncUniforms(group, glProgram, syncData) {
    (group.syncUniforms[this.shader.program.id] || this.createSyncGroups(group))(glProgram.uniformData, group.uniforms, this.renderer, syncData);
  }
  createSyncGroups(group) {
    const id = this.getSignature(group, this.shader.program.uniformData, "u");
    return this.cache[id] || (this.cache[id] = generateUniformsSync.generateUniformsSync(group, this.shader.program.uniformData)), group.syncUniforms[this.shader.program.id] = this.cache[id], group.syncUniforms[this.shader.program.id];
  }
  /**
   * Syncs uniform buffers
   * @param group - the uniform buffer group to sync
   * @param name - the name of the uniform buffer
   */
  syncUniformBufferGroup(group, name) {
    const glProgram = this.getGlProgram();
    if (!group.static || group.dirtyId !== 0 || !glProgram.uniformGroups[group.id]) {
      group.dirtyId = 0;
      const syncFunc = glProgram.uniformGroups[group.id] || this.createSyncBufferGroup(group, glProgram, name);
      group.buffer.update(), syncFunc(
        glProgram.uniformData,
        group.uniforms,
        this.renderer,
        defaultSyncData,
        group.buffer
      );
    }
    this.renderer.buffer.bindBufferBase(group.buffer, glProgram.uniformBufferBindings[name]);
  }
  /**
   * Will create a function that uploads a uniform buffer using the STD140 standard.
   * The upload function will then be cached for future calls
   * If a group is manually managed, then a simple upload function is generated
   * @param group - the uniform buffer group to sync
   * @param glProgram - the gl program to attach the uniform bindings to
   * @param name - the name of the uniform buffer (must exist on the shader)
   */
  createSyncBufferGroup(group, glProgram, name) {
    const { gl } = this.renderer;
    this.renderer.buffer.bind(group.buffer);
    const uniformBlockIndex = this.gl.getUniformBlockIndex(glProgram.program, name);
    glProgram.uniformBufferBindings[name] = this.shader.uniformBindCount, gl.uniformBlockBinding(glProgram.program, uniformBlockIndex, this.shader.uniformBindCount), this.shader.uniformBindCount++;
    const id = this.getSignature(group, this.shader.program.uniformData, "ubo");
    let uboData = this._uboCache[id];
    if (uboData || (uboData = this._uboCache[id] = generateUniformBufferSync.generateUniformBufferSync(group, this.shader.program.uniformData)), group.autoManage) {
      const data = new Float32Array(uboData.size / 4);
      group.buffer.update(data);
    }
    return glProgram.uniformGroups[group.id] = uboData.syncFunc, glProgram.uniformGroups[group.id];
  }
  /**
   * Takes a uniform group and data and generates a unique signature for them.
   * @param group - The uniform group to get signature of
   * @param group.uniforms
   * @param uniformData - Uniform information generated by the shader
   * @param preFix
   * @returns Unique signature of the uniform group
   */
  getSignature(group, uniformData, preFix) {
    const uniforms = group.uniforms, strings = [`${preFix}-`];
    for (const i in uniforms)
      strings.push(i), uniformData[i] && strings.push(uniformData[i].type);
    return strings.join("-");
  }
  /**
   * Returns the underlying GLShade rof the currently bound shader.
   *
   * This can be handy for when you to have a little more control over the setting of your uniforms.
   * @returns The glProgram for the currently bound Shader for this context
   */
  getGlProgram() {
    return this.shader ? this.shader.program.glPrograms[this.renderer.CONTEXT_UID] : null;
  }
  /**
   * Generates a glProgram version of the Shader provided.
   * @param shader - The shader that the glProgram will be based on.
   * @returns A shiny new glProgram!
   */
  generateProgram(shader) {
    const gl = this.gl, program = shader.program, glProgram = generateProgram.generateProgram(gl, program);
    return program.glPrograms[this.renderer.CONTEXT_UID] = glProgram, glProgram;
  }
  /** Resets ShaderSystem state, does not affect WebGL state. */
  reset() {
    this.program = null, this.shader = null;
  }
  /**
   * Disposes shader.
   * If disposing one equals with current shader, set current as null.
   * @param shader - Shader object
   */
  disposeShader(shader) {
    this.shader === shader && (this.shader = null);
  }
  /** Destroys this System and removes all its textures. */
  destroy() {
    this.renderer = null, this.destroyed = !0;
  }
}
ShaderSystem.extension = {
  type: extensions.ExtensionType.RendererSystem,
  name: "shader"
};
extensions.extensions.add(ShaderSystem);
exports.ShaderSystem = ShaderSystem;


},{"./utils/generateProgram.js":97,"./utils/generateUniformBufferSync.js":98,"./utils/generateUniformsSync.js":99,"./utils/index.js":104,"./utils/unsafeEvalSupported.js":110,"@pixi/extensions":160}],91:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), Buffer = require("../geometry/Buffer.js");
let UID = 0;
class UniformGroup {
  /**
   * @param {object | Buffer} [uniforms] - Custom uniforms to use to augment the built-in ones. Or a pixi buffer.
   * @param isStatic - Uniforms wont be changed after creation.
   * @param isUbo - If true, will treat this uniform group as a uniform buffer object.
   */
  constructor(uniforms, isStatic, isUbo) {
    this.group = !0, this.syncUniforms = {}, this.dirtyId = 0, this.id = UID++, this.static = !!isStatic, this.ubo = !!isUbo, uniforms instanceof Buffer.Buffer ? (this.buffer = uniforms, this.buffer.type = constants.BUFFER_TYPE.UNIFORM_BUFFER, this.autoManage = !1, this.ubo = !0) : (this.uniforms = uniforms, this.ubo && (this.buffer = new Buffer.Buffer(new Float32Array(1)), this.buffer.type = constants.BUFFER_TYPE.UNIFORM_BUFFER, this.autoManage = !0));
  }
  update() {
    this.dirtyId++, !this.autoManage && this.buffer && this.buffer.update();
  }
  add(name, uniforms, _static) {
    if (!this.ubo)
      this.uniforms[name] = new UniformGroup(uniforms, _static);
    else
      throw new Error("[UniformGroup] uniform groups in ubo mode cannot be modified, or have uniform groups nested in them");
  }
  static from(uniforms, _static, _ubo) {
    return new UniformGroup(uniforms, _static, _ubo);
  }
  /**
   * A short hand function for creating a static UBO UniformGroup.
   * @param uniforms - the ubo item
   * @param _static - should this be updated each time it is used? defaults to true here!
   */
  static uboFrom(uniforms, _static) {
    return new UniformGroup(uniforms, _static ?? !0, !0);
  }
}
exports.UniformGroup = UniformGroup;


},{"../geometry/Buffer.js":65,"@pixi/constants":31}],92:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
var defaultFragment = `varying vec2 vTextureCoord;

uniform sampler2D uSampler;

void main(void){
   gl_FragColor *= texture2D(uSampler, vTextureCoord);
}`;
exports.default = defaultFragment;


},{}],93:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
var defaultVertex = `attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void){
   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
   vTextureCoord = aTextureCoord;
}
`;
exports.default = defaultVertex;


},{}],94:[function(require,module,exports){
"use strict";
const fragTemplate = [
  "precision mediump float;",
  "void main(void){",
  "float test = 0.1;",
  "%forloop%",
  "gl_FragColor = vec4(0.0);",
  "}"
].join(`
`);
function generateIfTestSrc(maxIfs) {
  let src = "";
  for (let i = 0; i < maxIfs; ++i)
    i > 0 && (src += `
else `), i < maxIfs - 1 && (src += `if(test == ${i}.0){}`);
  return src;
}
function checkMaxIfStatementsInShader(maxIfs, gl) {
  if (maxIfs === 0)
    throw new Error("Invalid value of `0` passed to `checkMaxIfStatementsInShader`");
  const shader = gl.createShader(gl.FRAGMENT_SHADER);
  for (; ; ) {
    const fragmentSrc = fragTemplate.replace(/%forloop%/gi, generateIfTestSrc(maxIfs));
    if (gl.shaderSource(shader, fragmentSrc), gl.compileShader(shader), !gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      maxIfs = maxIfs / 2 | 0;
    else
      break;
  }
  return maxIfs;
}
exports.checkMaxIfStatementsInShader = checkMaxIfStatementsInShader;


},{}],95:[function(require,module,exports){
"use strict";
function compileShader(gl, type, src) {
  const shader = gl.createShader(type);
  return gl.shaderSource(shader, src), gl.compileShader(shader), shader;
}
exports.compileShader = compileShader;


},{}],96:[function(require,module,exports){
"use strict";
function booleanArray(size) {
  const array = new Array(size);
  for (let i = 0; i < array.length; i++)
    array[i] = !1;
  return array;
}
function defaultValue(type, size) {
  switch (type) {
    case "float":
      return 0;
    case "vec2":
      return new Float32Array(2 * size);
    case "vec3":
      return new Float32Array(3 * size);
    case "vec4":
      return new Float32Array(4 * size);
    case "int":
    case "uint":
    case "sampler2D":
    case "sampler2DArray":
      return 0;
    case "ivec2":
      return new Int32Array(2 * size);
    case "ivec3":
      return new Int32Array(3 * size);
    case "ivec4":
      return new Int32Array(4 * size);
    case "uvec2":
      return new Uint32Array(2 * size);
    case "uvec3":
      return new Uint32Array(3 * size);
    case "uvec4":
      return new Uint32Array(4 * size);
    case "bool":
      return !1;
    case "bvec2":
      return booleanArray(2 * size);
    case "bvec3":
      return booleanArray(3 * size);
    case "bvec4":
      return booleanArray(4 * size);
    case "mat2":
      return new Float32Array([
        1,
        0,
        0,
        1
      ]);
    case "mat3":
      return new Float32Array([
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1
      ]);
    case "mat4":
      return new Float32Array([
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      ]);
  }
  return null;
}
exports.defaultValue = defaultValue;


},{}],97:[function(require,module,exports){
"use strict";
var GLProgram = require("../GLProgram.js"), compileShader = require("./compileShader.js"), defaultValue = require("./defaultValue.js"), getAttributeData = require("./getAttributeData.js"), getUniformData = require("./getUniformData.js"), logProgramError = require("./logProgramError.js");
function generateProgram(gl, program) {
  const glVertShader = compileShader.compileShader(gl, gl.VERTEX_SHADER, program.vertexSrc), glFragShader = compileShader.compileShader(gl, gl.FRAGMENT_SHADER, program.fragmentSrc), webGLProgram = gl.createProgram();
  gl.attachShader(webGLProgram, glVertShader), gl.attachShader(webGLProgram, glFragShader);
  const transformFeedbackVaryings = program.extra?.transformFeedbackVaryings;
  if (transformFeedbackVaryings && (typeof gl.transformFeedbackVaryings != "function" ? console.warn("TransformFeedback is not supported but TransformFeedbackVaryings are given.") : gl.transformFeedbackVaryings(
    webGLProgram,
    transformFeedbackVaryings.names,
    transformFeedbackVaryings.bufferMode === "separate" ? gl.SEPARATE_ATTRIBS : gl.INTERLEAVED_ATTRIBS
  )), gl.linkProgram(webGLProgram), gl.getProgramParameter(webGLProgram, gl.LINK_STATUS) || logProgramError.logProgramError(gl, webGLProgram, glVertShader, glFragShader), program.attributeData = getAttributeData.getAttributeData(webGLProgram, gl), program.uniformData = getUniformData.getUniformData(webGLProgram, gl), !/^[ \t]*#[ \t]*version[ \t]+300[ \t]+es[ \t]*$/m.test(program.vertexSrc)) {
    const keys = Object.keys(program.attributeData);
    keys.sort((a, b) => a > b ? 1 : -1);
    for (let i = 0; i < keys.length; i++)
      program.attributeData[keys[i]].location = i, gl.bindAttribLocation(webGLProgram, i, keys[i]);
    gl.linkProgram(webGLProgram);
  }
  gl.deleteShader(glVertShader), gl.deleteShader(glFragShader);
  const uniformData = {};
  for (const i in program.uniformData) {
    const data = program.uniformData[i];
    uniformData[i] = {
      location: gl.getUniformLocation(webGLProgram, i),
      value: defaultValue.defaultValue(data.type, data.size)
    };
  }
  return new GLProgram.GLProgram(webGLProgram, uniformData);
}
exports.generateProgram = generateProgram;


},{"../GLProgram.js":87,"./compileShader.js":95,"./defaultValue.js":96,"./getAttributeData.js":100,"./getUniformData.js":103,"./logProgramError.js":105}],98:[function(require,module,exports){
"use strict";
require("./index.js");
var uniformParsers = require("./uniformParsers.js"), mapSize = require("./mapSize.js");
function uboUpdate(_ud, _uv, _renderer, _syncData, buffer) {
  _renderer.buffer.update(buffer);
}
const UBO_TO_SINGLE_SETTERS = {
  float: `
        data[offset] = v;
    `,
  vec2: `
        data[offset] = v[0];
        data[offset+1] = v[1];
    `,
  vec3: `
        data[offset] = v[0];
        data[offset+1] = v[1];
        data[offset+2] = v[2];

    `,
  vec4: `
        data[offset] = v[0];
        data[offset+1] = v[1];
        data[offset+2] = v[2];
        data[offset+3] = v[3];
    `,
  mat2: `
        data[offset] = v[0];
        data[offset+1] = v[1];

        data[offset+4] = v[2];
        data[offset+5] = v[3];
    `,
  mat3: `
        data[offset] = v[0];
        data[offset+1] = v[1];
        data[offset+2] = v[2];

        data[offset + 4] = v[3];
        data[offset + 5] = v[4];
        data[offset + 6] = v[5];

        data[offset + 8] = v[6];
        data[offset + 9] = v[7];
        data[offset + 10] = v[8];
    `,
  mat4: `
        for(var i = 0; i < 16; i++)
        {
            data[offset + i] = v[i];
        }
    `
}, GLSL_TO_STD40_SIZE = {
  float: 4,
  vec2: 8,
  vec3: 12,
  vec4: 16,
  int: 4,
  ivec2: 8,
  ivec3: 12,
  ivec4: 16,
  uint: 4,
  uvec2: 8,
  uvec3: 12,
  uvec4: 16,
  bool: 4,
  bvec2: 8,
  bvec3: 12,
  bvec4: 16,
  mat2: 16 * 2,
  mat3: 16 * 3,
  mat4: 16 * 4
};
function createUBOElements(uniformData) {
  const uboElements = uniformData.map((data) => ({
    data,
    offset: 0,
    dataLen: 0,
    dirty: 0
  }));
  let size = 0, chunkSize = 0, offset = 0;
  for (let i = 0; i < uboElements.length; i++) {
    const uboElement = uboElements[i];
    if (size = GLSL_TO_STD40_SIZE[uboElement.data.type], uboElement.data.size > 1 && (size = Math.max(size, 16) * uboElement.data.size), uboElement.dataLen = size, chunkSize % size !== 0 && chunkSize < 16) {
      const lineUpValue = chunkSize % size % 16;
      chunkSize += lineUpValue, offset += lineUpValue;
    }
    chunkSize + size > 16 ? (offset = Math.ceil(offset / 16) * 16, uboElement.offset = offset, offset += size, chunkSize = size) : (uboElement.offset = offset, chunkSize += size, offset += size);
  }
  return offset = Math.ceil(offset / 16) * 16, { uboElements, size: offset };
}
function getUBOData(uniforms, uniformData) {
  const usedUniformDatas = [];
  for (const i in uniforms)
    uniformData[i] && usedUniformDatas.push(uniformData[i]);
  return usedUniformDatas.sort((a, b) => a.index - b.index), usedUniformDatas;
}
function generateUniformBufferSync(group, uniformData) {
  if (!group.autoManage)
    return { size: 0, syncFunc: uboUpdate };
  const usedUniformDatas = getUBOData(group.uniforms, uniformData), { uboElements, size } = createUBOElements(usedUniformDatas), funcFragments = [`
    var v = null;
    var v2 = null;
    var cv = null;
    var t = 0;
    var gl = renderer.gl
    var index = 0;
    var data = buffer.data;
    `];
  for (let i = 0; i < uboElements.length; i++) {
    const uboElement = uboElements[i], uniform = group.uniforms[uboElement.data.name], name = uboElement.data.name;
    let parsed = !1;
    for (let j = 0; j < uniformParsers.uniformParsers.length; j++) {
      const uniformParser = uniformParsers.uniformParsers[j];
      if (uniformParser.codeUbo && uniformParser.test(uboElement.data, uniform)) {
        funcFragments.push(
          `offset = ${uboElement.offset / 4};`,
          uniformParsers.uniformParsers[j].codeUbo(uboElement.data.name, uniform)
        ), parsed = !0;
        break;
      }
    }
    if (!parsed)
      if (uboElement.data.size > 1) {
        const size2 = mapSize.mapSize(uboElement.data.type), rowSize = Math.max(GLSL_TO_STD40_SIZE[uboElement.data.type] / 16, 1), elementSize = size2 / rowSize, remainder = (4 - elementSize % 4) % 4;
        funcFragments.push(`
                cv = ud.${name}.value;
                v = uv.${name};
                offset = ${uboElement.offset / 4};

                t = 0;

                for(var i=0; i < ${uboElement.data.size * rowSize}; i++)
                {
                    for(var j = 0; j < ${elementSize}; j++)
                    {
                        data[offset++] = v[t++];
                    }
                    offset += ${remainder};
                }

                `);
      } else {
        const template = UBO_TO_SINGLE_SETTERS[uboElement.data.type];
        funcFragments.push(`
                cv = ud.${name}.value;
                v = uv.${name};
                offset = ${uboElement.offset / 4};
                ${template};
                `);
      }
  }
  return funcFragments.push(`
       renderer.buffer.update(buffer);
    `), {
    size,
    // eslint-disable-next-line no-new-func
    syncFunc: new Function(
      "ud",
      "uv",
      "renderer",
      "syncData",
      "buffer",
      funcFragments.join(`
`)
    )
  };
}
exports.createUBOElements = createUBOElements;
exports.generateUniformBufferSync = generateUniformBufferSync;
exports.getUBOData = getUBOData;


},{"./index.js":104,"./mapSize.js":106,"./uniformParsers.js":109}],99:[function(require,module,exports){
"use strict";
var uniformParsers = require("./uniformParsers.js");
const GLSL_TO_SINGLE_SETTERS_CACHED = {
  float: `
    if (cv !== v)
    {
        cu.value = v;
        gl.uniform1f(location, v);
    }`,
  vec2: `
    if (cv[0] !== v[0] || cv[1] !== v[1])
    {
        cv[0] = v[0];
        cv[1] = v[1];

        gl.uniform2f(location, v[0], v[1])
    }`,
  vec3: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];

        gl.uniform3f(location, v[0], v[1], v[2])
    }`,
  vec4: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];
        cv[3] = v[3];

        gl.uniform4f(location, v[0], v[1], v[2], v[3]);
    }`,
  int: `
    if (cv !== v)
    {
        cu.value = v;

        gl.uniform1i(location, v);
    }`,
  ivec2: `
    if (cv[0] !== v[0] || cv[1] !== v[1])
    {
        cv[0] = v[0];
        cv[1] = v[1];

        gl.uniform2i(location, v[0], v[1]);
    }`,
  ivec3: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];

        gl.uniform3i(location, v[0], v[1], v[2]);
    }`,
  ivec4: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];
        cv[3] = v[3];

        gl.uniform4i(location, v[0], v[1], v[2], v[3]);
    }`,
  uint: `
    if (cv !== v)
    {
        cu.value = v;

        gl.uniform1ui(location, v);
    }`,
  uvec2: `
    if (cv[0] !== v[0] || cv[1] !== v[1])
    {
        cv[0] = v[0];
        cv[1] = v[1];

        gl.uniform2ui(location, v[0], v[1]);
    }`,
  uvec3: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];

        gl.uniform3ui(location, v[0], v[1], v[2]);
    }`,
  uvec4: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];
        cv[3] = v[3];

        gl.uniform4ui(location, v[0], v[1], v[2], v[3]);
    }`,
  bool: `
    if (cv !== v)
    {
        cu.value = v;
        gl.uniform1i(location, v);
    }`,
  bvec2: `
    if (cv[0] != v[0] || cv[1] != v[1])
    {
        cv[0] = v[0];
        cv[1] = v[1];

        gl.uniform2i(location, v[0], v[1]);
    }`,
  bvec3: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];

        gl.uniform3i(location, v[0], v[1], v[2]);
    }`,
  bvec4: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];
        cv[3] = v[3];

        gl.uniform4i(location, v[0], v[1], v[2], v[3]);
    }`,
  mat2: "gl.uniformMatrix2fv(location, false, v)",
  mat3: "gl.uniformMatrix3fv(location, false, v)",
  mat4: "gl.uniformMatrix4fv(location, false, v)",
  sampler2D: `
    if (cv !== v)
    {
        cu.value = v;

        gl.uniform1i(location, v);
    }`,
  samplerCube: `
    if (cv !== v)
    {
        cu.value = v;

        gl.uniform1i(location, v);
    }`,
  sampler2DArray: `
    if (cv !== v)
    {
        cu.value = v;

        gl.uniform1i(location, v);
    }`
}, GLSL_TO_ARRAY_SETTERS = {
  float: "gl.uniform1fv(location, v)",
  vec2: "gl.uniform2fv(location, v)",
  vec3: "gl.uniform3fv(location, v)",
  vec4: "gl.uniform4fv(location, v)",
  mat4: "gl.uniformMatrix4fv(location, false, v)",
  mat3: "gl.uniformMatrix3fv(location, false, v)",
  mat2: "gl.uniformMatrix2fv(location, false, v)",
  int: "gl.uniform1iv(location, v)",
  ivec2: "gl.uniform2iv(location, v)",
  ivec3: "gl.uniform3iv(location, v)",
  ivec4: "gl.uniform4iv(location, v)",
  uint: "gl.uniform1uiv(location, v)",
  uvec2: "gl.uniform2uiv(location, v)",
  uvec3: "gl.uniform3uiv(location, v)",
  uvec4: "gl.uniform4uiv(location, v)",
  bool: "gl.uniform1iv(location, v)",
  bvec2: "gl.uniform2iv(location, v)",
  bvec3: "gl.uniform3iv(location, v)",
  bvec4: "gl.uniform4iv(location, v)",
  sampler2D: "gl.uniform1iv(location, v)",
  samplerCube: "gl.uniform1iv(location, v)",
  sampler2DArray: "gl.uniform1iv(location, v)"
};
function generateUniformsSync(group, uniformData) {
  const funcFragments = [`
        var v = null;
        var cv = null;
        var cu = null;
        var t = 0;
        var gl = renderer.gl;
    `];
  for (const i in group.uniforms) {
    const data = uniformData[i];
    if (!data) {
      group.uniforms[i]?.group === !0 && (group.uniforms[i].ubo ? funcFragments.push(`
                        renderer.shader.syncUniformBufferGroup(uv.${i}, '${i}');
                    `) : funcFragments.push(`
                        renderer.shader.syncUniformGroup(uv.${i}, syncData);
                    `));
      continue;
    }
    const uniform = group.uniforms[i];
    let parsed = !1;
    for (let j = 0; j < uniformParsers.uniformParsers.length; j++)
      if (uniformParsers.uniformParsers[j].test(data, uniform)) {
        funcFragments.push(uniformParsers.uniformParsers[j].code(i, uniform)), parsed = !0;
        break;
      }
    if (!parsed) {
      const template = (data.size === 1 && !data.isArray ? GLSL_TO_SINGLE_SETTERS_CACHED : GLSL_TO_ARRAY_SETTERS)[data.type].replace("location", `ud["${i}"].location`);
      funcFragments.push(`
            cu = ud["${i}"];
            cv = cu.value;
            v = uv["${i}"];
            ${template};`);
    }
  }
  return new Function("ud", "uv", "renderer", "syncData", funcFragments.join(`
`));
}
exports.generateUniformsSync = generateUniformsSync;


},{"./uniformParsers.js":109}],100:[function(require,module,exports){
"use strict";
var mapSize = require("./mapSize.js"), mapType = require("./mapType.js");
function getAttributeData(program, gl) {
  const attributes = {}, totalAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < totalAttributes; i++) {
    const attribData = gl.getActiveAttrib(program, i);
    if (attribData.name.startsWith("gl_"))
      continue;
    const type = mapType.mapType(gl, attribData.type), data = {
      type,
      name: attribData.name,
      size: mapSize.mapSize(type),
      location: gl.getAttribLocation(program, attribData.name)
    };
    attributes[attribData.name] = data;
  }
  return attributes;
}
exports.getAttributeData = getAttributeData;


},{"./mapSize.js":106,"./mapType.js":107}],101:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), getTestContext = require("./getTestContext.js");
let maxFragmentPrecision;
function getMaxFragmentPrecision() {
  if (!maxFragmentPrecision) {
    maxFragmentPrecision = constants.PRECISION.MEDIUM;
    const gl = getTestContext.getTestContext();
    if (gl && gl.getShaderPrecisionFormat) {
      const shaderFragment = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
      shaderFragment && (maxFragmentPrecision = shaderFragment.precision ? constants.PRECISION.HIGH : constants.PRECISION.MEDIUM);
    }
  }
  return maxFragmentPrecision;
}
exports.getMaxFragmentPrecision = getMaxFragmentPrecision;


},{"./getTestContext.js":102,"@pixi/constants":31}],102:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), settings = require("@pixi/settings");
const unknownContext = {};
let context = unknownContext;
function getTestContext() {
  if (context === unknownContext || context?.isContextLost()) {
    const canvas = settings.settings.ADAPTER.createCanvas();
    let gl;
    settings.settings.PREFER_ENV >= constants.ENV.WEBGL2 && (gl = canvas.getContext("webgl2", {})), gl || (gl = canvas.getContext("webgl", {}) || canvas.getContext("experimental-webgl", {}), gl ? gl.getExtension("WEBGL_draw_buffers") : gl = null), context = gl;
  }
  return context;
}
exports.getTestContext = getTestContext;


},{"@pixi/constants":31,"@pixi/settings":180}],103:[function(require,module,exports){
"use strict";
var defaultValue = require("./defaultValue.js"), mapType = require("./mapType.js");
function getUniformData(program, gl) {
  const uniforms = {}, totalUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < totalUniforms; i++) {
    const uniformData = gl.getActiveUniform(program, i), name = uniformData.name.replace(/\[.*?\]$/, ""), isArray = !!uniformData.name.match(/\[.*?\]$/), type = mapType.mapType(gl, uniformData.type);
    uniforms[name] = {
      name,
      index: i,
      type,
      size: uniformData.size,
      isArray,
      value: defaultValue.defaultValue(type, uniformData.size)
    };
  }
  return uniforms;
}
exports.getUniformData = getUniformData;


},{"./defaultValue.js":96,"./mapType.js":107}],104:[function(require,module,exports){
"use strict";
var checkMaxIfStatementsInShader = require("./checkMaxIfStatementsInShader.js"), compileShader = require("./compileShader.js"), defaultValue = require("./defaultValue.js"), generateUniformsSync = require("./generateUniformsSync.js"), getMaxFragmentPrecision = require("./getMaxFragmentPrecision.js"), getTestContext = require("./getTestContext.js"), logProgramError = require("./logProgramError.js"), mapSize = require("./mapSize.js"), mapType = require("./mapType.js"), setPrecision = require("./setPrecision.js"), uniformParsers = require("./uniformParsers.js"), unsafeEvalSupported = require("./unsafeEvalSupported.js");
exports.checkMaxIfStatementsInShader = checkMaxIfStatementsInShader.checkMaxIfStatementsInShader;
exports.compileShader = compileShader.compileShader;
exports.defaultValue = defaultValue.defaultValue;
exports.generateUniformsSync = generateUniformsSync.generateUniformsSync;
exports.getMaxFragmentPrecision = getMaxFragmentPrecision.getMaxFragmentPrecision;
exports.getTestContext = getTestContext.getTestContext;
exports.logProgramError = logProgramError.logProgramError;
exports.mapSize = mapSize.mapSize;
exports.mapType = mapType.mapType;
exports.setPrecision = setPrecision.setPrecision;
exports.uniformParsers = uniformParsers.uniformParsers;
exports.unsafeEvalSupported = unsafeEvalSupported.unsafeEvalSupported;


},{"./checkMaxIfStatementsInShader.js":94,"./compileShader.js":95,"./defaultValue.js":96,"./generateUniformsSync.js":99,"./getMaxFragmentPrecision.js":101,"./getTestContext.js":102,"./logProgramError.js":105,"./mapSize.js":106,"./mapType.js":107,"./setPrecision.js":108,"./uniformParsers.js":109,"./unsafeEvalSupported.js":110}],105:[function(require,module,exports){
"use strict";
function logPrettyShaderError(gl, shader) {
  const shaderSrc = gl.getShaderSource(shader).split(`
`).map((line, index) => `${index}: ${line}`), shaderLog = gl.getShaderInfoLog(shader), splitShader = shaderLog.split(`
`), dedupe = {}, lineNumbers = splitShader.map((line) => parseFloat(line.replace(/^ERROR\: 0\:([\d]+)\:.*$/, "$1"))).filter((n) => n && !dedupe[n] ? (dedupe[n] = !0, !0) : !1), logArgs = [""];
  lineNumbers.forEach((number) => {
    shaderSrc[number - 1] = `%c${shaderSrc[number - 1]}%c`, logArgs.push("background: #FF0000; color:#FFFFFF; font-size: 10px", "font-size: 10px");
  });
  const fragmentSourceToLog = shaderSrc.join(`
`);
  logArgs[0] = fragmentSourceToLog, console.error(shaderLog), console.groupCollapsed("click to view full shader code"), console.warn(...logArgs), console.groupEnd();
}
function logProgramError(gl, program, vertexShader, fragmentShader) {
  gl.getProgramParameter(program, gl.LINK_STATUS) || (gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS) || logPrettyShaderError(gl, vertexShader), gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS) || logPrettyShaderError(gl, fragmentShader), console.error("PixiJS Error: Could not initialize shader."), gl.getProgramInfoLog(program) !== "" && console.warn("PixiJS Warning: gl.getProgramInfoLog()", gl.getProgramInfoLog(program)));
}
exports.logProgramError = logProgramError;


},{}],106:[function(require,module,exports){
"use strict";
const GLSL_TO_SIZE = {
  float: 1,
  vec2: 2,
  vec3: 3,
  vec4: 4,
  int: 1,
  ivec2: 2,
  ivec3: 3,
  ivec4: 4,
  uint: 1,
  uvec2: 2,
  uvec3: 3,
  uvec4: 4,
  bool: 1,
  bvec2: 2,
  bvec3: 3,
  bvec4: 4,
  mat2: 4,
  mat3: 9,
  mat4: 16,
  sampler2D: 1
};
function mapSize(type) {
  return GLSL_TO_SIZE[type];
}
exports.mapSize = mapSize;


},{}],107:[function(require,module,exports){
"use strict";
let GL_TABLE = null;
const GL_TO_GLSL_TYPES = {
  FLOAT: "float",
  FLOAT_VEC2: "vec2",
  FLOAT_VEC3: "vec3",
  FLOAT_VEC4: "vec4",
  INT: "int",
  INT_VEC2: "ivec2",
  INT_VEC3: "ivec3",
  INT_VEC4: "ivec4",
  UNSIGNED_INT: "uint",
  UNSIGNED_INT_VEC2: "uvec2",
  UNSIGNED_INT_VEC3: "uvec3",
  UNSIGNED_INT_VEC4: "uvec4",
  BOOL: "bool",
  BOOL_VEC2: "bvec2",
  BOOL_VEC3: "bvec3",
  BOOL_VEC4: "bvec4",
  FLOAT_MAT2: "mat2",
  FLOAT_MAT3: "mat3",
  FLOAT_MAT4: "mat4",
  SAMPLER_2D: "sampler2D",
  INT_SAMPLER_2D: "sampler2D",
  UNSIGNED_INT_SAMPLER_2D: "sampler2D",
  SAMPLER_CUBE: "samplerCube",
  INT_SAMPLER_CUBE: "samplerCube",
  UNSIGNED_INT_SAMPLER_CUBE: "samplerCube",
  SAMPLER_2D_ARRAY: "sampler2DArray",
  INT_SAMPLER_2D_ARRAY: "sampler2DArray",
  UNSIGNED_INT_SAMPLER_2D_ARRAY: "sampler2DArray"
};
function mapType(gl, type) {
  if (!GL_TABLE) {
    const typeNames = Object.keys(GL_TO_GLSL_TYPES);
    GL_TABLE = {};
    for (let i = 0; i < typeNames.length; ++i) {
      const tn = typeNames[i];
      GL_TABLE[gl[tn]] = GL_TO_GLSL_TYPES[tn];
    }
  }
  return GL_TABLE[type];
}
exports.mapType = mapType;


},{}],108:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants");
function setPrecision(src, requestedPrecision, maxSupportedPrecision) {
  if (src.substring(0, 9) !== "precision") {
    let precision = requestedPrecision;
    return requestedPrecision === constants.PRECISION.HIGH && maxSupportedPrecision !== constants.PRECISION.HIGH && (precision = constants.PRECISION.MEDIUM), `precision ${precision} float;
${src}`;
  } else if (maxSupportedPrecision !== constants.PRECISION.HIGH && src.substring(0, 15) === "precision highp")
    return src.replace("precision highp", "precision mediump");
  return src;
}
exports.setPrecision = setPrecision;


},{"@pixi/constants":31}],109:[function(require,module,exports){
"use strict";
const uniformParsers = [
  // a float cache layer
  {
    test: (data) => data.type === "float" && data.size === 1 && !data.isArray,
    code: (name) => `
            if(uv["${name}"] !== ud["${name}"].value)
            {
                ud["${name}"].value = uv["${name}"]
                gl.uniform1f(ud["${name}"].location, uv["${name}"])
            }
            `
  },
  // handling samplers
  {
    test: (data, uniform) => (
      // eslint-disable-next-line max-len,no-eq-null,eqeqeq
      (data.type === "sampler2D" || data.type === "samplerCube" || data.type === "sampler2DArray") && data.size === 1 && !data.isArray && (uniform == null || uniform.castToBaseTexture !== void 0)
    ),
    code: (name) => `t = syncData.textureCount++;

            renderer.texture.bind(uv["${name}"], t);

            if(ud["${name}"].value !== t)
            {
                ud["${name}"].value = t;
                gl.uniform1i(ud["${name}"].location, t);
; // eslint-disable-line max-len
            }`
  },
  // uploading pixi matrix object to mat3
  {
    test: (data, uniform) => data.type === "mat3" && data.size === 1 && !data.isArray && uniform.a !== void 0,
    code: (name) => (
      // TODO and some smart caching dirty ids here!
      `
            gl.uniformMatrix3fv(ud["${name}"].location, false, uv["${name}"].toArray(true));
            `
    ),
    codeUbo: (name) => `
                var ${name}_matrix = uv.${name}.toArray(true);

                data[offset] = ${name}_matrix[0];
                data[offset+1] = ${name}_matrix[1];
                data[offset+2] = ${name}_matrix[2];
        
                data[offset + 4] = ${name}_matrix[3];
                data[offset + 5] = ${name}_matrix[4];
                data[offset + 6] = ${name}_matrix[5];
        
                data[offset + 8] = ${name}_matrix[6];
                data[offset + 9] = ${name}_matrix[7];
                data[offset + 10] = ${name}_matrix[8];
            `
  },
  // uploading a pixi point as a vec2 with caching layer
  {
    test: (data, uniform) => data.type === "vec2" && data.size === 1 && !data.isArray && uniform.x !== void 0,
    code: (name) => `
                cv = ud["${name}"].value;
                v = uv["${name}"];

                if(cv[0] !== v.x || cv[1] !== v.y)
                {
                    cv[0] = v.x;
                    cv[1] = v.y;
                    gl.uniform2f(ud["${name}"].location, v.x, v.y);
                }`,
    codeUbo: (name) => `
                v = uv.${name};

                data[offset] = v.x;
                data[offset+1] = v.y;
            `
  },
  // caching layer for a vec2
  {
    test: (data) => data.type === "vec2" && data.size === 1 && !data.isArray,
    code: (name) => `
                cv = ud["${name}"].value;
                v = uv["${name}"];

                if(cv[0] !== v[0] || cv[1] !== v[1])
                {
                    cv[0] = v[0];
                    cv[1] = v[1];
                    gl.uniform2f(ud["${name}"].location, v[0], v[1]);
                }
            `
  },
  // upload a pixi rectangle as a vec4 with caching layer
  {
    test: (data, uniform) => data.type === "vec4" && data.size === 1 && !data.isArray && uniform.width !== void 0,
    code: (name) => `
                cv = ud["${name}"].value;
                v = uv["${name}"];

                if(cv[0] !== v.x || cv[1] !== v.y || cv[2] !== v.width || cv[3] !== v.height)
                {
                    cv[0] = v.x;
                    cv[1] = v.y;
                    cv[2] = v.width;
                    cv[3] = v.height;
                    gl.uniform4f(ud["${name}"].location, v.x, v.y, v.width, v.height)
                }`,
    codeUbo: (name) => `
                    v = uv.${name};

                    data[offset] = v.x;
                    data[offset+1] = v.y;
                    data[offset+2] = v.width;
                    data[offset+3] = v.height;
                `
  },
  // upload a pixi color as vec4 with caching layer
  {
    test: (data, uniform) => data.type === "vec4" && data.size === 1 && !data.isArray && uniform.red !== void 0,
    code: (name) => `
                cv = ud["${name}"].value;
                v = uv["${name}"];

                if(cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue || cv[3] !== v.alpha)
                {
                    cv[0] = v.red;
                    cv[1] = v.green;
                    cv[2] = v.blue;
                    cv[3] = v.alpha;
                    gl.uniform4f(ud["${name}"].location, v.red, v.green, v.blue, v.alpha)
                }`,
    codeUbo: (name) => `
                    v = uv.${name};

                    data[offset] = v.red;
                    data[offset+1] = v.green;
                    data[offset+2] = v.blue;
                    data[offset+3] = v.alpha;
                `
  },
  // upload a pixi color as a vec3 with caching layer
  {
    test: (data, uniform) => data.type === "vec3" && data.size === 1 && !data.isArray && uniform.red !== void 0,
    code: (name) => `
                cv = ud["${name}"].value;
                v = uv["${name}"];

                if(cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue || cv[3] !== v.a)
                {
                    cv[0] = v.red;
                    cv[1] = v.green;
                    cv[2] = v.blue;
    
                    gl.uniform3f(ud["${name}"].location, v.red, v.green, v.blue)
                }`,
    codeUbo: (name) => `
                    v = uv.${name};

                    data[offset] = v.red;
                    data[offset+1] = v.green;
                    data[offset+2] = v.blue;
                `
  },
  // a caching layer for vec4 uploading
  {
    test: (data) => data.type === "vec4" && data.size === 1 && !data.isArray,
    code: (name) => `
                cv = ud["${name}"].value;
                v = uv["${name}"];

                if(cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
                {
                    cv[0] = v[0];
                    cv[1] = v[1];
                    cv[2] = v[2];
                    cv[3] = v[3];

                    gl.uniform4f(ud["${name}"].location, v[0], v[1], v[2], v[3])
                }`
  }
];
exports.uniformParsers = uniformParsers;


},{}],110:[function(require,module,exports){
"use strict";
let unsafeEval;
function unsafeEvalSupported() {
  if (typeof unsafeEval == "boolean")
    return unsafeEval;
  try {
    unsafeEval = new Function("param1", "param2", "param3", "return param1[param2] === param3;")({ a: "b" }, "a", "b") === !0;
  } catch {
    unsafeEval = !1;
  }
  return unsafeEval;
}
exports.unsafeEvalSupported = unsafeEvalSupported;


},{}],111:[function(require,module,exports){
"use strict";
var extensions = require("@pixi/extensions");
class StartupSystem {
  constructor(renderer) {
    this.renderer = renderer;
  }
  /**
   * It all starts here! This initiates every system, passing in the options for any system by name.
   * @param options - the config for the renderer and all its systems
   */
  run(options) {
    const { renderer } = this;
    renderer.runners.init.emit(renderer.options), options.hello && console.log(`PixiJS 7.3.2 - ${renderer.rendererLogId} - https://pixijs.com`), renderer.resize(renderer.screen.width, renderer.screen.height);
  }
  destroy() {
  }
}
StartupSystem.defaultOptions = {
  /**
   * {@link PIXI.IRendererOptions.hello}
   * @default false
   * @memberof PIXI.settings.RENDER_OPTIONS
   */
  hello: !1
}, /** @ignore */
StartupSystem.extension = {
  type: [
    extensions.ExtensionType.RendererSystem,
    extensions.ExtensionType.CanvasRendererSystem
  ],
  name: "startup"
};
extensions.extensions.add(StartupSystem);
exports.StartupSystem = StartupSystem;


},{"@pixi/extensions":160}],112:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants");
const BLEND = 0, OFFSET = 1, CULLING = 2, DEPTH_TEST = 3, WINDING = 4, DEPTH_MASK = 5;
class State {
  constructor() {
    this.data = 0, this.blendMode = constants.BLEND_MODES.NORMAL, this.polygonOffset = 0, this.blend = !0, this.depthMask = !0;
  }
  /**
   * Activates blending of the computed fragment color values.
   * @default true
   */
  get blend() {
    return !!(this.data & 1 << BLEND);
  }
  set blend(value) {
    !!(this.data & 1 << BLEND) !== value && (this.data ^= 1 << BLEND);
  }
  /**
   * Activates adding an offset to depth values of polygon's fragments
   * @default false
   */
  get offsets() {
    return !!(this.data & 1 << OFFSET);
  }
  set offsets(value) {
    !!(this.data & 1 << OFFSET) !== value && (this.data ^= 1 << OFFSET);
  }
  /**
   * Activates culling of polygons.
   * @default false
   */
  get culling() {
    return !!(this.data & 1 << CULLING);
  }
  set culling(value) {
    !!(this.data & 1 << CULLING) !== value && (this.data ^= 1 << CULLING);
  }
  /**
   * Activates depth comparisons and updates to the depth buffer.
   * @default false
   */
  get depthTest() {
    return !!(this.data & 1 << DEPTH_TEST);
  }
  set depthTest(value) {
    !!(this.data & 1 << DEPTH_TEST) !== value && (this.data ^= 1 << DEPTH_TEST);
  }
  /**
   * Enables or disables writing to the depth buffer.
   * @default true
   */
  get depthMask() {
    return !!(this.data & 1 << DEPTH_MASK);
  }
  set depthMask(value) {
    !!(this.data & 1 << DEPTH_MASK) !== value && (this.data ^= 1 << DEPTH_MASK);
  }
  /**
   * Specifies whether or not front or back-facing polygons can be culled.
   * @default false
   */
  get clockwiseFrontFace() {
    return !!(this.data & 1 << WINDING);
  }
  set clockwiseFrontFace(value) {
    !!(this.data & 1 << WINDING) !== value && (this.data ^= 1 << WINDING);
  }
  /**
   * The blend mode to be applied when this state is set. Apply a value of `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
   * Setting this mode to anything other than NO_BLEND will automatically switch blending on.
   * @default PIXI.BLEND_MODES.NORMAL
   */
  get blendMode() {
    return this._blendMode;
  }
  set blendMode(value) {
    this.blend = value !== constants.BLEND_MODES.NONE, this._blendMode = value;
  }
  /**
   * The polygon offset. Setting this property to anything other than 0 will automatically enable polygon offset fill.
   * @default 0
   */
  get polygonOffset() {
    return this._polygonOffset;
  }
  set polygonOffset(value) {
    this.offsets = !!value, this._polygonOffset = value;
  }
  static for2d() {
    const state = new State();
    return state.depthTest = !1, state.blend = !0, state;
  }
}
State.prototype.toString = function() {
  return `[@pixi/core:State blendMode=${this.blendMode} clockwiseFrontFace=${this.clockwiseFrontFace} culling=${this.culling} depthMask=${this.depthMask} polygonOffset=${this.polygonOffset}]`;
};
exports.State = State;


},{"@pixi/constants":31}],113:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), extensions = require("@pixi/extensions"), State = require("./State.js"), mapWebGLBlendModesToPixi = require("./utils/mapWebGLBlendModesToPixi.js");
const BLEND = 0, OFFSET = 1, CULLING = 2, DEPTH_TEST = 3, WINDING = 4, DEPTH_MASK = 5, _StateSystem = class _StateSystem2 {
  constructor() {
    this.gl = null, this.stateId = 0, this.polygonOffset = 0, this.blendMode = constants.BLEND_MODES.NONE, this._blendEq = !1, this.map = [], this.map[BLEND] = this.setBlend, this.map[OFFSET] = this.setOffset, this.map[CULLING] = this.setCullFace, this.map[DEPTH_TEST] = this.setDepthTest, this.map[WINDING] = this.setFrontFace, this.map[DEPTH_MASK] = this.setDepthMask, this.checks = [], this.defaultState = new State.State(), this.defaultState.blend = !0;
  }
  contextChange(gl) {
    this.gl = gl, this.blendModes = mapWebGLBlendModesToPixi.mapWebGLBlendModesToPixi(gl), this.set(this.defaultState), this.reset();
  }
  /**
   * Sets the current state
   * @param {*} state - The state to set.
   */
  set(state) {
    if (state = state || this.defaultState, this.stateId !== state.data) {
      let diff = this.stateId ^ state.data, i = 0;
      for (; diff; )
        diff & 1 && this.map[i].call(this, !!(state.data & 1 << i)), diff = diff >> 1, i++;
      this.stateId = state.data;
    }
    for (let i = 0; i < this.checks.length; i++)
      this.checks[i](this, state);
  }
  /**
   * Sets the state, when previous state is unknown.
   * @param {*} state - The state to set
   */
  forceState(state) {
    state = state || this.defaultState;
    for (let i = 0; i < this.map.length; i++)
      this.map[i].call(this, !!(state.data & 1 << i));
    for (let i = 0; i < this.checks.length; i++)
      this.checks[i](this, state);
    this.stateId = state.data;
  }
  /**
   * Sets whether to enable or disable blending.
   * @param value - Turn on or off WebGl blending.
   */
  setBlend(value) {
    this.updateCheck(_StateSystem2.checkBlendMode, value), this.gl[value ? "enable" : "disable"](this.gl.BLEND);
  }
  /**
   * Sets whether to enable or disable polygon offset fill.
   * @param value - Turn on or off webgl polygon offset testing.
   */
  setOffset(value) {
    this.updateCheck(_StateSystem2.checkPolygonOffset, value), this.gl[value ? "enable" : "disable"](this.gl.POLYGON_OFFSET_FILL);
  }
  /**
   * Sets whether to enable or disable depth test.
   * @param value - Turn on or off webgl depth testing.
   */
  setDepthTest(value) {
    this.gl[value ? "enable" : "disable"](this.gl.DEPTH_TEST);
  }
  /**
   * Sets whether to enable or disable depth mask.
   * @param value - Turn on or off webgl depth mask.
   */
  setDepthMask(value) {
    this.gl.depthMask(value);
  }
  /**
   * Sets whether to enable or disable cull face.
   * @param {boolean} value - Turn on or off webgl cull face.
   */
  setCullFace(value) {
    this.gl[value ? "enable" : "disable"](this.gl.CULL_FACE);
  }
  /**
   * Sets the gl front face.
   * @param {boolean} value - true is clockwise and false is counter-clockwise
   */
  setFrontFace(value) {
    this.gl.frontFace(this.gl[value ? "CW" : "CCW"]);
  }
  /**
   * Sets the blend mode.
   * @param {number} value - The blend mode to set to.
   */
  setBlendMode(value) {
    if (value === this.blendMode)
      return;
    this.blendMode = value;
    const mode = this.blendModes[value], gl = this.gl;
    mode.length === 2 ? gl.blendFunc(mode[0], mode[1]) : gl.blendFuncSeparate(mode[0], mode[1], mode[2], mode[3]), mode.length === 6 ? (this._blendEq = !0, gl.blendEquationSeparate(mode[4], mode[5])) : this._blendEq && (this._blendEq = !1, gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD));
  }
  /**
   * Sets the polygon offset.
   * @param {number} value - the polygon offset
   * @param {number} scale - the polygon offset scale
   */
  setPolygonOffset(value, scale) {
    this.gl.polygonOffset(value, scale);
  }
  // used
  /** Resets all the logic and disables the VAOs. */
  reset() {
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, !1), this.forceState(this.defaultState), this._blendEq = !0, this.blendMode = -1, this.setBlendMode(0);
  }
  /**
   * Checks to see which updates should be checked based on which settings have been activated.
   *
   * For example, if blend is enabled then we should check the blend modes each time the state is changed
   * or if polygon fill is activated then we need to check if the polygon offset changes.
   * The idea is that we only check what we have too.
   * @param func - the checking function to add or remove
   * @param value - should the check function be added or removed.
   */
  updateCheck(func, value) {
    const index = this.checks.indexOf(func);
    value && index === -1 ? this.checks.push(func) : !value && index !== -1 && this.checks.splice(index, 1);
  }
  /**
   * A private little wrapper function that we call to check the blend mode.
   * @param system - the System to perform the state check on
   * @param state - the state that the blendMode will pulled from
   */
  static checkBlendMode(system, state) {
    system.setBlendMode(state.blendMode);
  }
  /**
   * A private little wrapper function that we call to check the polygon offset.
   * @param system - the System to perform the state check on
   * @param state - the state that the blendMode will pulled from
   */
  static checkPolygonOffset(system, state) {
    system.setPolygonOffset(1, state.polygonOffset);
  }
  /**
   * @ignore
   */
  destroy() {
    this.gl = null;
  }
};
_StateSystem.extension = {
  type: extensions.ExtensionType.RendererSystem,
  name: "state"
};
let StateSystem = _StateSystem;
extensions.extensions.add(StateSystem);
exports.StateSystem = StateSystem;


},{"./State.js":112,"./utils/mapWebGLBlendModesToPixi.js":114,"@pixi/constants":31,"@pixi/extensions":160}],114:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants");
function mapWebGLBlendModesToPixi(gl, array = []) {
  return array[constants.BLEND_MODES.NORMAL] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], array[constants.BLEND_MODES.ADD] = [gl.ONE, gl.ONE], array[constants.BLEND_MODES.MULTIPLY] = [gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA], array[constants.BLEND_MODES.SCREEN] = [gl.ONE, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA], array[constants.BLEND_MODES.OVERLAY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], array[constants.BLEND_MODES.DARKEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], array[constants.BLEND_MODES.LIGHTEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], array[constants.BLEND_MODES.COLOR_DODGE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], array[constants.BLEND_MODES.COLOR_BURN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], array[constants.BLEND_MODES.HARD_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], array[constants.BLEND_MODES.SOFT_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], array[constants.BLEND_MODES.DIFFERENCE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], array[constants.BLEND_MODES.EXCLUSION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], array[constants.BLEND_MODES.HUE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], array[constants.BLEND_MODES.SATURATION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], array[constants.BLEND_MODES.COLOR] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], array[constants.BLEND_MODES.LUMINOSITY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA], array[constants.BLEND_MODES.NONE] = [0, 0], array[constants.BLEND_MODES.NORMAL_NPM] = [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA], array[constants.BLEND_MODES.ADD_NPM] = [gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE], array[constants.BLEND_MODES.SCREEN_NPM] = [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA], array[constants.BLEND_MODES.SRC_IN] = [gl.DST_ALPHA, gl.ZERO], array[constants.BLEND_MODES.SRC_OUT] = [gl.ONE_MINUS_DST_ALPHA, gl.ZERO], array[constants.BLEND_MODES.SRC_ATOP] = [gl.DST_ALPHA, gl.ONE_MINUS_SRC_ALPHA], array[constants.BLEND_MODES.DST_OVER] = [gl.ONE_MINUS_DST_ALPHA, gl.ONE], array[constants.BLEND_MODES.DST_IN] = [gl.ZERO, gl.SRC_ALPHA], array[constants.BLEND_MODES.DST_OUT] = [gl.ZERO, gl.ONE_MINUS_SRC_ALPHA], array[constants.BLEND_MODES.DST_ATOP] = [gl.ONE_MINUS_DST_ALPHA, gl.SRC_ALPHA], array[constants.BLEND_MODES.XOR] = [gl.ONE_MINUS_DST_ALPHA, gl.ONE_MINUS_SRC_ALPHA], array[constants.BLEND_MODES.SUBTRACT] = [gl.ONE, gl.ONE, gl.ONE, gl.ONE, gl.FUNC_REVERSE_SUBTRACT, gl.FUNC_ADD], array;
}
exports.mapWebGLBlendModesToPixi = mapWebGLBlendModesToPixi;


},{"@pixi/constants":31}],115:[function(require,module,exports){
"use strict";


},{}],116:[function(require,module,exports){
"use strict";
var runner = require("@pixi/runner"), utils = require("@pixi/utils");
class SystemManager extends utils.EventEmitter {
  constructor() {
    super(...arguments), this.runners = {}, this._systemsHash = {};
  }
  /**
   * Set up a system with a collection of SystemClasses and runners.
   * Systems are attached dynamically to this class when added.
   * @param config - the config for the system manager
   */
  setup(config) {
    this.addRunners(...config.runners);
    const priority = (config.priority ?? []).filter((key) => config.systems[key]), orderByPriority = [
      ...priority,
      ...Object.keys(config.systems).filter((key) => !priority.includes(key))
    ];
    for (const i of orderByPriority)
      this.addSystem(config.systems[i], i);
  }
  /**
   * Create a bunch of runners based of a collection of ids
   * @param runnerIds - the runner ids to add
   */
  addRunners(...runnerIds) {
    runnerIds.forEach((runnerId) => {
      this.runners[runnerId] = new runner.Runner(runnerId);
    });
  }
  /**
   * Add a new system to the renderer.
   * @param ClassRef - Class reference
   * @param name - Property name for system, if not specified
   *        will use a static `name` property on the class itself. This
   *        name will be assigned as s property on the Renderer so make
   *        sure it doesn't collide with properties on Renderer.
   * @returns Return instance of renderer
   */
  addSystem(ClassRef, name) {
    const system = new ClassRef(this);
    if (this[name])
      throw new Error(`Whoops! The name "${name}" is already in use`);
    this[name] = system, this._systemsHash[name] = system;
    for (const i in this.runners)
      this.runners[i].add(system);
    return this;
  }
  /**
   * A function that will run a runner and call the runners function but pass in different options
   * to each system based on there name.
   *
   * E.g. If you have two systems added called `systemA` and `systemB` you could call do the following:
   *
   * ```js
   * system.emitWithCustomOptions(init, {
   *     systemA: {...optionsForA},
   *     systemB: {...optionsForB},
   * });
   * ```
   *
   * `init` would be called on system A passing `optionsForA` and on system B passing `optionsForB`.
   * @param runner - the runner to target
   * @param options - key value options for each system
   */
  emitWithCustomOptions(runner2, options) {
    const systemHashKeys = Object.keys(this._systemsHash);
    runner2.items.forEach((system) => {
      const systemName = systemHashKeys.find((systemId) => this._systemsHash[systemId] === system);
      system[runner2.name](options[systemName]);
    });
  }
  /** destroy the all runners and systems. Its apps job to */
  destroy() {
    Object.values(this.runners).forEach((runner2) => {
      runner2.destroy();
    }), this._systemsHash = {};
  }
  // TODO implement!
  // removeSystem(ClassRef: ISystemConstructor, name: string): void
  // {
  // }
}
exports.SystemManager = SystemManager;


},{"@pixi/runner":176,"@pixi/utils":202}],117:[function(require,module,exports){
"use strict";
var BackgroundSystem = require("./background/BackgroundSystem.js"), BatchSystem = require("./batch/BatchSystem.js"), ContextSystem = require("./context/ContextSystem.js"), FilterSystem = require("./filters/FilterSystem.js"), FramebufferSystem = require("./framebuffer/FramebufferSystem.js"), GeometrySystem = require("./geometry/GeometrySystem.js"), MaskSystem = require("./mask/MaskSystem.js"), ScissorSystem = require("./mask/ScissorSystem.js"), StencilSystem = require("./mask/StencilSystem.js"), PluginSystem = require("./plugin/PluginSystem.js"), ProjectionSystem = require("./projection/ProjectionSystem.js"), GenerateTextureSystem = require("./renderTexture/GenerateTextureSystem.js"), RenderTextureSystem = require("./renderTexture/RenderTextureSystem.js"), ShaderSystem = require("./shader/ShaderSystem.js"), StartupSystem = require("./startup/StartupSystem.js"), StateSystem = require("./state/StateSystem.js"), SystemManager = require("./system/SystemManager.js"), TextureGCSystem = require("./textures/TextureGCSystem.js"), TextureSystem = require("./textures/TextureSystem.js"), TransformFeedbackSystem = require("./transformFeedback/TransformFeedbackSystem.js"), ViewSystem = require("./view/ViewSystem.js");
exports.BackgroundSystem = BackgroundSystem.BackgroundSystem;
exports.BatchSystem = BatchSystem.BatchSystem;
exports.ContextSystem = ContextSystem.ContextSystem;
exports.FilterSystem = FilterSystem.FilterSystem;
exports.FramebufferSystem = FramebufferSystem.FramebufferSystem;
exports.GeometrySystem = GeometrySystem.GeometrySystem;
exports.MaskSystem = MaskSystem.MaskSystem;
exports.ScissorSystem = ScissorSystem.ScissorSystem;
exports.StencilSystem = StencilSystem.StencilSystem;
exports.PluginSystem = PluginSystem.PluginSystem;
exports.ProjectionSystem = ProjectionSystem.ProjectionSystem;
exports.GenerateTextureSystem = GenerateTextureSystem.GenerateTextureSystem;
exports.RenderTextureSystem = RenderTextureSystem.RenderTextureSystem;
exports.ShaderSystem = ShaderSystem.ShaderSystem;
exports.StartupSystem = StartupSystem.StartupSystem;
exports.StateSystem = StateSystem.StateSystem;
exports.SystemManager = SystemManager.SystemManager;
exports.TextureGCSystem = TextureGCSystem.TextureGCSystem;
exports.TextureSystem = TextureSystem.TextureSystem;
exports.TransformFeedbackSystem = TransformFeedbackSystem.TransformFeedbackSystem;
exports.ViewSystem = ViewSystem.ViewSystem;


},{"./background/BackgroundSystem.js":35,"./batch/BatchSystem.js":40,"./context/ContextSystem.js":47,"./filters/FilterSystem.js":50,"./framebuffer/FramebufferSystem.js":61,"./geometry/GeometrySystem.js":69,"./mask/MaskSystem.js":75,"./mask/ScissorSystem.js":76,"./mask/StencilSystem.js":77,"./plugin/PluginSystem.js":78,"./projection/ProjectionSystem.js":79,"./renderTexture/GenerateTextureSystem.js":81,"./renderTexture/RenderTextureSystem.js":84,"./shader/ShaderSystem.js":90,"./startup/StartupSystem.js":111,"./state/StateSystem.js":113,"./system/SystemManager.js":116,"./textures/TextureGCSystem.js":121,"./textures/TextureSystem.js":123,"./transformFeedback/TransformFeedbackSystem.js":141,"./view/ViewSystem.js":144}],118:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), settings = require("@pixi/settings"), utils = require("@pixi/utils"), autoDetectResource = require("./resources/autoDetectResource.js"), BufferResource = require("./resources/BufferResource.js"), Resource = require("./resources/Resource.js");
const defaultBufferOptions = {
  scaleMode: constants.SCALE_MODES.NEAREST,
  alphaMode: constants.ALPHA_MODES.NPM
}, _BaseTexture = class _BaseTexture2 extends utils.EventEmitter {
  /**
   * @param {PIXI.Resource|HTMLImageElement|HTMLVideoElement|ImageBitmap|ICanvas|string} [resource=null] -
   *        The current resource to use, for things that aren't Resource objects, will be converted
   *        into a Resource.
   * @param options - Collection of options, default options inherited from {@link PIXI.BaseTexture.defaultOptions}.
   * @param {PIXI.MIPMAP_MODES} [options.mipmap] - If mipmapping is enabled for texture
   * @param {number} [options.anisotropicLevel] - Anisotropic filtering level of texture
   * @param {PIXI.WRAP_MODES} [options.wrapMode] - Wrap mode for textures
   * @param {PIXI.SCALE_MODES} [options.scaleMode] - Default scale mode, linear, nearest
   * @param {PIXI.FORMATS} [options.format] - GL format type
   * @param {PIXI.TYPES} [options.type] - GL data type
   * @param {PIXI.TARGETS} [options.target] - GL texture target
   * @param {PIXI.ALPHA_MODES} [options.alphaMode] - Pre multiply the image alpha
   * @param {number} [options.width=0] - Width of the texture
   * @param {number} [options.height=0] - Height of the texture
   * @param {number} [options.resolution=PIXI.settings.RESOLUTION] - Resolution of the base texture
   * @param {object} [options.resourceOptions] - Optional resource options,
   *        see {@link PIXI.autoDetectResource autoDetectResource}
   */
  constructor(resource = null, options = null) {
    super(), options = Object.assign({}, _BaseTexture2.defaultOptions, options);
    const {
      alphaMode,
      mipmap,
      anisotropicLevel,
      scaleMode,
      width,
      height,
      wrapMode,
      format,
      type,
      target,
      resolution,
      resourceOptions
    } = options;
    resource && !(resource instanceof Resource.Resource) && (resource = autoDetectResource.autoDetectResource(resource, resourceOptions), resource.internal = !0), this.resolution = resolution || settings.settings.RESOLUTION, this.width = Math.round((width || 0) * this.resolution) / this.resolution, this.height = Math.round((height || 0) * this.resolution) / this.resolution, this._mipmap = mipmap, this.anisotropicLevel = anisotropicLevel, this._wrapMode = wrapMode, this._scaleMode = scaleMode, this.format = format, this.type = type, this.target = target, this.alphaMode = alphaMode, this.uid = utils.uid(), this.touched = 0, this.isPowerOfTwo = !1, this._refreshPOT(), this._glTextures = {}, this.dirtyId = 0, this.dirtyStyleId = 0, this.cacheId = null, this.valid = width > 0 && height > 0, this.textureCacheIds = [], this.destroyed = !1, this.resource = null, this._batchEnabled = 0, this._batchLocation = 0, this.parentTextureArray = null, this.setResource(resource);
  }
  /**
   * Pixel width of the source of this texture
   * @readonly
   */
  get realWidth() {
    return Math.round(this.width * this.resolution);
  }
  /**
   * Pixel height of the source of this texture
   * @readonly
   */
  get realHeight() {
    return Math.round(this.height * this.resolution);
  }
  /**
   * Mipmap mode of the texture, affects downscaled images
   * @default PIXI.MIPMAP_MODES.POW2
   */
  get mipmap() {
    return this._mipmap;
  }
  set mipmap(value) {
    this._mipmap !== value && (this._mipmap = value, this.dirtyStyleId++);
  }
  /**
   * The scale mode to apply when scaling this texture
   * @default PIXI.SCALE_MODES.LINEAR
   */
  get scaleMode() {
    return this._scaleMode;
  }
  set scaleMode(value) {
    this._scaleMode !== value && (this._scaleMode = value, this.dirtyStyleId++);
  }
  /**
   * How the texture wraps
   * @default PIXI.WRAP_MODES.CLAMP
   */
  get wrapMode() {
    return this._wrapMode;
  }
  set wrapMode(value) {
    this._wrapMode !== value && (this._wrapMode = value, this.dirtyStyleId++);
  }
  /**
   * Changes style options of BaseTexture
   * @param scaleMode - Pixi scalemode
   * @param mipmap - enable mipmaps
   * @returns - this
   */
  setStyle(scaleMode, mipmap) {
    let dirty;
    return scaleMode !== void 0 && scaleMode !== this.scaleMode && (this.scaleMode = scaleMode, dirty = !0), mipmap !== void 0 && mipmap !== this.mipmap && (this.mipmap = mipmap, dirty = !0), dirty && this.dirtyStyleId++, this;
  }
  /**
   * Changes w/h/resolution. Texture becomes valid if width and height are greater than zero.
   * @param desiredWidth - Desired visual width
   * @param desiredHeight - Desired visual height
   * @param resolution - Optionally set resolution
   * @returns - this
   */
  setSize(desiredWidth, desiredHeight, resolution) {
    return resolution = resolution || this.resolution, this.setRealSize(desiredWidth * resolution, desiredHeight * resolution, resolution);
  }
  /**
   * Sets real size of baseTexture, preserves current resolution.
   * @param realWidth - Full rendered width
   * @param realHeight - Full rendered height
   * @param resolution - Optionally set resolution
   * @returns - this
   */
  setRealSize(realWidth, realHeight, resolution) {
    return this.resolution = resolution || this.resolution, this.width = Math.round(realWidth) / this.resolution, this.height = Math.round(realHeight) / this.resolution, this._refreshPOT(), this.update(), this;
  }
  /**
   * Refresh check for isPowerOfTwo texture based on size
   * @private
   */
  _refreshPOT() {
    this.isPowerOfTwo = utils.isPow2(this.realWidth) && utils.isPow2(this.realHeight);
  }
  /**
   * Changes resolution
   * @param resolution - res
   * @returns - this
   */
  setResolution(resolution) {
    const oldResolution = this.resolution;
    return oldResolution === resolution ? this : (this.resolution = resolution, this.valid && (this.width = Math.round(this.width * oldResolution) / resolution, this.height = Math.round(this.height * oldResolution) / resolution, this.emit("update", this)), this._refreshPOT(), this);
  }
  /**
   * Sets the resource if it wasn't set. Throws error if resource already present
   * @param resource - that is managing this BaseTexture
   * @returns - this
   */
  setResource(resource) {
    if (this.resource === resource)
      return this;
    if (this.resource)
      throw new Error("Resource can be set only once");
    return resource.bind(this), this.resource = resource, this;
  }
  /** Invalidates the object. Texture becomes valid if width and height are greater than zero. */
  update() {
    this.valid ? (this.dirtyId++, this.dirtyStyleId++, this.emit("update", this)) : this.width > 0 && this.height > 0 && (this.valid = !0, this.emit("loaded", this), this.emit("update", this));
  }
  /**
   * Handle errors with resources.
   * @private
   * @param event - Error event emitted.
   */
  onError(event) {
    this.emit("error", this, event);
  }
  /**
   * Destroys this base texture.
   * The method stops if resource doesn't want this texture to be destroyed.
   * Removes texture from all caches.
   * @fires PIXI.BaseTexture#destroyed
   */
  destroy() {
    this.resource && (this.resource.unbind(this), this.resource.internal && this.resource.destroy(), this.resource = null), this.cacheId && (delete utils.BaseTextureCache[this.cacheId], delete utils.TextureCache[this.cacheId], this.cacheId = null), this.valid = !1, this.dispose(), _BaseTexture2.removeFromCache(this), this.textureCacheIds = null, this.destroyed = !0, this.emit("destroyed", this), this.removeAllListeners();
  }
  /**
   * Frees the texture from WebGL memory without destroying this texture object.
   * This means you can still use the texture later which will upload it to GPU
   * memory again.
   * @fires PIXI.BaseTexture#dispose
   */
  dispose() {
    this.emit("dispose", this);
  }
  /** Utility function for BaseTexture|Texture cast. */
  castToBaseTexture() {
    return this;
  }
  /**
   * Helper function that creates a base texture based on the source you provide.
   * The source can be - image url, image element, canvas element. If the
   * source is an image url or an image element and not in the base texture
   * cache, it will be created and loaded.
   * @static
   * @param {HTMLImageElement|HTMLVideoElement|ImageBitmap|PIXI.ICanvas|string|string[]} source - The
   *        source to create base texture from.
   * @param options - See {@link PIXI.BaseTexture}'s constructor for options.
   * @param {string} [options.pixiIdPrefix=pixiid] - If a source has no id, this is the prefix of the generated id
   * @param {boolean} [strict] - Enforce strict-mode, see {@link PIXI.settings.STRICT_TEXTURE_CACHE}.
   * @returns {PIXI.BaseTexture} The new base texture.
   */
  static from(source, options, strict = settings.settings.STRICT_TEXTURE_CACHE) {
    const isFrame = typeof source == "string";
    let cacheId = null;
    if (isFrame)
      cacheId = source;
    else {
      if (!source._pixiId) {
        const prefix = options?.pixiIdPrefix || "pixiid";
        source._pixiId = `${prefix}_${utils.uid()}`;
      }
      cacheId = source._pixiId;
    }
    let baseTexture = utils.BaseTextureCache[cacheId];
    if (isFrame && strict && !baseTexture)
      throw new Error(`The cacheId "${cacheId}" does not exist in BaseTextureCache.`);
    return baseTexture || (baseTexture = new _BaseTexture2(source, options), baseTexture.cacheId = cacheId, _BaseTexture2.addToCache(baseTexture, cacheId)), baseTexture;
  }
  /**
   * Create a new Texture with a BufferResource from a typed array.
   * @param buffer - The optional array to use. If no data is provided, a new Float32Array is created.
   * @param width - Width of the resource
   * @param height - Height of the resource
   * @param options - See {@link PIXI.BaseTexture}'s constructor for options.
   *        Default properties are different from the constructor's defaults.
   * @param {PIXI.FORMATS} [options.format] - The format is not given, the type is inferred from the
   *        type of the buffer: `RGBA` if Float32Array, Int8Array, Uint8Array, or Uint8ClampedArray,
   *        otherwise `RGBA_INTEGER`.
   * @param {PIXI.TYPES} [options.type] - The type is not given, the type is inferred from the
   *        type of the buffer. Maps Float32Array to `FLOAT`, Int32Array to `INT`, Uint32Array to
   *        `UNSIGNED_INT`, Int16Array to `SHORT`, Uint16Array to `UNSIGNED_SHORT`, Int8Array to `BYTE`,
   *        Uint8Array/Uint8ClampedArray to `UNSIGNED_BYTE`.
   * @param {PIXI.ALPHA_MODES} [options.alphaMode=PIXI.ALPHA_MODES.NPM]
   * @param {PIXI.SCALE_MODES} [options.scaleMode=PIXI.SCALE_MODES.NEAREST]
   * @returns - The resulting new BaseTexture
   */
  static fromBuffer(buffer, width, height, options) {
    buffer = buffer || new Float32Array(width * height * 4);
    const resource = new BufferResource.BufferResource(buffer, { width, height, ...options?.resourceOptions });
    let format, type;
    return buffer instanceof Float32Array ? (format = constants.FORMATS.RGBA, type = constants.TYPES.FLOAT) : buffer instanceof Int32Array ? (format = constants.FORMATS.RGBA_INTEGER, type = constants.TYPES.INT) : buffer instanceof Uint32Array ? (format = constants.FORMATS.RGBA_INTEGER, type = constants.TYPES.UNSIGNED_INT) : buffer instanceof Int16Array ? (format = constants.FORMATS.RGBA_INTEGER, type = constants.TYPES.SHORT) : buffer instanceof Uint16Array ? (format = constants.FORMATS.RGBA_INTEGER, type = constants.TYPES.UNSIGNED_SHORT) : buffer instanceof Int8Array ? (format = constants.FORMATS.RGBA, type = constants.TYPES.BYTE) : (format = constants.FORMATS.RGBA, type = constants.TYPES.UNSIGNED_BYTE), resource.internal = !0, new _BaseTexture2(resource, Object.assign({}, defaultBufferOptions, { type, format }, options));
  }
  /**
   * Adds a BaseTexture to the global BaseTextureCache. This cache is shared across the whole PIXI object.
   * @param {PIXI.BaseTexture} baseTexture - The BaseTexture to add to the cache.
   * @param {string} id - The id that the BaseTexture will be stored against.
   */
  static addToCache(baseTexture, id) {
    id && (baseTexture.textureCacheIds.includes(id) || baseTexture.textureCacheIds.push(id), utils.BaseTextureCache[id] && utils.BaseTextureCache[id] !== baseTexture && console.warn(`BaseTexture added to the cache with an id [${id}] that already had an entry`), utils.BaseTextureCache[id] = baseTexture);
  }
  /**
   * Remove a BaseTexture from the global BaseTextureCache.
   * @param {string|PIXI.BaseTexture} baseTexture - id of a BaseTexture to be removed, or a BaseTexture instance itself.
   * @returns {PIXI.BaseTexture|null} The BaseTexture that was removed.
   */
  static removeFromCache(baseTexture) {
    if (typeof baseTexture == "string") {
      const baseTextureFromCache = utils.BaseTextureCache[baseTexture];
      if (baseTextureFromCache) {
        const index = baseTextureFromCache.textureCacheIds.indexOf(baseTexture);
        return index > -1 && baseTextureFromCache.textureCacheIds.splice(index, 1), delete utils.BaseTextureCache[baseTexture], baseTextureFromCache;
      }
    } else if (baseTexture?.textureCacheIds) {
      for (let i = 0; i < baseTexture.textureCacheIds.length; ++i)
        delete utils.BaseTextureCache[baseTexture.textureCacheIds[i]];
      return baseTexture.textureCacheIds.length = 0, baseTexture;
    }
    return null;
  }
};
_BaseTexture.defaultOptions = {
  /**
   * If mipmapping is enabled for texture.
   * @type {PIXI.MIPMAP_MODES}
   * @default PIXI.MIPMAP_MODES.POW2
   */
  mipmap: constants.MIPMAP_MODES.POW2,
  /** Anisotropic filtering level of texture */
  anisotropicLevel: 0,
  /**
   * Default scale mode, linear, nearest.
   * @type {PIXI.SCALE_MODES}
   * @default PIXI.SCALE_MODES.LINEAR
   */
  scaleMode: constants.SCALE_MODES.LINEAR,
  /**
   * Wrap mode for textures.
   * @type {PIXI.WRAP_MODES}
   * @default PIXI.WRAP_MODES.CLAMP
   */
  wrapMode: constants.WRAP_MODES.CLAMP,
  /**
   * Pre multiply the image alpha
   * @type {PIXI.ALPHA_MODES}
   * @default PIXI.ALPHA_MODES.UNPACK
   */
  alphaMode: constants.ALPHA_MODES.UNPACK,
  /**
   * GL texture target
   * @type {PIXI.TARGETS}
   * @default PIXI.TARGETS.TEXTURE_2D
   */
  target: constants.TARGETS.TEXTURE_2D,
  /**
   * GL format type
   * @type {PIXI.FORMATS}
   * @default PIXI.FORMATS.RGBA
   */
  format: constants.FORMATS.RGBA,
  /**
   * GL data type
   * @type {PIXI.TYPES}
   * @default PIXI.TYPES.UNSIGNED_BYTE
   */
  type: constants.TYPES.UNSIGNED_BYTE
}, /** Global number of the texture batch, used by multi-texture renderers. */
_BaseTexture._globalBatch = 0;
let BaseTexture = _BaseTexture;
exports.BaseTexture = BaseTexture;


},{"./resources/BufferResource.js":128,"./resources/Resource.js":133,"./resources/autoDetectResource.js":136,"@pixi/constants":31,"@pixi/settings":180,"@pixi/utils":202}],119:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants");
class GLTexture {
  constructor(texture) {
    this.texture = texture, this.width = -1, this.height = -1, this.dirtyId = -1, this.dirtyStyleId = -1, this.mipmap = !1, this.wrapMode = 33071, this.type = constants.TYPES.UNSIGNED_BYTE, this.internalFormat = constants.FORMATS.RGBA, this.samplerType = 0;
  }
}
exports.GLTexture = GLTexture;


},{"@pixi/constants":31}],120:[function(require,module,exports){
"use strict";
var math = require("@pixi/math"), settings = require("@pixi/settings"), utils = require("@pixi/utils"), BaseTexture = require("./BaseTexture.js"), ImageResource = require("./resources/ImageResource.js"), TextureUvs = require("./TextureUvs.js");
const DEFAULT_UVS = new TextureUvs.TextureUvs();
function removeAllHandlers(tex) {
  tex.destroy = function() {
  }, tex.on = function() {
  }, tex.once = function() {
  }, tex.emit = function() {
  };
}
class Texture extends utils.EventEmitter {
  /**
   * @param baseTexture - The base texture source to create the texture from
   * @param frame - The rectangle frame of the texture to show
   * @param orig - The area of original texture
   * @param trim - Trimmed rectangle of original texture
   * @param rotate - indicates how the texture was rotated by texture packer. See {@link PIXI.groupD8}
   * @param anchor - Default anchor point used for sprite placement / rotation
   * @param borders - Default borders used for 9-slice scaling. See {@link PIXI.NineSlicePlane}
   */
  constructor(baseTexture, frame, orig, trim, rotate, anchor, borders) {
    if (super(), this.noFrame = !1, frame || (this.noFrame = !0, frame = new math.Rectangle(0, 0, 1, 1)), baseTexture instanceof Texture && (baseTexture = baseTexture.baseTexture), this.baseTexture = baseTexture, this._frame = frame, this.trim = trim, this.valid = !1, this.destroyed = !1, this._uvs = DEFAULT_UVS, this.uvMatrix = null, this.orig = orig || frame, this._rotate = Number(rotate || 0), rotate === !0)
      this._rotate = 2;
    else if (this._rotate % 2 !== 0)
      throw new Error("attempt to use diamond-shaped UVs. If you are sure, set rotation manually");
    this.defaultAnchor = anchor ? new math.Point(anchor.x, anchor.y) : new math.Point(0, 0), this.defaultBorders = borders, this._updateID = 0, this.textureCacheIds = [], baseTexture.valid ? this.noFrame ? baseTexture.valid && this.onBaseTextureUpdated(baseTexture) : this.frame = frame : baseTexture.once("loaded", this.onBaseTextureUpdated, this), this.noFrame && baseTexture.on("update", this.onBaseTextureUpdated, this);
  }
  /**
   * Updates this texture on the gpu.
   *
   * Calls the TextureResource update.
   *
   * If you adjusted `frame` manually, please call `updateUvs()` instead.
   */
  update() {
    this.baseTexture.resource && this.baseTexture.resource.update();
  }
  /**
   * Called when the base texture is updated
   * @protected
   * @param baseTexture - The base texture.
   */
  onBaseTextureUpdated(baseTexture) {
    if (this.noFrame) {
      if (!this.baseTexture.valid)
        return;
      this._frame.width = baseTexture.width, this._frame.height = baseTexture.height, this.valid = !0, this.updateUvs();
    } else
      this.frame = this._frame;
    this.emit("update", this);
  }
  /**
   * Destroys this texture
   * @param [destroyBase=false] - Whether to destroy the base texture as well
   * @fires PIXI.Texture#destroyed
   */
  destroy(destroyBase) {
    if (this.baseTexture) {
      if (destroyBase) {
        const { resource } = this.baseTexture;
        resource?.url && utils.TextureCache[resource.url] && Texture.removeFromCache(resource.url), this.baseTexture.destroy();
      }
      this.baseTexture.off("loaded", this.onBaseTextureUpdated, this), this.baseTexture.off("update", this.onBaseTextureUpdated, this), this.baseTexture = null;
    }
    this._frame = null, this._uvs = null, this.trim = null, this.orig = null, this.valid = !1, Texture.removeFromCache(this), this.textureCacheIds = null, this.destroyed = !0, this.emit("destroyed", this), this.removeAllListeners();
  }
  /**
   * Creates a new texture object that acts the same as this one.
   * @returns - The new texture
   */
  clone() {
    const clonedFrame = this._frame.clone(), clonedOrig = this._frame === this.orig ? clonedFrame : this.orig.clone(), clonedTexture = new Texture(
      this.baseTexture,
      !this.noFrame && clonedFrame,
      clonedOrig,
      this.trim?.clone(),
      this.rotate,
      this.defaultAnchor,
      this.defaultBorders
    );
    return this.noFrame && (clonedTexture._frame = clonedFrame), clonedTexture;
  }
  /**
   * Updates the internal WebGL UV cache. Use it after you change `frame` or `trim` of the texture.
   * Call it after changing the frame
   */
  updateUvs() {
    this._uvs === DEFAULT_UVS && (this._uvs = new TextureUvs.TextureUvs()), this._uvs.set(this._frame, this.baseTexture, this.rotate), this._updateID++;
  }
  /**
   * Helper function that creates a new Texture based on the source you provide.
   * The source can be - frame id, image url, video url, canvas element, video element, base texture
   * @param {string|PIXI.BaseTexture|HTMLImageElement|HTMLVideoElement|ImageBitmap|PIXI.ICanvas} source -
   *        Source or array of sources to create texture from
   * @param options - See {@link PIXI.BaseTexture}'s constructor for options.
   * @param {string} [options.pixiIdPrefix=pixiid] - If a source has no id, this is the prefix of the generated id
   * @param {boolean} [strict] - Enforce strict-mode, see {@link PIXI.settings.STRICT_TEXTURE_CACHE}.
   * @returns {PIXI.Texture} The newly created texture
   */
  static from(source, options = {}, strict = settings.settings.STRICT_TEXTURE_CACHE) {
    const isFrame = typeof source == "string";
    let cacheId = null;
    if (isFrame)
      cacheId = source;
    else if (source instanceof BaseTexture.BaseTexture) {
      if (!source.cacheId) {
        const prefix = options?.pixiIdPrefix || "pixiid";
        source.cacheId = `${prefix}-${utils.uid()}`, BaseTexture.BaseTexture.addToCache(source, source.cacheId);
      }
      cacheId = source.cacheId;
    } else {
      if (!source._pixiId) {
        const prefix = options?.pixiIdPrefix || "pixiid";
        source._pixiId = `${prefix}_${utils.uid()}`;
      }
      cacheId = source._pixiId;
    }
    let texture = utils.TextureCache[cacheId];
    if (isFrame && strict && !texture)
      throw new Error(`The cacheId "${cacheId}" does not exist in TextureCache.`);
    return !texture && !(source instanceof BaseTexture.BaseTexture) ? (options.resolution || (options.resolution = utils.getResolutionOfUrl(source)), texture = new Texture(new BaseTexture.BaseTexture(source, options)), texture.baseTexture.cacheId = cacheId, BaseTexture.BaseTexture.addToCache(texture.baseTexture, cacheId), Texture.addToCache(texture, cacheId)) : !texture && source instanceof BaseTexture.BaseTexture && (texture = new Texture(source), Texture.addToCache(texture, cacheId)), texture;
  }
  /**
   * Useful for loading textures via URLs. Use instead of `Texture.from` because
   * it does a better job of handling failed URLs more effectively. This also ignores
   * `PIXI.settings.STRICT_TEXTURE_CACHE`. Works for Videos, SVGs, Images.
   * @param url - The remote URL or array of URLs to load.
   * @param options - Optional options to include
   * @returns - A Promise that resolves to a Texture.
   */
  static fromURL(url, options) {
    const resourceOptions = Object.assign({ autoLoad: !1 }, options?.resourceOptions), texture = Texture.from(url, Object.assign({ resourceOptions }, options), !1), resource = texture.baseTexture.resource;
    return texture.baseTexture.valid ? Promise.resolve(texture) : resource.load().then(() => Promise.resolve(texture));
  }
  /**
   * Create a new Texture with a BufferResource from a typed array.
   * @param buffer - The optional array to use. If no data is provided, a new Float32Array is created.
   * @param width - Width of the resource
   * @param height - Height of the resource
   * @param options - See {@link PIXI.BaseTexture}'s constructor for options.
   *        Default properties are different from the constructor's defaults.
   * @param {PIXI.FORMATS} [options.format] - The format is not given, the type is inferred from the
   *        type of the buffer: `RGBA` if Float32Array, Int8Array, Uint8Array, or Uint8ClampedArray,
   *        otherwise `RGBA_INTEGER`.
   * @param {PIXI.TYPES} [options.type] - The type is not given, the type is inferred from the
   *        type of the buffer. Maps Float32Array to `FLOAT`, Int32Array to `INT`, Uint32Array to
   *        `UNSIGNED_INT`, Int16Array to `SHORT`, Uint16Array to `UNSIGNED_SHORT`, Int8Array to `BYTE`,
   *        Uint8Array/Uint8ClampedArray to `UNSIGNED_BYTE`.
   * @param {PIXI.ALPHA_MODES} [options.alphaMode=PIXI.ALPHA_MODES.NPM]
   * @param {PIXI.SCALE_MODES} [options.scaleMode=PIXI.SCALE_MODES.NEAREST]
   * @returns - The resulting new BaseTexture
   */
  static fromBuffer(buffer, width, height, options) {
    return new Texture(BaseTexture.BaseTexture.fromBuffer(buffer, width, height, options));
  }
  /**
   * Create a texture from a source and add to the cache.
   * @param {HTMLImageElement|HTMLVideoElement|ImageBitmap|PIXI.ICanvas|string} source - The input source.
   * @param imageUrl - File name of texture, for cache and resolving resolution.
   * @param name - Human readable name for the texture cache. If no name is
   *        specified, only `imageUrl` will be used as the cache ID.
   * @param options
   * @returns - Output texture
   */
  static fromLoader(source, imageUrl, name, options) {
    const baseTexture = new BaseTexture.BaseTexture(source, Object.assign({
      scaleMode: BaseTexture.BaseTexture.defaultOptions.scaleMode,
      resolution: utils.getResolutionOfUrl(imageUrl)
    }, options)), { resource } = baseTexture;
    resource instanceof ImageResource.ImageResource && (resource.url = imageUrl);
    const texture = new Texture(baseTexture);
    return name || (name = imageUrl), BaseTexture.BaseTexture.addToCache(texture.baseTexture, name), Texture.addToCache(texture, name), name !== imageUrl && (BaseTexture.BaseTexture.addToCache(texture.baseTexture, imageUrl), Texture.addToCache(texture, imageUrl)), texture.baseTexture.valid ? Promise.resolve(texture) : new Promise((resolve) => {
      texture.baseTexture.once("loaded", () => resolve(texture));
    });
  }
  /**
   * Adds a Texture to the global TextureCache. This cache is shared across the whole PIXI object.
   * @param texture - The Texture to add to the cache.
   * @param id - The id that the Texture will be stored against.
   */
  static addToCache(texture, id) {
    id && (texture.textureCacheIds.includes(id) || texture.textureCacheIds.push(id), utils.TextureCache[id] && utils.TextureCache[id] !== texture && console.warn(`Texture added to the cache with an id [${id}] that already had an entry`), utils.TextureCache[id] = texture);
  }
  /**
   * Remove a Texture from the global TextureCache.
   * @param texture - id of a Texture to be removed, or a Texture instance itself
   * @returns - The Texture that was removed
   */
  static removeFromCache(texture) {
    if (typeof texture == "string") {
      const textureFromCache = utils.TextureCache[texture];
      if (textureFromCache) {
        const index = textureFromCache.textureCacheIds.indexOf(texture);
        return index > -1 && textureFromCache.textureCacheIds.splice(index, 1), delete utils.TextureCache[texture], textureFromCache;
      }
    } else if (texture?.textureCacheIds) {
      for (let i = 0; i < texture.textureCacheIds.length; ++i)
        utils.TextureCache[texture.textureCacheIds[i]] === texture && delete utils.TextureCache[texture.textureCacheIds[i]];
      return texture.textureCacheIds.length = 0, texture;
    }
    return null;
  }
  /**
   * Returns resolution of baseTexture
   * @readonly
   */
  get resolution() {
    return this.baseTexture.resolution;
  }
  /**
   * The frame specifies the region of the base texture that this texture uses.
   * Please call `updateUvs()` after you change coordinates of `frame` manually.
   */
  get frame() {
    return this._frame;
  }
  set frame(frame) {
    this._frame = frame, this.noFrame = !1;
    const { x, y, width, height } = frame, xNotFit = x + width > this.baseTexture.width, yNotFit = y + height > this.baseTexture.height;
    if (xNotFit || yNotFit) {
      const relationship = xNotFit && yNotFit ? "and" : "or", errorX = `X: ${x} + ${width} = ${x + width} > ${this.baseTexture.width}`, errorY = `Y: ${y} + ${height} = ${y + height} > ${this.baseTexture.height}`;
      throw new Error(`Texture Error: frame does not fit inside the base Texture dimensions: ${errorX} ${relationship} ${errorY}`);
    }
    this.valid = width && height && this.baseTexture.valid, !this.trim && !this.rotate && (this.orig = frame), this.valid && this.updateUvs();
  }
  /**
   * Indicates whether the texture is rotated inside the atlas
   * set to 2 to compensate for texture packer rotation
   * set to 6 to compensate for spine packer rotation
   * can be used to rotate or mirror sprites
   * See {@link PIXI.groupD8} for explanation
   */
  get rotate() {
    return this._rotate;
  }
  set rotate(rotate) {
    this._rotate = rotate, this.valid && this.updateUvs();
  }
  /** The width of the Texture in pixels. */
  get width() {
    return this.orig.width;
  }
  /** The height of the Texture in pixels. */
  get height() {
    return this.orig.height;
  }
  /** Utility function for BaseTexture|Texture cast. */
  castToBaseTexture() {
    return this.baseTexture;
  }
  /** An empty texture, used often to not have to create multiple empty textures. Can not be destroyed. */
  static get EMPTY() {
    return Texture._EMPTY || (Texture._EMPTY = new Texture(new BaseTexture.BaseTexture()), removeAllHandlers(Texture._EMPTY), removeAllHandlers(Texture._EMPTY.baseTexture)), Texture._EMPTY;
  }
  /** A white texture of 16x16 size, used for graphics and other things Can not be destroyed. */
  static get WHITE() {
    if (!Texture._WHITE) {
      const canvas = settings.settings.ADAPTER.createCanvas(16, 16), context = canvas.getContext("2d");
      canvas.width = 16, canvas.height = 16, context.fillStyle = "white", context.fillRect(0, 0, 16, 16), Texture._WHITE = new Texture(BaseTexture.BaseTexture.from(canvas)), removeAllHandlers(Texture._WHITE), removeAllHandlers(Texture._WHITE.baseTexture);
    }
    return Texture._WHITE;
  }
}
exports.Texture = Texture;


},{"./BaseTexture.js":118,"./TextureUvs.js":124,"./resources/ImageResource.js":132,"@pixi/math":169,"@pixi/settings":180,"@pixi/utils":202}],121:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), extensions = require("@pixi/extensions");
const _TextureGCSystem = class _TextureGCSystem2 {
  /** @param renderer - The renderer this System works for. */
  constructor(renderer) {
    this.renderer = renderer, this.count = 0, this.checkCount = 0, this.maxIdle = _TextureGCSystem2.defaultMaxIdle, this.checkCountMax = _TextureGCSystem2.defaultCheckCountMax, this.mode = _TextureGCSystem2.defaultMode;
  }
  /**
   * Checks to see when the last time a texture was used.
   * If the texture has not been used for a specified amount of time, it will be removed from the GPU.
   */
  postrender() {
    this.renderer.objectRenderer.renderingToScreen && (this.count++, this.mode !== constants.GC_MODES.MANUAL && (this.checkCount++, this.checkCount > this.checkCountMax && (this.checkCount = 0, this.run())));
  }
  /**
   * Checks to see when the last time a texture was used.
   * If the texture has not been used for a specified amount of time, it will be removed from the GPU.
   */
  run() {
    const tm = this.renderer.texture, managedTextures = tm.managedTextures;
    let wasRemoved = !1;
    for (let i = 0; i < managedTextures.length; i++) {
      const texture = managedTextures[i];
      texture.resource && this.count - texture.touched > this.maxIdle && (tm.destroyTexture(texture, !0), managedTextures[i] = null, wasRemoved = !0);
    }
    if (wasRemoved) {
      let j = 0;
      for (let i = 0; i < managedTextures.length; i++)
        managedTextures[i] !== null && (managedTextures[j++] = managedTextures[i]);
      managedTextures.length = j;
    }
  }
  /**
   * Removes all the textures within the specified displayObject and its children from the GPU.
   * @param {PIXI.DisplayObject} displayObject - the displayObject to remove the textures from.
   */
  unload(displayObject) {
    const tm = this.renderer.texture, texture = displayObject._texture;
    texture && !texture.framebuffer && tm.destroyTexture(texture);
    for (let i = displayObject.children.length - 1; i >= 0; i--)
      this.unload(displayObject.children[i]);
  }
  destroy() {
    this.renderer = null;
  }
};
_TextureGCSystem.defaultMode = constants.GC_MODES.AUTO, /**
* Default maximum idle frames before a texture is destroyed by garbage collection.
* @static
* @default 3600
* @see PIXI.TextureGCSystem#maxIdle
*/
_TextureGCSystem.defaultMaxIdle = 60 * 60, /**
* Default frames between two garbage collections.
* @static
* @default 600
* @see PIXI.TextureGCSystem#checkCountMax
*/
_TextureGCSystem.defaultCheckCountMax = 60 * 10, /** @ignore */
_TextureGCSystem.extension = {
  type: extensions.ExtensionType.RendererSystem,
  name: "textureGC"
};
let TextureGCSystem = _TextureGCSystem;
extensions.extensions.add(TextureGCSystem);
exports.TextureGCSystem = TextureGCSystem;


},{"@pixi/constants":31,"@pixi/extensions":160}],122:[function(require,module,exports){
"use strict";
var math = require("@pixi/math");
const tempMat = new math.Matrix();
class TextureMatrix {
  /**
   * @param texture - observed texture
   * @param clampMargin - Changes frame clamping, 0.5 by default. Use -0.5 for extra border.
   */
  constructor(texture, clampMargin) {
    this._texture = texture, this.mapCoord = new math.Matrix(), this.uClampFrame = new Float32Array(4), this.uClampOffset = new Float32Array(2), this._textureID = -1, this._updateID = 0, this.clampOffset = 0, this.clampMargin = typeof clampMargin > "u" ? 0.5 : clampMargin, this.isSimple = !1;
  }
  /** Texture property. */
  get texture() {
    return this._texture;
  }
  set texture(value) {
    this._texture = value, this._textureID = -1;
  }
  /**
   * Multiplies uvs array to transform
   * @param uvs - mesh uvs
   * @param [out=uvs] - output
   * @returns - output
   */
  multiplyUvs(uvs, out) {
    out === void 0 && (out = uvs);
    const mat = this.mapCoord;
    for (let i = 0; i < uvs.length; i += 2) {
      const x = uvs[i], y = uvs[i + 1];
      out[i] = x * mat.a + y * mat.c + mat.tx, out[i + 1] = x * mat.b + y * mat.d + mat.ty;
    }
    return out;
  }
  /**
   * Updates matrices if texture was changed.
   * @param [forceUpdate=false] - if true, matrices will be updated any case
   * @returns - Whether or not it was updated
   */
  update(forceUpdate) {
    const tex = this._texture;
    if (!tex || !tex.valid || !forceUpdate && this._textureID === tex._updateID)
      return !1;
    this._textureID = tex._updateID, this._updateID++;
    const uvs = tex._uvs;
    this.mapCoord.set(uvs.x1 - uvs.x0, uvs.y1 - uvs.y0, uvs.x3 - uvs.x0, uvs.y3 - uvs.y0, uvs.x0, uvs.y0);
    const orig = tex.orig, trim = tex.trim;
    trim && (tempMat.set(
      orig.width / trim.width,
      0,
      0,
      orig.height / trim.height,
      -trim.x / trim.width,
      -trim.y / trim.height
    ), this.mapCoord.append(tempMat));
    const texBase = tex.baseTexture, frame = this.uClampFrame, margin = this.clampMargin / texBase.resolution, offset = this.clampOffset;
    return frame[0] = (tex._frame.x + margin + offset) / texBase.width, frame[1] = (tex._frame.y + margin + offset) / texBase.height, frame[2] = (tex._frame.x + tex._frame.width - margin + offset) / texBase.width, frame[3] = (tex._frame.y + tex._frame.height - margin + offset) / texBase.height, this.uClampOffset[0] = offset / texBase.realWidth, this.uClampOffset[1] = offset / texBase.realHeight, this.isSimple = tex._frame.width === texBase.width && tex._frame.height === texBase.height && tex.rotate === 0, !0;
  }
}
exports.TextureMatrix = TextureMatrix;


},{"@pixi/math":169}],123:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), extensions = require("@pixi/extensions"), utils = require("@pixi/utils"), BaseTexture = require("./BaseTexture.js"), GLTexture = require("./GLTexture.js"), mapInternalFormatToSamplerType = require("./utils/mapInternalFormatToSamplerType.js"), mapTypeAndFormatToInternalFormat = require("./utils/mapTypeAndFormatToInternalFormat.js");
class TextureSystem {
  /**
   * @param renderer - The renderer this system works for.
   */
  constructor(renderer) {
    this.renderer = renderer, this.boundTextures = [], this.currentLocation = -1, this.managedTextures = [], this._unknownBoundTextures = !1, this.unknownTexture = new BaseTexture.BaseTexture(), this.hasIntegerTextures = !1;
  }
  /** Sets up the renderer context and necessary buffers. */
  contextChange() {
    const gl = this.gl = this.renderer.gl;
    this.CONTEXT_UID = this.renderer.CONTEXT_UID, this.webGLVersion = this.renderer.context.webGLVersion, this.internalFormats = mapTypeAndFormatToInternalFormat.mapTypeAndFormatToInternalFormat(gl), this.samplerTypes = mapInternalFormatToSamplerType.mapInternalFormatToSamplerType(gl);
    const maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    this.boundTextures.length = maxTextures;
    for (let i = 0; i < maxTextures; i++)
      this.boundTextures[i] = null;
    this.emptyTextures = {};
    const emptyTexture2D = new GLTexture.GLTexture(gl.createTexture());
    gl.bindTexture(gl.TEXTURE_2D, emptyTexture2D.texture), gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4)), this.emptyTextures[gl.TEXTURE_2D] = emptyTexture2D, this.emptyTextures[gl.TEXTURE_CUBE_MAP] = new GLTexture.GLTexture(gl.createTexture()), gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.emptyTextures[gl.TEXTURE_CUBE_MAP].texture);
    for (let i = 0; i < 6; i++)
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR), gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    for (let i = 0; i < this.boundTextures.length; i++)
      this.bind(null, i);
  }
  /**
   * Bind a texture to a specific location
   *
   * If you want to unbind something, please use `unbind(texture)` instead of `bind(null, textureLocation)`
   * @param texture - Texture to bind
   * @param [location=0] - Location to bind at
   */
  bind(texture, location = 0) {
    const { gl } = this;
    if (texture = texture?.castToBaseTexture(), texture?.valid && !texture.parentTextureArray) {
      texture.touched = this.renderer.textureGC.count;
      const glTexture = texture._glTextures[this.CONTEXT_UID] || this.initTexture(texture);
      this.boundTextures[location] !== texture && (this.currentLocation !== location && (this.currentLocation = location, gl.activeTexture(gl.TEXTURE0 + location)), gl.bindTexture(texture.target, glTexture.texture)), glTexture.dirtyId !== texture.dirtyId ? (this.currentLocation !== location && (this.currentLocation = location, gl.activeTexture(gl.TEXTURE0 + location)), this.updateTexture(texture)) : glTexture.dirtyStyleId !== texture.dirtyStyleId && this.updateTextureStyle(texture), this.boundTextures[location] = texture;
    } else
      this.currentLocation !== location && (this.currentLocation = location, gl.activeTexture(gl.TEXTURE0 + location)), gl.bindTexture(gl.TEXTURE_2D, this.emptyTextures[gl.TEXTURE_2D].texture), this.boundTextures[location] = null;
  }
  /** Resets texture location and bound textures Actual `bind(null, i)` calls will be performed at next `unbind()` call */
  reset() {
    this._unknownBoundTextures = !0, this.hasIntegerTextures = !1, this.currentLocation = -1;
    for (let i = 0; i < this.boundTextures.length; i++)
      this.boundTextures[i] = this.unknownTexture;
  }
  /**
   * Unbind a texture.
   * @param texture - Texture to bind
   */
  unbind(texture) {
    const { gl, boundTextures } = this;
    if (this._unknownBoundTextures) {
      this._unknownBoundTextures = !1;
      for (let i = 0; i < boundTextures.length; i++)
        boundTextures[i] === this.unknownTexture && this.bind(null, i);
    }
    for (let i = 0; i < boundTextures.length; i++)
      boundTextures[i] === texture && (this.currentLocation !== i && (gl.activeTexture(gl.TEXTURE0 + i), this.currentLocation = i), gl.bindTexture(texture.target, this.emptyTextures[texture.target].texture), boundTextures[i] = null);
  }
  /**
   * Ensures that current boundTextures all have FLOAT sampler type,
   * see {@link PIXI.SAMPLER_TYPES} for explanation.
   * @param maxTextures - number of locations to check
   */
  ensureSamplerType(maxTextures) {
    const { boundTextures, hasIntegerTextures, CONTEXT_UID } = this;
    if (hasIntegerTextures)
      for (let i = maxTextures - 1; i >= 0; --i) {
        const tex = boundTextures[i];
        tex && tex._glTextures[CONTEXT_UID].samplerType !== constants.SAMPLER_TYPES.FLOAT && this.renderer.texture.unbind(tex);
      }
  }
  /**
   * Initialize a texture
   * @private
   * @param texture - Texture to initialize
   */
  initTexture(texture) {
    const glTexture = new GLTexture.GLTexture(this.gl.createTexture());
    return glTexture.dirtyId = -1, texture._glTextures[this.CONTEXT_UID] = glTexture, this.managedTextures.push(texture), texture.on("dispose", this.destroyTexture, this), glTexture;
  }
  initTextureType(texture, glTexture) {
    glTexture.internalFormat = this.internalFormats[texture.type]?.[texture.format] ?? texture.format, glTexture.samplerType = this.samplerTypes[glTexture.internalFormat] ?? constants.SAMPLER_TYPES.FLOAT, this.webGLVersion === 2 && texture.type === constants.TYPES.HALF_FLOAT ? glTexture.type = this.gl.HALF_FLOAT : glTexture.type = texture.type;
  }
  /**
   * Update a texture
   * @private
   * @param {PIXI.BaseTexture} texture - Texture to initialize
   */
  updateTexture(texture) {
    const glTexture = texture._glTextures[this.CONTEXT_UID];
    if (!glTexture)
      return;
    const renderer = this.renderer;
    if (this.initTextureType(texture, glTexture), texture.resource?.upload(renderer, texture, glTexture))
      glTexture.samplerType !== constants.SAMPLER_TYPES.FLOAT && (this.hasIntegerTextures = !0);
    else {
      const width = texture.realWidth, height = texture.realHeight, gl = renderer.gl;
      (glTexture.width !== width || glTexture.height !== height || glTexture.dirtyId < 0) && (glTexture.width = width, glTexture.height = height, gl.texImage2D(
        texture.target,
        0,
        glTexture.internalFormat,
        width,
        height,
        0,
        texture.format,
        glTexture.type,
        null
      ));
    }
    texture.dirtyStyleId !== glTexture.dirtyStyleId && this.updateTextureStyle(texture), glTexture.dirtyId = texture.dirtyId;
  }
  /**
   * Deletes the texture from WebGL
   * @private
   * @param texture - the texture to destroy
   * @param [skipRemove=false] - Whether to skip removing the texture from the TextureManager.
   */
  destroyTexture(texture, skipRemove) {
    const { gl } = this;
    if (texture = texture.castToBaseTexture(), texture._glTextures[this.CONTEXT_UID] && (this.unbind(texture), gl.deleteTexture(texture._glTextures[this.CONTEXT_UID].texture), texture.off("dispose", this.destroyTexture, this), delete texture._glTextures[this.CONTEXT_UID], !skipRemove)) {
      const i = this.managedTextures.indexOf(texture);
      i !== -1 && utils.removeItems(this.managedTextures, i, 1);
    }
  }
  /**
   * Update texture style such as mipmap flag
   * @private
   * @param {PIXI.BaseTexture} texture - Texture to update
   */
  updateTextureStyle(texture) {
    const glTexture = texture._glTextures[this.CONTEXT_UID];
    glTexture && ((texture.mipmap === constants.MIPMAP_MODES.POW2 || this.webGLVersion !== 2) && !texture.isPowerOfTwo ? glTexture.mipmap = !1 : glTexture.mipmap = texture.mipmap >= 1, this.webGLVersion !== 2 && !texture.isPowerOfTwo ? glTexture.wrapMode = constants.WRAP_MODES.CLAMP : glTexture.wrapMode = texture.wrapMode, texture.resource?.style(this.renderer, texture, glTexture) || this.setStyle(texture, glTexture), glTexture.dirtyStyleId = texture.dirtyStyleId);
  }
  /**
   * Set style for texture
   * @private
   * @param texture - Texture to update
   * @param glTexture
   */
  setStyle(texture, glTexture) {
    const gl = this.gl;
    if (glTexture.mipmap && texture.mipmap !== constants.MIPMAP_MODES.ON_MANUAL && gl.generateMipmap(texture.target), gl.texParameteri(texture.target, gl.TEXTURE_WRAP_S, glTexture.wrapMode), gl.texParameteri(texture.target, gl.TEXTURE_WRAP_T, glTexture.wrapMode), glTexture.mipmap) {
      gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, texture.scaleMode === constants.SCALE_MODES.LINEAR ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST_MIPMAP_NEAREST);
      const anisotropicExt = this.renderer.context.extensions.anisotropicFiltering;
      if (anisotropicExt && texture.anisotropicLevel > 0 && texture.scaleMode === constants.SCALE_MODES.LINEAR) {
        const level = Math.min(texture.anisotropicLevel, gl.getParameter(anisotropicExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT));
        gl.texParameterf(texture.target, anisotropicExt.TEXTURE_MAX_ANISOTROPY_EXT, level);
      }
    } else
      gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, texture.scaleMode === constants.SCALE_MODES.LINEAR ? gl.LINEAR : gl.NEAREST);
    gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, texture.scaleMode === constants.SCALE_MODES.LINEAR ? gl.LINEAR : gl.NEAREST);
  }
  destroy() {
    this.renderer = null;
  }
}
TextureSystem.extension = {
  type: extensions.ExtensionType.RendererSystem,
  name: "texture"
};
extensions.extensions.add(TextureSystem);
exports.TextureSystem = TextureSystem;


},{"./BaseTexture.js":118,"./GLTexture.js":119,"./utils/mapInternalFormatToSamplerType.js":138,"./utils/mapTypeAndFormatToInternalFormat.js":139,"@pixi/constants":31,"@pixi/extensions":160,"@pixi/utils":202}],124:[function(require,module,exports){
"use strict";
var math = require("@pixi/math");
class TextureUvs {
  constructor() {
    this.x0 = 0, this.y0 = 0, this.x1 = 1, this.y1 = 0, this.x2 = 1, this.y2 = 1, this.x3 = 0, this.y3 = 1, this.uvsFloat32 = new Float32Array(8);
  }
  /**
   * Sets the texture Uvs based on the given frame information.
   * @protected
   * @param frame - The frame of the texture
   * @param baseFrame - The base frame of the texture
   * @param rotate - Rotation of frame, see {@link PIXI.groupD8}
   */
  set(frame, baseFrame, rotate) {
    const tw = baseFrame.width, th = baseFrame.height;
    if (rotate) {
      const w2 = frame.width / 2 / tw, h2 = frame.height / 2 / th, cX = frame.x / tw + w2, cY = frame.y / th + h2;
      rotate = math.groupD8.add(rotate, math.groupD8.NW), this.x0 = cX + w2 * math.groupD8.uX(rotate), this.y0 = cY + h2 * math.groupD8.uY(rotate), rotate = math.groupD8.add(rotate, 2), this.x1 = cX + w2 * math.groupD8.uX(rotate), this.y1 = cY + h2 * math.groupD8.uY(rotate), rotate = math.groupD8.add(rotate, 2), this.x2 = cX + w2 * math.groupD8.uX(rotate), this.y2 = cY + h2 * math.groupD8.uY(rotate), rotate = math.groupD8.add(rotate, 2), this.x3 = cX + w2 * math.groupD8.uX(rotate), this.y3 = cY + h2 * math.groupD8.uY(rotate);
    } else
      this.x0 = frame.x / tw, this.y0 = frame.y / th, this.x1 = (frame.x + frame.width) / tw, this.y1 = frame.y / th, this.x2 = (frame.x + frame.width) / tw, this.y2 = (frame.y + frame.height) / th, this.x3 = frame.x / tw, this.y3 = (frame.y + frame.height) / th;
    this.uvsFloat32[0] = this.x0, this.uvsFloat32[1] = this.y0, this.uvsFloat32[2] = this.x1, this.uvsFloat32[3] = this.y1, this.uvsFloat32[4] = this.x2, this.uvsFloat32[5] = this.y2, this.uvsFloat32[6] = this.x3, this.uvsFloat32[7] = this.y3;
  }
}
TextureUvs.prototype.toString = function() {
  return `[@pixi/core:TextureUvs x0=${this.x0} y0=${this.y0} x1=${this.x1} y1=${this.y1} x2=${this.x2} y2=${this.y2} x3=${this.x3} y3=${this.y3}]`;
};
exports.TextureUvs = TextureUvs;


},{"@pixi/math":169}],125:[function(require,module,exports){
"use strict";
var BaseTexture = require("../BaseTexture.js"), autoDetectResource = require("./autoDetectResource.js"), Resource = require("./Resource.js");
class AbstractMultiResource extends Resource.Resource {
  /**
   * @param length
   * @param options - Options to for Resource constructor
   * @param {number} [options.width] - Width of the resource
   * @param {number} [options.height] - Height of the resource
   */
  constructor(length, options) {
    const { width, height } = options || {};
    super(width, height), this.items = [], this.itemDirtyIds = [];
    for (let i = 0; i < length; i++) {
      const partTexture = new BaseTexture.BaseTexture();
      this.items.push(partTexture), this.itemDirtyIds.push(-2);
    }
    this.length = length, this._load = null, this.baseTexture = null;
  }
  /**
   * Used from ArrayResource and CubeResource constructors.
   * @param resources - Can be resources, image elements, canvas, etc. ,
   *  length should be same as constructor length
   * @param options - Detect options for resources
   */
  initFromArray(resources, options) {
    for (let i = 0; i < this.length; i++)
      resources[i] && (resources[i].castToBaseTexture ? this.addBaseTextureAt(resources[i].castToBaseTexture(), i) : resources[i] instanceof Resource.Resource ? this.addResourceAt(resources[i], i) : this.addResourceAt(autoDetectResource.autoDetectResource(resources[i], options), i));
  }
  /** Destroy this BaseImageResource. */
  dispose() {
    for (let i = 0, len = this.length; i < len; i++)
      this.items[i].destroy();
    this.items = null, this.itemDirtyIds = null, this._load = null;
  }
  /**
   * Set a resource by ID
   * @param resource
   * @param index - Zero-based index of resource to set
   * @returns - Instance for chaining
   */
  addResourceAt(resource, index) {
    if (!this.items[index])
      throw new Error(`Index ${index} is out of bounds`);
    return resource.valid && !this.valid && this.resize(resource.width, resource.height), this.items[index].setResource(resource), this;
  }
  /**
   * Set the parent base texture.
   * @param baseTexture
   */
  bind(baseTexture) {
    if (this.baseTexture !== null)
      throw new Error("Only one base texture per TextureArray is allowed");
    super.bind(baseTexture);
    for (let i = 0; i < this.length; i++)
      this.items[i].parentTextureArray = baseTexture, this.items[i].on("update", baseTexture.update, baseTexture);
  }
  /**
   * Unset the parent base texture.
   * @param baseTexture
   */
  unbind(baseTexture) {
    super.unbind(baseTexture);
    for (let i = 0; i < this.length; i++)
      this.items[i].parentTextureArray = null, this.items[i].off("update", baseTexture.update, baseTexture);
  }
  /**
   * Load all the resources simultaneously
   * @returns - When load is resolved
   */
  load() {
    if (this._load)
      return this._load;
    const promises = this.items.map((item) => item.resource).filter((item) => item).map((item) => item.load());
    return this._load = Promise.all(promises).then(
      () => {
        const { realWidth, realHeight } = this.items[0];
        return this.resize(realWidth, realHeight), this.update(), Promise.resolve(this);
      }
    ), this._load;
  }
}
exports.AbstractMultiResource = AbstractMultiResource;


},{"../BaseTexture.js":118,"./Resource.js":133,"./autoDetectResource.js":136}],126:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), AbstractMultiResource = require("./AbstractMultiResource.js");
class ArrayResource extends AbstractMultiResource.AbstractMultiResource {
  /**
   * @param source - Number of items in array or the collection
   *        of image URLs to use. Can also be resources, image elements, canvas, etc.
   * @param options - Options to apply to {@link PIXI.autoDetectResource}
   * @param {number} [options.width] - Width of the resource
   * @param {number} [options.height] - Height of the resource
   */
  constructor(source, options) {
    const { width, height } = options || {};
    let urls, length;
    Array.isArray(source) ? (urls = source, length = source.length) : length = source, super(length, { width, height }), urls && this.initFromArray(urls, options);
  }
  /**
   * Set a baseTexture by ID,
   * ArrayResource just takes resource from it, nothing more
   * @param baseTexture
   * @param index - Zero-based index of resource to set
   * @returns - Instance for chaining
   */
  addBaseTextureAt(baseTexture, index) {
    if (baseTexture.resource)
      this.addResourceAt(baseTexture.resource, index);
    else
      throw new Error("ArrayResource does not support RenderTexture");
    return this;
  }
  /**
   * Add binding
   * @param baseTexture
   */
  bind(baseTexture) {
    super.bind(baseTexture), baseTexture.target = constants.TARGETS.TEXTURE_2D_ARRAY;
  }
  /**
   * Upload the resources to the GPU.
   * @param renderer
   * @param texture
   * @param glTexture
   * @returns - whether texture was uploaded
   */
  upload(renderer, texture, glTexture) {
    const { length, itemDirtyIds, items } = this, { gl } = renderer;
    glTexture.dirtyId < 0 && gl.texImage3D(
      gl.TEXTURE_2D_ARRAY,
      0,
      glTexture.internalFormat,
      this._width,
      this._height,
      length,
      0,
      texture.format,
      glTexture.type,
      null
    );
    for (let i = 0; i < length; i++) {
      const item = items[i];
      itemDirtyIds[i] < item.dirtyId && (itemDirtyIds[i] = item.dirtyId, item.valid && gl.texSubImage3D(
        gl.TEXTURE_2D_ARRAY,
        0,
        0,
        // xoffset
        0,
        // yoffset
        i,
        // zoffset
        item.resource.width,
        item.resource.height,
        1,
        texture.format,
        glTexture.type,
        item.resource.source
      ));
    }
    return !0;
  }
}
exports.ArrayResource = ArrayResource;


},{"./AbstractMultiResource.js":125,"@pixi/constants":31}],127:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), utils = require("@pixi/utils"), Resource = require("./Resource.js");
class BaseImageResource extends Resource.Resource {
  /**
   * @param {HTMLImageElement|HTMLVideoElement|ImageBitmap|PIXI.ICanvas} source
   */
  constructor(source) {
    const sourceAny = source, width = sourceAny.naturalWidth || sourceAny.videoWidth || sourceAny.width, height = sourceAny.naturalHeight || sourceAny.videoHeight || sourceAny.height;
    super(width, height), this.source = source, this.noSubImage = !1;
  }
  /**
   * Set cross origin based detecting the url and the crossorigin
   * @param element - Element to apply crossOrigin
   * @param url - URL to check
   * @param crossorigin - Cross origin value to use
   */
  static crossOrigin(element, url, crossorigin) {
    crossorigin === void 0 && !url.startsWith("data:") ? element.crossOrigin = utils.determineCrossOrigin(url) : crossorigin !== !1 && (element.crossOrigin = typeof crossorigin == "string" ? crossorigin : "anonymous");
  }
  /**
   * Upload the texture to the GPU.
   * @param renderer - Upload to the renderer
   * @param baseTexture - Reference to parent texture
   * @param glTexture
   * @param {HTMLImageElement|HTMLVideoElement|ImageBitmap|PIXI.ICanvas} [source] - (optional)
   * @returns - true is success
   */
  upload(renderer, baseTexture, glTexture, source) {
    const gl = renderer.gl, width = baseTexture.realWidth, height = baseTexture.realHeight;
    if (source = source || this.source, typeof HTMLImageElement < "u" && source instanceof HTMLImageElement) {
      if (!source.complete || source.naturalWidth === 0)
        return !1;
    } else if (typeof HTMLVideoElement < "u" && source instanceof HTMLVideoElement && source.readyState <= 1)
      return !1;
    return gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.alphaMode === constants.ALPHA_MODES.UNPACK), !this.noSubImage && baseTexture.target === gl.TEXTURE_2D && glTexture.width === width && glTexture.height === height ? gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, baseTexture.format, glTexture.type, source) : (glTexture.width = width, glTexture.height = height, gl.texImage2D(baseTexture.target, 0, glTexture.internalFormat, baseTexture.format, glTexture.type, source)), !0;
  }
  /**
   * Checks if source width/height was changed, resize can cause extra baseTexture update.
   * Triggers one update in any case.
   */
  update() {
    if (this.destroyed)
      return;
    const source = this.source, width = source.naturalWidth || source.videoWidth || source.width, height = source.naturalHeight || source.videoHeight || source.height;
    this.resize(width, height), super.update();
  }
  /** Destroy this {@link PIXI.BaseImageResource} */
  dispose() {
    this.source = null;
  }
}
exports.BaseImageResource = BaseImageResource;


},{"./Resource.js":133,"@pixi/constants":31,"@pixi/utils":202}],128:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), Resource = require("./Resource.js");
class BufferResource extends Resource.Resource {
  /**
   * @param source - Source buffer
   * @param options - Options
   * @param {number} options.width - Width of the texture
   * @param {number} options.height - Height of the texture
   * @param {1|2|4|8} [options.unpackAlignment=4] - The alignment of the pixel rows.
   */
  constructor(source, options) {
    const { width, height } = options || {};
    if (!width || !height)
      throw new Error("BufferResource width or height invalid");
    super(width, height), this.data = source, this.unpackAlignment = options.unpackAlignment ?? 4;
  }
  /**
   * Upload the texture to the GPU.
   * @param renderer - Upload to the renderer
   * @param baseTexture - Reference to parent texture
   * @param glTexture - glTexture
   * @returns - true is success
   */
  upload(renderer, baseTexture, glTexture) {
    const gl = renderer.gl;
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, this.unpackAlignment), gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.alphaMode === constants.ALPHA_MODES.UNPACK);
    const width = baseTexture.realWidth, height = baseTexture.realHeight;
    return glTexture.width === width && glTexture.height === height ? gl.texSubImage2D(
      baseTexture.target,
      0,
      0,
      0,
      width,
      height,
      baseTexture.format,
      glTexture.type,
      this.data
    ) : (glTexture.width = width, glTexture.height = height, gl.texImage2D(
      baseTexture.target,
      0,
      glTexture.internalFormat,
      width,
      height,
      0,
      baseTexture.format,
      glTexture.type,
      this.data
    )), !0;
  }
  /** Destroy and don't use after this. */
  dispose() {
    this.data = null;
  }
  /**
   * Used to auto-detect the type of resource.
   * @param {*} source - The source object
   * @returns {boolean} `true` if buffer source
   */
  static test(source) {
    return source === null || source instanceof Int8Array || source instanceof Uint8Array || source instanceof Uint8ClampedArray || source instanceof Int16Array || source instanceof Uint16Array || source instanceof Int32Array || source instanceof Uint32Array || source instanceof Float32Array;
  }
}
exports.BufferResource = BufferResource;


},{"./Resource.js":133,"@pixi/constants":31}],129:[function(require,module,exports){
"use strict";
var BaseImageResource = require("./BaseImageResource.js");
class CanvasResource extends BaseImageResource.BaseImageResource {
  /**
   * @param source - Canvas element to use
   */
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(source) {
    super(source);
  }
  /**
   * Used to auto-detect the type of resource.
   * @param {*} source - The source object
   * @returns {boolean} `true` if source is HTMLCanvasElement or OffscreenCanvas
   */
  static test(source) {
    const { OffscreenCanvas } = globalThis;
    return OffscreenCanvas && source instanceof OffscreenCanvas ? !0 : globalThis.HTMLCanvasElement && source instanceof HTMLCanvasElement;
  }
}
exports.CanvasResource = CanvasResource;


},{"./BaseImageResource.js":127}],130:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), AbstractMultiResource = require("./AbstractMultiResource.js");
const _CubeResource = class _CubeResource2 extends AbstractMultiResource.AbstractMultiResource {
  /**
   * @param {Array<string|PIXI.Resource>} [source] - Collection of URLs or resources
   *        to use as the sides of the cube.
   * @param options - ImageResource options
   * @param {number} [options.width] - Width of resource
   * @param {number} [options.height] - Height of resource
   * @param {number} [options.autoLoad=true] - Whether to auto-load resources
   * @param {number} [options.linkBaseTexture=true] - In case BaseTextures are supplied,
   *   whether to copy them or use
   */
  constructor(source, options) {
    const { width, height, autoLoad, linkBaseTexture } = options || {};
    if (source && source.length !== _CubeResource2.SIDES)
      throw new Error(`Invalid length. Got ${source.length}, expected 6`);
    super(6, { width, height });
    for (let i = 0; i < _CubeResource2.SIDES; i++)
      this.items[i].target = constants.TARGETS.TEXTURE_CUBE_MAP_POSITIVE_X + i;
    this.linkBaseTexture = linkBaseTexture !== !1, source && this.initFromArray(source, options), autoLoad !== !1 && this.load();
  }
  /**
   * Add binding.
   * @param baseTexture - parent base texture
   */
  bind(baseTexture) {
    super.bind(baseTexture), baseTexture.target = constants.TARGETS.TEXTURE_CUBE_MAP;
  }
  addBaseTextureAt(baseTexture, index, linkBaseTexture) {
    if (linkBaseTexture === void 0 && (linkBaseTexture = this.linkBaseTexture), !this.items[index])
      throw new Error(`Index ${index} is out of bounds`);
    if (!this.linkBaseTexture || baseTexture.parentTextureArray || Object.keys(baseTexture._glTextures).length > 0)
      if (baseTexture.resource)
        this.addResourceAt(baseTexture.resource, index);
      else
        throw new Error("CubeResource does not support copying of renderTexture.");
    else
      baseTexture.target = constants.TARGETS.TEXTURE_CUBE_MAP_POSITIVE_X + index, baseTexture.parentTextureArray = this.baseTexture, this.items[index] = baseTexture;
    return baseTexture.valid && !this.valid && this.resize(baseTexture.realWidth, baseTexture.realHeight), this.items[index] = baseTexture, this;
  }
  /**
   * Upload the resource
   * @param renderer
   * @param _baseTexture
   * @param glTexture
   * @returns {boolean} true is success
   */
  upload(renderer, _baseTexture, glTexture) {
    const dirty = this.itemDirtyIds;
    for (let i = 0; i < _CubeResource2.SIDES; i++) {
      const side = this.items[i];
      (dirty[i] < side.dirtyId || glTexture.dirtyId < _baseTexture.dirtyId) && (side.valid && side.resource ? (side.resource.upload(renderer, side, glTexture), dirty[i] = side.dirtyId) : dirty[i] < -1 && (renderer.gl.texImage2D(
        side.target,
        0,
        glTexture.internalFormat,
        _baseTexture.realWidth,
        _baseTexture.realHeight,
        0,
        _baseTexture.format,
        glTexture.type,
        null
      ), dirty[i] = -1));
    }
    return !0;
  }
  /**
   * Used to auto-detect the type of resource.
   * @param {*} source - The source object
   * @returns {boolean} `true` if source is an array of 6 elements
   */
  static test(source) {
    return Array.isArray(source) && source.length === _CubeResource2.SIDES;
  }
};
_CubeResource.SIDES = 6;
let CubeResource = _CubeResource;
exports.CubeResource = CubeResource;


},{"./AbstractMultiResource.js":125,"@pixi/constants":31}],131:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), settings = require("@pixi/settings"), BaseImageResource = require("./BaseImageResource.js");
class ImageBitmapResource extends BaseImageResource.BaseImageResource {
  /**
   * @param source - ImageBitmap or URL to use.
   * @param options - Options to use.
   */
  constructor(source, options) {
    options = options || {};
    let baseSource, url, ownsImageBitmap;
    typeof source == "string" ? (baseSource = ImageBitmapResource.EMPTY, url = source, ownsImageBitmap = !0) : (baseSource = source, url = null, ownsImageBitmap = !1), super(baseSource), this.url = url, this.crossOrigin = options.crossOrigin ?? !0, this.alphaMode = typeof options.alphaMode == "number" ? options.alphaMode : null, this.ownsImageBitmap = options.ownsImageBitmap ?? ownsImageBitmap, this._load = null, options.autoLoad !== !1 && this.load();
  }
  load() {
    return this._load ? this._load : (this._load = new Promise(async (resolve, reject) => {
      if (this.url === null) {
        resolve(this);
        return;
      }
      try {
        const response = await settings.settings.ADAPTER.fetch(this.url, {
          mode: this.crossOrigin ? "cors" : "no-cors"
        });
        if (this.destroyed)
          return;
        const imageBlob = await response.blob();
        if (this.destroyed)
          return;
        const imageBitmap = await createImageBitmap(imageBlob, {
          premultiplyAlpha: this.alphaMode === null || this.alphaMode === constants.ALPHA_MODES.UNPACK ? "premultiply" : "none"
        });
        if (this.destroyed) {
          imageBitmap.close();
          return;
        }
        this.source = imageBitmap, this.update(), resolve(this);
      } catch (e) {
        if (this.destroyed)
          return;
        reject(e), this.onError.emit(e);
      }
    }), this._load);
  }
  /**
   * Upload the image bitmap resource to GPU.
   * @param renderer - Renderer to upload to
   * @param baseTexture - BaseTexture for this resource
   * @param glTexture - GLTexture to use
   * @returns {boolean} true is success
   */
  upload(renderer, baseTexture, glTexture) {
    return this.source instanceof ImageBitmap ? (typeof this.alphaMode == "number" && (baseTexture.alphaMode = this.alphaMode), super.upload(renderer, baseTexture, glTexture)) : (this.load(), !1);
  }
  /** Destroys this resource. */
  dispose() {
    this.ownsImageBitmap && this.source instanceof ImageBitmap && this.source.close(), super.dispose(), this._load = null;
  }
  /**
   * Used to auto-detect the type of resource.
   * @param {*} source - The source object
   * @returns {boolean} `true` if current environment support ImageBitmap, and source is string or ImageBitmap
   */
  static test(source) {
    return !!globalThis.createImageBitmap && typeof ImageBitmap < "u" && (typeof source == "string" || source instanceof ImageBitmap);
  }
  /**
   * ImageBitmap cannot be created synchronously, so a empty placeholder canvas is needed when loading from URLs.
   * Only for internal usage.
   * @returns The cached placeholder canvas.
   */
  static get EMPTY() {
    return ImageBitmapResource._EMPTY = ImageBitmapResource._EMPTY ?? settings.settings.ADAPTER.createCanvas(0, 0), ImageBitmapResource._EMPTY;
  }
}
exports.ImageBitmapResource = ImageBitmapResource;


},{"./BaseImageResource.js":127,"@pixi/constants":31,"@pixi/settings":180}],132:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants"), settings = require("@pixi/settings"), BaseImageResource = require("./BaseImageResource.js");
class ImageResource extends BaseImageResource.BaseImageResource {
  /**
   * @param source - image source or URL
   * @param options
   * @param {boolean} [options.autoLoad=true] - start loading process
   * @param {boolean} [options.createBitmap=PIXI.settings.CREATE_IMAGE_BITMAP] - whether its required to create
   *        a bitmap before upload
   * @param {boolean} [options.crossorigin=true] - Load image using cross origin
   * @param {PIXI.ALPHA_MODES} [options.alphaMode=PIXI.ALPHA_MODES.UNPACK] - Premultiply image alpha in bitmap
   */
  constructor(source, options) {
    if (options = options || {}, typeof source == "string") {
      const imageElement = new Image();
      BaseImageResource.BaseImageResource.crossOrigin(imageElement, source, options.crossorigin), imageElement.src = source, source = imageElement;
    }
    super(source), !source.complete && this._width && this._height && (this._width = 0, this._height = 0), this.url = source.src, this._process = null, this.preserveBitmap = !1, this.createBitmap = (options.createBitmap ?? settings.settings.CREATE_IMAGE_BITMAP) && !!globalThis.createImageBitmap, this.alphaMode = typeof options.alphaMode == "number" ? options.alphaMode : null, this.bitmap = null, this._load = null, options.autoLoad !== !1 && this.load();
  }
  /**
   * Returns a promise when image will be loaded and processed.
   * @param createBitmap - whether process image into bitmap
   */
  load(createBitmap) {
    return this._load ? this._load : (createBitmap !== void 0 && (this.createBitmap = createBitmap), this._load = new Promise((resolve, reject) => {
      const source = this.source;
      this.url = source.src;
      const completed = () => {
        this.destroyed || (source.onload = null, source.onerror = null, this.update(), this._load = null, this.createBitmap ? resolve(this.process()) : resolve(this));
      };
      source.complete && source.src ? completed() : (source.onload = completed, source.onerror = (event) => {
        reject(event), this.onError.emit(event);
      });
    }), this._load);
  }
  /**
   * Called when we need to convert image into BitmapImage.
   * Can be called multiple times, real promise is cached inside.
   * @returns - Cached promise to fill that bitmap
   */
  process() {
    const source = this.source;
    if (this._process !== null)
      return this._process;
    if (this.bitmap !== null || !globalThis.createImageBitmap)
      return Promise.resolve(this);
    const createImageBitmap = globalThis.createImageBitmap, cors = !source.crossOrigin || source.crossOrigin === "anonymous";
    return this._process = fetch(
      source.src,
      {
        mode: cors ? "cors" : "no-cors"
      }
    ).then((r) => r.blob()).then((blob) => createImageBitmap(
      blob,
      0,
      0,
      source.width,
      source.height,
      {
        premultiplyAlpha: this.alphaMode === null || this.alphaMode === constants.ALPHA_MODES.UNPACK ? "premultiply" : "none"
      }
    )).then((bitmap) => this.destroyed ? Promise.reject() : (this.bitmap = bitmap, this.update(), this._process = null, Promise.resolve(this))), this._process;
  }
  /**
   * Upload the image resource to GPU.
   * @param renderer - Renderer to upload to
   * @param baseTexture - BaseTexture for this resource
   * @param glTexture - GLTexture to use
   * @returns {boolean} true is success
   */
  upload(renderer, baseTexture, glTexture) {
    if (typeof this.alphaMode == "number" && (baseTexture.alphaMode = this.alphaMode), !this.createBitmap)
      return super.upload(renderer, baseTexture, glTexture);
    if (!this.bitmap && (this.process(), !this.bitmap))
      return !1;
    if (super.upload(renderer, baseTexture, glTexture, this.bitmap), !this.preserveBitmap) {
      let flag = !0;
      const glTextures = baseTexture._glTextures;
      for (const key in glTextures) {
        const otherTex = glTextures[key];
        if (otherTex !== glTexture && otherTex.dirtyId !== baseTexture.dirtyId) {
          flag = !1;
          break;
        }
      }
      flag && (this.bitmap.close && this.bitmap.close(), this.bitmap = null);
    }
    return !0;
  }
  /** Destroys this resource. */
  dispose() {
    this.source.onload = null, this.source.onerror = null, super.dispose(), this.bitmap && (this.bitmap.close(), this.bitmap = null), this._process = null, this._load = null;
  }
  /**
   * Used to auto-detect the type of resource.
   * @param {*} source - The source object
   * @returns {boolean} `true` if current environment support HTMLImageElement, and source is string or HTMLImageElement
   */
  static test(source) {
    return typeof HTMLImageElement < "u" && (typeof source == "string" || source instanceof HTMLImageElement);
  }
}
exports.ImageResource = ImageResource;


},{"./BaseImageResource.js":127,"@pixi/constants":31,"@pixi/settings":180}],133:[function(require,module,exports){
"use strict";
var runner = require("@pixi/runner");
class Resource {
  /**
   * @param width - Width of the resource
   * @param height - Height of the resource
   */
  constructor(width = 0, height = 0) {
    this._width = width, this._height = height, this.destroyed = !1, this.internal = !1, this.onResize = new runner.Runner("setRealSize"), this.onUpdate = new runner.Runner("update"), this.onError = new runner.Runner("onError");
  }
  /**
   * Bind to a parent BaseTexture
   * @param baseTexture - Parent texture
   */
  bind(baseTexture) {
    this.onResize.add(baseTexture), this.onUpdate.add(baseTexture), this.onError.add(baseTexture), (this._width || this._height) && this.onResize.emit(this._width, this._height);
  }
  /**
   * Unbind to a parent BaseTexture
   * @param baseTexture - Parent texture
   */
  unbind(baseTexture) {
    this.onResize.remove(baseTexture), this.onUpdate.remove(baseTexture), this.onError.remove(baseTexture);
  }
  /**
   * Trigger a resize event
   * @param width - X dimension
   * @param height - Y dimension
   */
  resize(width, height) {
    (width !== this._width || height !== this._height) && (this._width = width, this._height = height, this.onResize.emit(width, height));
  }
  /**
   * Has been validated
   * @readonly
   */
  get valid() {
    return !!this._width && !!this._height;
  }
  /** Has been updated trigger event. */
  update() {
    this.destroyed || this.onUpdate.emit();
  }
  /**
   * This can be overridden to start preloading a resource
   * or do any other prepare step.
   * @protected
   * @returns Handle the validate event
   */
  load() {
    return Promise.resolve(this);
  }
  /**
   * The width of the resource.
   * @readonly
   */
  get width() {
    return this._width;
  }
  /**
   * The height of the resource.
   * @readonly
   */
  get height() {
    return this._height;
  }
  /**
   * Set the style, optional to override
   * @param _renderer - yeah, renderer!
   * @param _baseTexture - the texture
   * @param _glTexture - texture instance for this webgl context
   * @returns - `true` is success
   */
  style(_renderer, _baseTexture, _glTexture) {
    return !1;
  }
  /** Clean up anything, this happens when destroying is ready. */
  dispose() {
  }
  /**
   * Call when destroying resource, unbind any BaseTexture object
   * before calling this method, as reference counts are maintained
   * internally.
   */
  destroy() {
    this.destroyed || (this.destroyed = !0, this.dispose(), this.onError.removeAll(), this.onError = null, this.onResize.removeAll(), this.onResize = null, this.onUpdate.removeAll(), this.onUpdate = null);
  }
  /**
   * Abstract, used to auto-detect resource type.
   * @param {*} _source - The source object
   * @param {string} _extension - The extension of source, if set
   */
  static test(_source, _extension) {
    return !1;
  }
}
exports.Resource = Resource;


},{"@pixi/runner":176}],134:[function(require,module,exports){
"use strict";
var settings = require("@pixi/settings"), utils = require("@pixi/utils"), BaseImageResource = require("./BaseImageResource.js");
const _SVGResource = class _SVGResource2 extends BaseImageResource.BaseImageResource {
  /**
   * @param sourceBase64 - Base64 encoded SVG element or URL for SVG file.
   * @param {object} [options] - Options to use
   * @param {number} [options.scale=1] - Scale to apply to SVG. Overridden by...
   * @param {number} [options.width] - Rasterize SVG this wide. Aspect ratio preserved if height not specified.
   * @param {number} [options.height] - Rasterize SVG this high. Aspect ratio preserved if width not specified.
   * @param {boolean} [options.autoLoad=true] - Start loading right away.
   */
  constructor(sourceBase64, options) {
    options = options || {}, super(settings.settings.ADAPTER.createCanvas()), this._width = 0, this._height = 0, this.svg = sourceBase64, this.scale = options.scale || 1, this._overrideWidth = options.width, this._overrideHeight = options.height, this._resolve = null, this._crossorigin = options.crossorigin, this._load = null, options.autoLoad !== !1 && this.load();
  }
  load() {
    return this._load ? this._load : (this._load = new Promise((resolve) => {
      if (this._resolve = () => {
        this.update(), resolve(this);
      }, _SVGResource2.SVG_XML.test(this.svg.trim())) {
        if (!btoa)
          throw new Error("Your browser doesn't support base64 conversions.");
        this.svg = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(this.svg)))}`;
      }
      this._loadSvg();
    }), this._load);
  }
  /** Loads an SVG image from `imageUrl` or `data URL`. */
  _loadSvg() {
    const tempImage = new Image();
    BaseImageResource.BaseImageResource.crossOrigin(tempImage, this.svg, this._crossorigin), tempImage.src = this.svg, tempImage.onerror = (event) => {
      this._resolve && (tempImage.onerror = null, this.onError.emit(event));
    }, tempImage.onload = () => {
      if (!this._resolve)
        return;
      const svgWidth = tempImage.width, svgHeight = tempImage.height;
      if (!svgWidth || !svgHeight)
        throw new Error("The SVG image must have width and height defined (in pixels), canvas API needs them.");
      let width = svgWidth * this.scale, height = svgHeight * this.scale;
      (this._overrideWidth || this._overrideHeight) && (width = this._overrideWidth || this._overrideHeight / svgHeight * svgWidth, height = this._overrideHeight || this._overrideWidth / svgWidth * svgHeight), width = Math.round(width), height = Math.round(height);
      const canvas = this.source;
      canvas.width = width, canvas.height = height, canvas._pixiId = `canvas_${utils.uid()}`, canvas.getContext("2d").drawImage(tempImage, 0, 0, svgWidth, svgHeight, 0, 0, width, height), this._resolve(), this._resolve = null;
    };
  }
  /**
   * Get size from an svg string using a regular expression.
   * @param svgString - a serialized svg element
   * @returns - image extension
   */
  static getSize(svgString) {
    const sizeMatch = _SVGResource2.SVG_SIZE.exec(svgString), size = {};
    return sizeMatch && (size[sizeMatch[1]] = Math.round(parseFloat(sizeMatch[3])), size[sizeMatch[5]] = Math.round(parseFloat(sizeMatch[7]))), size;
  }
  /** Destroys this texture. */
  dispose() {
    super.dispose(), this._resolve = null, this._crossorigin = null;
  }
  /**
   * Used to auto-detect the type of resource.
   * @param {*} source - The source object
   * @param {string} extension - The extension of source, if set
   * @returns {boolean} - If the source is a SVG source or data file
   */
  static test(source, extension) {
    return extension === "svg" || typeof source == "string" && source.startsWith("data:image/svg+xml") || typeof source == "string" && _SVGResource2.SVG_XML.test(source);
  }
  // eslint-disable-line max-len
};
_SVGResource.SVG_XML = /^(<\?xml[^?]+\?>)?\s*(<!--[^(-->)]*-->)?\s*\<svg/m, /**
* Regular expression for SVG size.
* @example &lt;svg width="100" height="100"&gt;&lt;/svg&gt;
* @readonly
*/
_SVGResource.SVG_SIZE = /<svg[^>]*(?:\s(width|height)=('|")(\d*(?:\.\d+)?)(?:px)?('|"))[^>]*(?:\s(width|height)=('|")(\d*(?:\.\d+)?)(?:px)?('|"))[^>]*>/i;
let SVGResource = _SVGResource;
exports.SVGResource = SVGResource;


},{"./BaseImageResource.js":127,"@pixi/settings":180,"@pixi/utils":202}],135:[function(require,module,exports){
"use strict";
var ticker = require("@pixi/ticker"), BaseImageResource = require("./BaseImageResource.js");
const _VideoResource = class _VideoResource2 extends BaseImageResource.BaseImageResource {
  /**
   * @param {HTMLVideoElement|object|string|Array<string|object>} source - Video element to use.
   * @param {object} [options] - Options to use
   * @param {boolean} [options.autoLoad=true] - Start loading the video immediately
   * @param {boolean} [options.autoPlay=true] - Start playing video immediately
   * @param {number} [options.updateFPS=0] - How many times a second to update the texture from the video.
   * Leave at 0 to update at every render.
   * @param {boolean} [options.crossorigin=true] - Load image using cross origin
   * @param {boolean} [options.loop=false] - Loops the video
   * @param {boolean} [options.muted=false] - Mutes the video audio, useful for autoplay
   * @param {boolean} [options.playsinline=true] - Prevents opening the video on mobile devices
   */
  constructor(source, options) {
    if (options = options || {}, !(source instanceof HTMLVideoElement)) {
      const videoElement = document.createElement("video");
      options.autoLoad !== !1 && videoElement.setAttribute("preload", "auto"), options.playsinline !== !1 && (videoElement.setAttribute("webkit-playsinline", ""), videoElement.setAttribute("playsinline", "")), options.muted === !0 && (videoElement.setAttribute("muted", ""), videoElement.muted = !0), options.loop === !0 && videoElement.setAttribute("loop", ""), options.autoPlay !== !1 && videoElement.setAttribute("autoplay", ""), typeof source == "string" && (source = [source]);
      const firstSrc = source[0].src || source[0];
      BaseImageResource.BaseImageResource.crossOrigin(videoElement, firstSrc, options.crossorigin);
      for (let i = 0; i < source.length; ++i) {
        const sourceElement = document.createElement("source");
        let { src, mime } = source[i];
        if (src = src || source[i], src.startsWith("data:"))
          mime = src.slice(5, src.indexOf(";"));
        else if (!src.startsWith("blob:")) {
          const baseSrc = src.split("?").shift().toLowerCase(), ext = baseSrc.slice(baseSrc.lastIndexOf(".") + 1);
          mime = mime || _VideoResource2.MIME_TYPES[ext] || `video/${ext}`;
        }
        sourceElement.src = src, mime && (sourceElement.type = mime), videoElement.appendChild(sourceElement);
      }
      source = videoElement;
    }
    super(source), this.noSubImage = !0, this._autoUpdate = !0, this._isConnectedToTicker = !1, this._updateFPS = options.updateFPS || 0, this._msToNextUpdate = 0, this.autoPlay = options.autoPlay !== !1, this._videoFrameRequestCallback = this._videoFrameRequestCallback.bind(this), this._videoFrameRequestCallbackHandle = null, this._load = null, this._resolve = null, this._reject = null, this._onCanPlay = this._onCanPlay.bind(this), this._onError = this._onError.bind(this), this._onPlayStart = this._onPlayStart.bind(this), this._onPlayStop = this._onPlayStop.bind(this), this._onSeeked = this._onSeeked.bind(this), options.autoLoad !== !1 && this.load();
  }
  /**
   * Trigger updating of the texture.
   * @param _deltaTime - time delta since last tick
   */
  update(_deltaTime = 0) {
    if (!this.destroyed) {
      if (this._updateFPS) {
        const elapsedMS = ticker.Ticker.shared.elapsedMS * this.source.playbackRate;
        this._msToNextUpdate = Math.floor(this._msToNextUpdate - elapsedMS);
      }
      (!this._updateFPS || this._msToNextUpdate <= 0) && (super.update(
        /* deltaTime*/
      ), this._msToNextUpdate = this._updateFPS ? Math.floor(1e3 / this._updateFPS) : 0);
    }
  }
  _videoFrameRequestCallback() {
    this.update(), this.destroyed ? this._videoFrameRequestCallbackHandle = null : this._videoFrameRequestCallbackHandle = this.source.requestVideoFrameCallback(
      this._videoFrameRequestCallback
    );
  }
  /**
   * Start preloading the video resource.
   * @returns {Promise<void>} Handle the validate event
   */
  load() {
    if (this._load)
      return this._load;
    const source = this.source;
    return (source.readyState === source.HAVE_ENOUGH_DATA || source.readyState === source.HAVE_FUTURE_DATA) && source.width && source.height && (source.complete = !0), source.addEventListener("play", this._onPlayStart), source.addEventListener("pause", this._onPlayStop), source.addEventListener("seeked", this._onSeeked), this._isSourceReady() ? this._onCanPlay() : (source.addEventListener("canplay", this._onCanPlay), source.addEventListener("canplaythrough", this._onCanPlay), source.addEventListener("error", this._onError, !0)), this._load = new Promise((resolve, reject) => {
      this.valid ? resolve(this) : (this._resolve = resolve, this._reject = reject, source.load());
    }), this._load;
  }
  /**
   * Handle video error events.
   * @param event
   */
  _onError(event) {
    this.source.removeEventListener("error", this._onError, !0), this.onError.emit(event), this._reject && (this._reject(event), this._reject = null, this._resolve = null);
  }
  /**
   * Returns true if the underlying source is playing.
   * @returns - True if playing.
   */
  _isSourcePlaying() {
    const source = this.source;
    return !source.paused && !source.ended;
  }
  /**
   * Returns true if the underlying source is ready for playing.
   * @returns - True if ready.
   */
  _isSourceReady() {
    return this.source.readyState > 2;
  }
  /** Runs the update loop when the video is ready to play. */
  _onPlayStart() {
    this.valid || this._onCanPlay(), this._configureAutoUpdate();
  }
  /** Fired when a pause event is triggered, stops the update loop. */
  _onPlayStop() {
    this._configureAutoUpdate();
  }
  /** Fired when the video is completed seeking to the current playback position. */
  _onSeeked() {
    this._autoUpdate && !this._isSourcePlaying() && (this._msToNextUpdate = 0, this.update(), this._msToNextUpdate = 0);
  }
  /** Fired when the video is loaded and ready to play. */
  _onCanPlay() {
    const source = this.source;
    source.removeEventListener("canplay", this._onCanPlay), source.removeEventListener("canplaythrough", this._onCanPlay);
    const valid = this.valid;
    this._msToNextUpdate = 0, this.update(), this._msToNextUpdate = 0, !valid && this._resolve && (this._resolve(this), this._resolve = null, this._reject = null), this._isSourcePlaying() ? this._onPlayStart() : this.autoPlay && source.play();
  }
  /** Destroys this texture. */
  dispose() {
    this._configureAutoUpdate();
    const source = this.source;
    source && (source.removeEventListener("play", this._onPlayStart), source.removeEventListener("pause", this._onPlayStop), source.removeEventListener("seeked", this._onSeeked), source.removeEventListener("canplay", this._onCanPlay), source.removeEventListener("canplaythrough", this._onCanPlay), source.removeEventListener("error", this._onError, !0), source.pause(), source.src = "", source.load()), super.dispose();
  }
  /** Should the base texture automatically update itself, set to true by default. */
  get autoUpdate() {
    return this._autoUpdate;
  }
  set autoUpdate(value) {
    value !== this._autoUpdate && (this._autoUpdate = value, this._configureAutoUpdate());
  }
  /**
   * How many times a second to update the texture from the video. Leave at 0 to update at every render.
   * A lower fps can help performance, as updating the texture at 60fps on a 30ps video may not be efficient.
   */
  get updateFPS() {
    return this._updateFPS;
  }
  set updateFPS(value) {
    value !== this._updateFPS && (this._updateFPS = value, this._configureAutoUpdate());
  }
  _configureAutoUpdate() {
    this._autoUpdate && this._isSourcePlaying() ? !this._updateFPS && this.source.requestVideoFrameCallback ? (this._isConnectedToTicker && (ticker.Ticker.shared.remove(this.update, this), this._isConnectedToTicker = !1, this._msToNextUpdate = 0), this._videoFrameRequestCallbackHandle === null && (this._videoFrameRequestCallbackHandle = this.source.requestVideoFrameCallback(
      this._videoFrameRequestCallback
    ))) : (this._videoFrameRequestCallbackHandle !== null && (this.source.cancelVideoFrameCallback(this._videoFrameRequestCallbackHandle), this._videoFrameRequestCallbackHandle = null), this._isConnectedToTicker || (ticker.Ticker.shared.add(this.update, this), this._isConnectedToTicker = !0, this._msToNextUpdate = 0)) : (this._videoFrameRequestCallbackHandle !== null && (this.source.cancelVideoFrameCallback(this._videoFrameRequestCallbackHandle), this._videoFrameRequestCallbackHandle = null), this._isConnectedToTicker && (ticker.Ticker.shared.remove(this.update, this), this._isConnectedToTicker = !1, this._msToNextUpdate = 0));
  }
  /**
   * Used to auto-detect the type of resource.
   * @param {*} source - The source object
   * @param {string} extension - The extension of source, if set
   * @returns {boolean} `true` if video source
   */
  static test(source, extension) {
    return globalThis.HTMLVideoElement && source instanceof HTMLVideoElement || _VideoResource2.TYPES.includes(extension);
  }
};
_VideoResource.TYPES = ["mp4", "m4v", "webm", "ogg", "ogv", "h264", "avi", "mov"], /**
* Map of video MIME types that can't be directly derived from file extensions.
* @readonly
*/
_VideoResource.MIME_TYPES = {
  ogv: "video/ogg",
  mov: "video/quicktime",
  m4v: "video/mp4"
};
let VideoResource = _VideoResource;
exports.VideoResource = VideoResource;


},{"./BaseImageResource.js":127,"@pixi/ticker":187}],136:[function(require,module,exports){
"use strict";
const INSTALLED = [];
function autoDetectResource(source, options) {
  if (!source)
    return null;
  let extension = "";
  if (typeof source == "string") {
    const result = /\.(\w{3,4})(?:$|\?|#)/i.exec(source);
    result && (extension = result[1].toLowerCase());
  }
  for (let i = INSTALLED.length - 1; i >= 0; --i) {
    const ResourcePlugin = INSTALLED[i];
    if (ResourcePlugin.test && ResourcePlugin.test(source, extension))
      return new ResourcePlugin(source, options);
  }
  throw new Error("Unrecognized source type to auto-detect Resource");
}
exports.INSTALLED = INSTALLED;
exports.autoDetectResource = autoDetectResource;


},{}],137:[function(require,module,exports){
"use strict";
var ArrayResource = require("./ArrayResource.js"), autoDetectResource = require("./autoDetectResource.js"), BufferResource = require("./BufferResource.js"), CanvasResource = require("./CanvasResource.js"), CubeResource = require("./CubeResource.js"), ImageBitmapResource = require("./ImageBitmapResource.js"), ImageResource = require("./ImageResource.js"), SVGResource = require("./SVGResource.js"), VideoResource = require("./VideoResource.js"), BaseImageResource = require("./BaseImageResource.js"), Resource = require("./Resource.js"), AbstractMultiResource = require("./AbstractMultiResource.js");
autoDetectResource.INSTALLED.push(
  ImageBitmapResource.ImageBitmapResource,
  ImageResource.ImageResource,
  CanvasResource.CanvasResource,
  VideoResource.VideoResource,
  SVGResource.SVGResource,
  BufferResource.BufferResource,
  CubeResource.CubeResource,
  ArrayResource.ArrayResource
);
exports.ArrayResource = ArrayResource.ArrayResource;
exports.INSTALLED = autoDetectResource.INSTALLED;
exports.autoDetectResource = autoDetectResource.autoDetectResource;
exports.BufferResource = BufferResource.BufferResource;
exports.CanvasResource = CanvasResource.CanvasResource;
exports.CubeResource = CubeResource.CubeResource;
exports.ImageBitmapResource = ImageBitmapResource.ImageBitmapResource;
exports.ImageResource = ImageResource.ImageResource;
exports.SVGResource = SVGResource.SVGResource;
exports.VideoResource = VideoResource.VideoResource;
exports.BaseImageResource = BaseImageResource.BaseImageResource;
exports.Resource = Resource.Resource;
exports.AbstractMultiResource = AbstractMultiResource.AbstractMultiResource;


},{"./AbstractMultiResource.js":125,"./ArrayResource.js":126,"./BaseImageResource.js":127,"./BufferResource.js":128,"./CanvasResource.js":129,"./CubeResource.js":130,"./ImageBitmapResource.js":131,"./ImageResource.js":132,"./Resource.js":133,"./SVGResource.js":134,"./VideoResource.js":135,"./autoDetectResource.js":136}],138:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants");
function mapInternalFormatToSamplerType(gl) {
  let table;
  return "WebGL2RenderingContext" in globalThis && gl instanceof globalThis.WebGL2RenderingContext ? table = {
    [gl.RGB]: constants.SAMPLER_TYPES.FLOAT,
    [gl.RGBA]: constants.SAMPLER_TYPES.FLOAT,
    [gl.ALPHA]: constants.SAMPLER_TYPES.FLOAT,
    [gl.LUMINANCE]: constants.SAMPLER_TYPES.FLOAT,
    [gl.LUMINANCE_ALPHA]: constants.SAMPLER_TYPES.FLOAT,
    [gl.R8]: constants.SAMPLER_TYPES.FLOAT,
    [gl.R8_SNORM]: constants.SAMPLER_TYPES.FLOAT,
    [gl.RG8]: constants.SAMPLER_TYPES.FLOAT,
    [gl.RG8_SNORM]: constants.SAMPLER_TYPES.FLOAT,
    [gl.RGB8]: constants.SAMPLER_TYPES.FLOAT,
    [gl.RGB8_SNORM]: constants.SAMPLER_TYPES.FLOAT,
    [gl.RGB565]: constants.SAMPLER_TYPES.FLOAT,
    [gl.RGBA4]: constants.SAMPLER_TYPES.FLOAT,
    [gl.RGB5_A1]: constants.SAMPLER_TYPES.FLOAT,
    [gl.RGBA8]: constants.SAMPLER_TYPES.FLOAT,
    [gl.RGBA8_SNORM]: constants.SAMPLER_TYPES.FLOAT,
    [gl.RGB10_A2]: constants.SAMPLER_TYPES.FLOAT,
    [gl.RGB10_A2UI]: constants.SAMPLER_TYPES.FLOAT,
    [gl.SRGB8]: constants.SAMPLER_TYPES.FLOAT,
    [gl.SRGB8_ALPHA8]: constants.SAMPLER_TYPES.FLOAT,
    [gl.R16F]: constants.SAMPLER_TYPES.FLOAT,
    [gl.RG16F]: constants.SAMPLER_TYPES.FLOAT,
    [gl.RGB16F]: constants.SAMPLER_TYPES.FLOAT,
    [gl.RGBA16F]: constants.SAMPLER_TYPES.FLOAT,
    [gl.R32F]: constants.SAMPLER_TYPES.FLOAT,
    [gl.RG32F]: constants.SAMPLER_TYPES.FLOAT,
    [gl.RGB32F]: constants.SAMPLER_TYPES.FLOAT,
    [gl.RGBA32F]: constants.SAMPLER_TYPES.FLOAT,
    [gl.R11F_G11F_B10F]: constants.SAMPLER_TYPES.FLOAT,
    [gl.RGB9_E5]: constants.SAMPLER_TYPES.FLOAT,
    [gl.R8I]: constants.SAMPLER_TYPES.INT,
    [gl.R8UI]: constants.SAMPLER_TYPES.UINT,
    [gl.R16I]: constants.SAMPLER_TYPES.INT,
    [gl.R16UI]: constants.SAMPLER_TYPES.UINT,
    [gl.R32I]: constants.SAMPLER_TYPES.INT,
    [gl.R32UI]: constants.SAMPLER_TYPES.UINT,
    [gl.RG8I]: constants.SAMPLER_TYPES.INT,
    [gl.RG8UI]: constants.SAMPLER_TYPES.UINT,
    [gl.RG16I]: constants.SAMPLER_TYPES.INT,
    [gl.RG16UI]: constants.SAMPLER_TYPES.UINT,
    [gl.RG32I]: constants.SAMPLER_TYPES.INT,
    [gl.RG32UI]: constants.SAMPLER_TYPES.UINT,
    [gl.RGB8I]: constants.SAMPLER_TYPES.INT,
    [gl.RGB8UI]: constants.SAMPLER_TYPES.UINT,
    [gl.RGB16I]: constants.SAMPLER_TYPES.INT,
    [gl.RGB16UI]: constants.SAMPLER_TYPES.UINT,
    [gl.RGB32I]: constants.SAMPLER_TYPES.INT,
    [gl.RGB32UI]: constants.SAMPLER_TYPES.UINT,
    [gl.RGBA8I]: constants.SAMPLER_TYPES.INT,
    [gl.RGBA8UI]: constants.SAMPLER_TYPES.UINT,
    [gl.RGBA16I]: constants.SAMPLER_TYPES.INT,
    [gl.RGBA16UI]: constants.SAMPLER_TYPES.UINT,
    [gl.RGBA32I]: constants.SAMPLER_TYPES.INT,
    [gl.RGBA32UI]: constants.SAMPLER_TYPES.UINT,
    [gl.DEPTH_COMPONENT16]: constants.SAMPLER_TYPES.FLOAT,
    [gl.DEPTH_COMPONENT24]: constants.SAMPLER_TYPES.FLOAT,
    [gl.DEPTH_COMPONENT32F]: constants.SAMPLER_TYPES.FLOAT,
    [gl.DEPTH_STENCIL]: constants.SAMPLER_TYPES.FLOAT,
    [gl.DEPTH24_STENCIL8]: constants.SAMPLER_TYPES.FLOAT,
    [gl.DEPTH32F_STENCIL8]: constants.SAMPLER_TYPES.FLOAT
  } : table = {
    [gl.RGB]: constants.SAMPLER_TYPES.FLOAT,
    [gl.RGBA]: constants.SAMPLER_TYPES.FLOAT,
    [gl.ALPHA]: constants.SAMPLER_TYPES.FLOAT,
    [gl.LUMINANCE]: constants.SAMPLER_TYPES.FLOAT,
    [gl.LUMINANCE_ALPHA]: constants.SAMPLER_TYPES.FLOAT,
    [gl.DEPTH_STENCIL]: constants.SAMPLER_TYPES.FLOAT
  }, table;
}
exports.mapInternalFormatToSamplerType = mapInternalFormatToSamplerType;


},{"@pixi/constants":31}],139:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants");
function mapTypeAndFormatToInternalFormat(gl) {
  let table;
  return "WebGL2RenderingContext" in globalThis && gl instanceof globalThis.WebGL2RenderingContext ? table = {
    [constants.TYPES.UNSIGNED_BYTE]: {
      [constants.FORMATS.RGBA]: gl.RGBA8,
      [constants.FORMATS.RGB]: gl.RGB8,
      [constants.FORMATS.RG]: gl.RG8,
      [constants.FORMATS.RED]: gl.R8,
      [constants.FORMATS.RGBA_INTEGER]: gl.RGBA8UI,
      [constants.FORMATS.RGB_INTEGER]: gl.RGB8UI,
      [constants.FORMATS.RG_INTEGER]: gl.RG8UI,
      [constants.FORMATS.RED_INTEGER]: gl.R8UI,
      [constants.FORMATS.ALPHA]: gl.ALPHA,
      [constants.FORMATS.LUMINANCE]: gl.LUMINANCE,
      [constants.FORMATS.LUMINANCE_ALPHA]: gl.LUMINANCE_ALPHA
    },
    [constants.TYPES.BYTE]: {
      [constants.FORMATS.RGBA]: gl.RGBA8_SNORM,
      [constants.FORMATS.RGB]: gl.RGB8_SNORM,
      [constants.FORMATS.RG]: gl.RG8_SNORM,
      [constants.FORMATS.RED]: gl.R8_SNORM,
      [constants.FORMATS.RGBA_INTEGER]: gl.RGBA8I,
      [constants.FORMATS.RGB_INTEGER]: gl.RGB8I,
      [constants.FORMATS.RG_INTEGER]: gl.RG8I,
      [constants.FORMATS.RED_INTEGER]: gl.R8I
    },
    [constants.TYPES.UNSIGNED_SHORT]: {
      [constants.FORMATS.RGBA_INTEGER]: gl.RGBA16UI,
      [constants.FORMATS.RGB_INTEGER]: gl.RGB16UI,
      [constants.FORMATS.RG_INTEGER]: gl.RG16UI,
      [constants.FORMATS.RED_INTEGER]: gl.R16UI,
      [constants.FORMATS.DEPTH_COMPONENT]: gl.DEPTH_COMPONENT16
    },
    [constants.TYPES.SHORT]: {
      [constants.FORMATS.RGBA_INTEGER]: gl.RGBA16I,
      [constants.FORMATS.RGB_INTEGER]: gl.RGB16I,
      [constants.FORMATS.RG_INTEGER]: gl.RG16I,
      [constants.FORMATS.RED_INTEGER]: gl.R16I
    },
    [constants.TYPES.UNSIGNED_INT]: {
      [constants.FORMATS.RGBA_INTEGER]: gl.RGBA32UI,
      [constants.FORMATS.RGB_INTEGER]: gl.RGB32UI,
      [constants.FORMATS.RG_INTEGER]: gl.RG32UI,
      [constants.FORMATS.RED_INTEGER]: gl.R32UI,
      [constants.FORMATS.DEPTH_COMPONENT]: gl.DEPTH_COMPONENT24
    },
    [constants.TYPES.INT]: {
      [constants.FORMATS.RGBA_INTEGER]: gl.RGBA32I,
      [constants.FORMATS.RGB_INTEGER]: gl.RGB32I,
      [constants.FORMATS.RG_INTEGER]: gl.RG32I,
      [constants.FORMATS.RED_INTEGER]: gl.R32I
    },
    [constants.TYPES.FLOAT]: {
      [constants.FORMATS.RGBA]: gl.RGBA32F,
      [constants.FORMATS.RGB]: gl.RGB32F,
      [constants.FORMATS.RG]: gl.RG32F,
      [constants.FORMATS.RED]: gl.R32F,
      [constants.FORMATS.DEPTH_COMPONENT]: gl.DEPTH_COMPONENT32F
    },
    [constants.TYPES.HALF_FLOAT]: {
      [constants.FORMATS.RGBA]: gl.RGBA16F,
      [constants.FORMATS.RGB]: gl.RGB16F,
      [constants.FORMATS.RG]: gl.RG16F,
      [constants.FORMATS.RED]: gl.R16F
    },
    [constants.TYPES.UNSIGNED_SHORT_5_6_5]: {
      [constants.FORMATS.RGB]: gl.RGB565
    },
    [constants.TYPES.UNSIGNED_SHORT_4_4_4_4]: {
      [constants.FORMATS.RGBA]: gl.RGBA4
    },
    [constants.TYPES.UNSIGNED_SHORT_5_5_5_1]: {
      [constants.FORMATS.RGBA]: gl.RGB5_A1
    },
    [constants.TYPES.UNSIGNED_INT_2_10_10_10_REV]: {
      [constants.FORMATS.RGBA]: gl.RGB10_A2,
      [constants.FORMATS.RGBA_INTEGER]: gl.RGB10_A2UI
    },
    [constants.TYPES.UNSIGNED_INT_10F_11F_11F_REV]: {
      [constants.FORMATS.RGB]: gl.R11F_G11F_B10F
    },
    [constants.TYPES.UNSIGNED_INT_5_9_9_9_REV]: {
      [constants.FORMATS.RGB]: gl.RGB9_E5
    },
    [constants.TYPES.UNSIGNED_INT_24_8]: {
      [constants.FORMATS.DEPTH_STENCIL]: gl.DEPTH24_STENCIL8
    },
    [constants.TYPES.FLOAT_32_UNSIGNED_INT_24_8_REV]: {
      [constants.FORMATS.DEPTH_STENCIL]: gl.DEPTH32F_STENCIL8
    }
  } : table = {
    [constants.TYPES.UNSIGNED_BYTE]: {
      [constants.FORMATS.RGBA]: gl.RGBA,
      [constants.FORMATS.RGB]: gl.RGB,
      [constants.FORMATS.ALPHA]: gl.ALPHA,
      [constants.FORMATS.LUMINANCE]: gl.LUMINANCE,
      [constants.FORMATS.LUMINANCE_ALPHA]: gl.LUMINANCE_ALPHA
    },
    [constants.TYPES.UNSIGNED_SHORT_5_6_5]: {
      [constants.FORMATS.RGB]: gl.RGB
    },
    [constants.TYPES.UNSIGNED_SHORT_4_4_4_4]: {
      [constants.FORMATS.RGBA]: gl.RGBA
    },
    [constants.TYPES.UNSIGNED_SHORT_5_5_5_1]: {
      [constants.FORMATS.RGBA]: gl.RGBA
    }
  }, table;
}
exports.mapTypeAndFormatToInternalFormat = mapTypeAndFormatToInternalFormat;


},{"@pixi/constants":31}],140:[function(require,module,exports){
"use strict";
var runner = require("@pixi/runner");
class TransformFeedback {
  constructor() {
    this._glTransformFeedbacks = {}, this.buffers = [], this.disposeRunner = new runner.Runner("disposeTransformFeedback");
  }
  /**
   * Bind buffer to TransformFeedback
   * @param index - index to bind
   * @param buffer - buffer to bind
   */
  bindBuffer(index, buffer) {
    this.buffers[index] = buffer;
  }
  /** Destroy WebGL resources that are connected to this TransformFeedback. */
  destroy() {
    this.disposeRunner.emit(this, !1);
  }
}
exports.TransformFeedback = TransformFeedback;


},{"@pixi/runner":176}],141:[function(require,module,exports){
"use strict";
var extensions = require("@pixi/extensions");
class TransformFeedbackSystem {
  /**
   * @param renderer - The renderer this System works for.
   */
  constructor(renderer) {
    this.renderer = renderer;
  }
  /** Sets up the renderer context and necessary buffers. */
  contextChange() {
    this.gl = this.renderer.gl, this.CONTEXT_UID = this.renderer.CONTEXT_UID;
  }
  /**
   * Bind TransformFeedback and buffers
   * @param transformFeedback - TransformFeedback to bind
   */
  bind(transformFeedback) {
    const { gl, CONTEXT_UID } = this, glTransformFeedback = transformFeedback._glTransformFeedbacks[CONTEXT_UID] || this.createGLTransformFeedback(transformFeedback);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, glTransformFeedback);
  }
  /** Unbind TransformFeedback */
  unbind() {
    const { gl } = this;
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
  }
  /**
   * Begin TransformFeedback
   * @param drawMode - DrawMode for TransformFeedback
   * @param shader - A Shader used by TransformFeedback. Current bound shader will be used if not provided.
   */
  beginTransformFeedback(drawMode, shader) {
    const { gl, renderer } = this;
    shader && renderer.shader.bind(shader), gl.beginTransformFeedback(drawMode);
  }
  /** End TransformFeedback */
  endTransformFeedback() {
    const { gl } = this;
    gl.endTransformFeedback();
  }
  /**
   * Create TransformFeedback and bind buffers
   * @param tf - TransformFeedback
   * @returns WebGLTransformFeedback
   */
  createGLTransformFeedback(tf) {
    const { gl, renderer, CONTEXT_UID } = this, glTransformFeedback = gl.createTransformFeedback();
    tf._glTransformFeedbacks[CONTEXT_UID] = glTransformFeedback, gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, glTransformFeedback);
    for (let i = 0; i < tf.buffers.length; i++) {
      const buffer = tf.buffers[i];
      buffer && (renderer.buffer.update(buffer), buffer._glBuffers[CONTEXT_UID].refCount++, gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, i, buffer._glBuffers[CONTEXT_UID].buffer || null));
    }
    return gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null), tf.disposeRunner.add(this), glTransformFeedback;
  }
  /**
   * Disposes TransfromFeedback
   * @param {PIXI.TransformFeedback} tf - TransformFeedback
   * @param {boolean} [contextLost=false] - If context was lost, we suppress delete TransformFeedback
   */
  disposeTransformFeedback(tf, contextLost) {
    const glTF = tf._glTransformFeedbacks[this.CONTEXT_UID], gl = this.gl;
    tf.disposeRunner.remove(this);
    const bufferSystem = this.renderer.buffer;
    if (bufferSystem)
      for (let i = 0; i < tf.buffers.length; i++) {
        const buffer = tf.buffers[i];
        if (!buffer)
          continue;
        const buf = buffer._glBuffers[this.CONTEXT_UID];
        buf && (buf.refCount--, buf.refCount === 0 && !contextLost && bufferSystem.dispose(buffer, contextLost));
      }
    glTF && (contextLost || gl.deleteTransformFeedback(glTF), delete tf._glTransformFeedbacks[this.CONTEXT_UID]);
  }
  destroy() {
    this.renderer = null;
  }
}
TransformFeedbackSystem.extension = {
  type: extensions.ExtensionType.RendererSystem,
  name: "transformFeedback"
};
extensions.extensions.add(TransformFeedbackSystem);
exports.TransformFeedbackSystem = TransformFeedbackSystem;


},{"@pixi/extensions":160}],142:[function(require,module,exports){
"use strict";
var Geometry = require("../geometry/Geometry.js");
class Quad extends Geometry.Geometry {
  constructor() {
    super(), this.addAttribute("aVertexPosition", new Float32Array([
      0,
      0,
      1,
      0,
      1,
      1,
      0,
      1
    ])).addIndex([0, 1, 3, 2]);
  }
}
exports.Quad = Quad;


},{"../geometry/Geometry.js":68}],143:[function(require,module,exports){
"use strict";
var Buffer = require("../geometry/Buffer.js"), Geometry = require("../geometry/Geometry.js");
class QuadUv extends Geometry.Geometry {
  constructor() {
    super(), this.vertices = new Float32Array([
      -1,
      -1,
      1,
      -1,
      1,
      1,
      -1,
      1
    ]), this.uvs = new Float32Array([
      0,
      0,
      1,
      0,
      1,
      1,
      0,
      1
    ]), this.vertexBuffer = new Buffer.Buffer(this.vertices), this.uvBuffer = new Buffer.Buffer(this.uvs), this.addAttribute("aVertexPosition", this.vertexBuffer).addAttribute("aTextureCoord", this.uvBuffer).addIndex([0, 1, 2, 0, 2, 3]);
  }
  /**
   * Maps two Rectangle to the quad.
   * @param targetTextureFrame - The first rectangle
   * @param destinationFrame - The second rectangle
   * @returns - Returns itself.
   */
  map(targetTextureFrame, destinationFrame) {
    let x = 0, y = 0;
    return this.uvs[0] = x, this.uvs[1] = y, this.uvs[2] = x + destinationFrame.width / targetTextureFrame.width, this.uvs[3] = y, this.uvs[4] = x + destinationFrame.width / targetTextureFrame.width, this.uvs[5] = y + destinationFrame.height / targetTextureFrame.height, this.uvs[6] = x, this.uvs[7] = y + destinationFrame.height / targetTextureFrame.height, x = destinationFrame.x, y = destinationFrame.y, this.vertices[0] = x, this.vertices[1] = y, this.vertices[2] = x + destinationFrame.width, this.vertices[3] = y, this.vertices[4] = x + destinationFrame.width, this.vertices[5] = y + destinationFrame.height, this.vertices[6] = x, this.vertices[7] = y + destinationFrame.height, this.invalidate(), this;
  }
  /**
   * Legacy upload method, just marks buffers dirty.
   * @returns - Returns itself.
   */
  invalidate() {
    return this.vertexBuffer._updateID++, this.uvBuffer._updateID++, this;
  }
}
exports.QuadUv = QuadUv;


},{"../geometry/Buffer.js":65,"../geometry/Geometry.js":68}],144:[function(require,module,exports){
"use strict";
var extensions = require("@pixi/extensions"), math = require("@pixi/math"), settings = require("@pixi/settings");
class ViewSystem {
  constructor(renderer) {
    this.renderer = renderer;
  }
  /**
   * initiates the view system
   * @param {PIXI.ViewOptions} options - the options for the view
   */
  init(options) {
    this.screen = new math.Rectangle(0, 0, options.width, options.height), this.element = options.view || settings.settings.ADAPTER.createCanvas(), this.resolution = options.resolution || settings.settings.RESOLUTION, this.autoDensity = !!options.autoDensity;
  }
  /**
   * Resizes the screen and canvas to the specified dimensions.
   * @param desiredScreenWidth - The new width of the screen.
   * @param desiredScreenHeight - The new height of the screen.
   */
  resizeView(desiredScreenWidth, desiredScreenHeight) {
    this.element.width = Math.round(desiredScreenWidth * this.resolution), this.element.height = Math.round(desiredScreenHeight * this.resolution);
    const screenWidth = this.element.width / this.resolution, screenHeight = this.element.height / this.resolution;
    this.screen.width = screenWidth, this.screen.height = screenHeight, this.autoDensity && (this.element.style.width = `${screenWidth}px`, this.element.style.height = `${screenHeight}px`), this.renderer.emit("resize", screenWidth, screenHeight), this.renderer.runners.resize.emit(this.screen.width, this.screen.height);
  }
  /**
   * Destroys this System and optionally removes the canvas from the dom.
   * @param {boolean} [removeView=false] - Whether to remove the canvas from the DOM.
   */
  destroy(removeView) {
    removeView && this.element.parentNode?.removeChild(this.element), this.renderer = null, this.element = null, this.screen = null;
  }
}
ViewSystem.defaultOptions = {
  /**
   * {@link PIXI.IRendererOptions.width}
   * @default 800
   * @memberof PIXI.settings.RENDER_OPTIONS
   */
  width: 800,
  /**
   * {@link PIXI.IRendererOptions.height}
   * @default 600
   * @memberof PIXI.settings.RENDER_OPTIONS
   */
  height: 600,
  /**
   * {@link PIXI.IRendererOptions.resolution}
   * @type {number}
   * @default PIXI.settings.RESOLUTION
   * @memberof PIXI.settings.RENDER_OPTIONS
   */
  resolution: void 0,
  /**
   * {@link PIXI.IRendererOptions.autoDensity}
   * @default false
   * @memberof PIXI.settings.RENDER_OPTIONS
   */
  autoDensity: !1
}, /** @ignore */
ViewSystem.extension = {
  type: [
    extensions.ExtensionType.RendererSystem,
    extensions.ExtensionType.CanvasRendererSystem
  ],
  name: "_view"
};
extensions.extensions.add(ViewSystem);
exports.ViewSystem = ViewSystem;


},{"@pixi/extensions":160,"@pixi/math":169,"@pixi/settings":180}],145:[function(require,module,exports){
"use strict";
var core = require("@pixi/core");
class Bounds {
  constructor() {
    this.minX = 1 / 0, this.minY = 1 / 0, this.maxX = -1 / 0, this.maxY = -1 / 0, this.rect = null, this.updateID = -1;
  }
  /**
   * Checks if bounds are empty.
   * @returns - True if empty.
   */
  isEmpty() {
    return this.minX > this.maxX || this.minY > this.maxY;
  }
  /** Clears the bounds and resets. */
  clear() {
    this.minX = 1 / 0, this.minY = 1 / 0, this.maxX = -1 / 0, this.maxY = -1 / 0;
  }
  /**
   * Can return Rectangle.EMPTY constant, either construct new rectangle, either use your rectangle
   * It is not guaranteed that it will return tempRect
   * @param rect - Temporary object will be used if AABB is not empty
   * @returns - A rectangle of the bounds
   */
  getRectangle(rect) {
    return this.minX > this.maxX || this.minY > this.maxY ? core.Rectangle.EMPTY : (rect = rect || new core.Rectangle(0, 0, 1, 1), rect.x = this.minX, rect.y = this.minY, rect.width = this.maxX - this.minX, rect.height = this.maxY - this.minY, rect);
  }
  /**
   * This function should be inlined when its possible.
   * @param point - The point to add.
   */
  addPoint(point) {
    this.minX = Math.min(this.minX, point.x), this.maxX = Math.max(this.maxX, point.x), this.minY = Math.min(this.minY, point.y), this.maxY = Math.max(this.maxY, point.y);
  }
  /**
   * Adds a point, after transformed. This should be inlined when its possible.
   * @param matrix
   * @param point
   */
  addPointMatrix(matrix, point) {
    const { a, b, c, d, tx, ty } = matrix, x = a * point.x + c * point.y + tx, y = b * point.x + d * point.y + ty;
    this.minX = Math.min(this.minX, x), this.maxX = Math.max(this.maxX, x), this.minY = Math.min(this.minY, y), this.maxY = Math.max(this.maxY, y);
  }
  /**
   * Adds a quad, not transformed
   * @param vertices - The verts to add.
   */
  addQuad(vertices) {
    let minX = this.minX, minY = this.minY, maxX = this.maxX, maxY = this.maxY, x = vertices[0], y = vertices[1];
    minX = x < minX ? x : minX, minY = y < minY ? y : minY, maxX = x > maxX ? x : maxX, maxY = y > maxY ? y : maxY, x = vertices[2], y = vertices[3], minX = x < minX ? x : minX, minY = y < minY ? y : minY, maxX = x > maxX ? x : maxX, maxY = y > maxY ? y : maxY, x = vertices[4], y = vertices[5], minX = x < minX ? x : minX, minY = y < minY ? y : minY, maxX = x > maxX ? x : maxX, maxY = y > maxY ? y : maxY, x = vertices[6], y = vertices[7], minX = x < minX ? x : minX, minY = y < minY ? y : minY, maxX = x > maxX ? x : maxX, maxY = y > maxY ? y : maxY, this.minX = minX, this.minY = minY, this.maxX = maxX, this.maxY = maxY;
  }
  /**
   * Adds sprite frame, transformed.
   * @param transform - transform to apply
   * @param x0 - left X of frame
   * @param y0 - top Y of frame
   * @param x1 - right X of frame
   * @param y1 - bottom Y of frame
   */
  addFrame(transform, x0, y0, x1, y1) {
    this.addFrameMatrix(transform.worldTransform, x0, y0, x1, y1);
  }
  /**
   * Adds sprite frame, multiplied by matrix
   * @param matrix - matrix to apply
   * @param x0 - left X of frame
   * @param y0 - top Y of frame
   * @param x1 - right X of frame
   * @param y1 - bottom Y of frame
   */
  addFrameMatrix(matrix, x0, y0, x1, y1) {
    const a = matrix.a, b = matrix.b, c = matrix.c, d = matrix.d, tx = matrix.tx, ty = matrix.ty;
    let minX = this.minX, minY = this.minY, maxX = this.maxX, maxY = this.maxY, x = a * x0 + c * y0 + tx, y = b * x0 + d * y0 + ty;
    minX = x < minX ? x : minX, minY = y < minY ? y : minY, maxX = x > maxX ? x : maxX, maxY = y > maxY ? y : maxY, x = a * x1 + c * y0 + tx, y = b * x1 + d * y0 + ty, minX = x < minX ? x : minX, minY = y < minY ? y : minY, maxX = x > maxX ? x : maxX, maxY = y > maxY ? y : maxY, x = a * x0 + c * y1 + tx, y = b * x0 + d * y1 + ty, minX = x < minX ? x : minX, minY = y < minY ? y : minY, maxX = x > maxX ? x : maxX, maxY = y > maxY ? y : maxY, x = a * x1 + c * y1 + tx, y = b * x1 + d * y1 + ty, minX = x < minX ? x : minX, minY = y < minY ? y : minY, maxX = x > maxX ? x : maxX, maxY = y > maxY ? y : maxY, this.minX = minX, this.minY = minY, this.maxX = maxX, this.maxY = maxY;
  }
  /**
   * Adds screen vertices from array
   * @param vertexData - calculated vertices
   * @param beginOffset - begin offset
   * @param endOffset - end offset, excluded
   */
  addVertexData(vertexData, beginOffset, endOffset) {
    let minX = this.minX, minY = this.minY, maxX = this.maxX, maxY = this.maxY;
    for (let i = beginOffset; i < endOffset; i += 2) {
      const x = vertexData[i], y = vertexData[i + 1];
      minX = x < minX ? x : minX, minY = y < minY ? y : minY, maxX = x > maxX ? x : maxX, maxY = y > maxY ? y : maxY;
    }
    this.minX = minX, this.minY = minY, this.maxX = maxX, this.maxY = maxY;
  }
  /**
   * Add an array of mesh vertices
   * @param transform - mesh transform
   * @param vertices - mesh coordinates in array
   * @param beginOffset - begin offset
   * @param endOffset - end offset, excluded
   */
  addVertices(transform, vertices, beginOffset, endOffset) {
    this.addVerticesMatrix(transform.worldTransform, vertices, beginOffset, endOffset);
  }
  /**
   * Add an array of mesh vertices.
   * @param matrix - mesh matrix
   * @param vertices - mesh coordinates in array
   * @param beginOffset - begin offset
   * @param endOffset - end offset, excluded
   * @param padX - x padding
   * @param padY - y padding
   */
  addVerticesMatrix(matrix, vertices, beginOffset, endOffset, padX = 0, padY = padX) {
    const a = matrix.a, b = matrix.b, c = matrix.c, d = matrix.d, tx = matrix.tx, ty = matrix.ty;
    let minX = this.minX, minY = this.minY, maxX = this.maxX, maxY = this.maxY;
    for (let i = beginOffset; i < endOffset; i += 2) {
      const rawX = vertices[i], rawY = vertices[i + 1], x = a * rawX + c * rawY + tx, y = d * rawY + b * rawX + ty;
      minX = Math.min(minX, x - padX), maxX = Math.max(maxX, x + padX), minY = Math.min(minY, y - padY), maxY = Math.max(maxY, y + padY);
    }
    this.minX = minX, this.minY = minY, this.maxX = maxX, this.maxY = maxY;
  }
  /**
   * Adds other {@link PIXI.Bounds}.
   * @param bounds - The Bounds to be added
   */
  addBounds(bounds) {
    const minX = this.minX, minY = this.minY, maxX = this.maxX, maxY = this.maxY;
    this.minX = bounds.minX < minX ? bounds.minX : minX, this.minY = bounds.minY < minY ? bounds.minY : minY, this.maxX = bounds.maxX > maxX ? bounds.maxX : maxX, this.maxY = bounds.maxY > maxY ? bounds.maxY : maxY;
  }
  /**
   * Adds other Bounds, masked with Bounds.
   * @param bounds - The Bounds to be added.
   * @param mask - TODO
   */
  addBoundsMask(bounds, mask) {
    const _minX = bounds.minX > mask.minX ? bounds.minX : mask.minX, _minY = bounds.minY > mask.minY ? bounds.minY : mask.minY, _maxX = bounds.maxX < mask.maxX ? bounds.maxX : mask.maxX, _maxY = bounds.maxY < mask.maxY ? bounds.maxY : mask.maxY;
    if (_minX <= _maxX && _minY <= _maxY) {
      const minX = this.minX, minY = this.minY, maxX = this.maxX, maxY = this.maxY;
      this.minX = _minX < minX ? _minX : minX, this.minY = _minY < minY ? _minY : minY, this.maxX = _maxX > maxX ? _maxX : maxX, this.maxY = _maxY > maxY ? _maxY : maxY;
    }
  }
  /**
   * Adds other Bounds, multiplied by matrix. Bounds shouldn't be empty.
   * @param bounds - other bounds
   * @param matrix - multiplicator
   */
  addBoundsMatrix(bounds, matrix) {
    this.addFrameMatrix(matrix, bounds.minX, bounds.minY, bounds.maxX, bounds.maxY);
  }
  /**
   * Adds other Bounds, masked with Rectangle.
   * @param bounds - TODO
   * @param area - TODO
   */
  addBoundsArea(bounds, area) {
    const _minX = bounds.minX > area.x ? bounds.minX : area.x, _minY = bounds.minY > area.y ? bounds.minY : area.y, _maxX = bounds.maxX < area.x + area.width ? bounds.maxX : area.x + area.width, _maxY = bounds.maxY < area.y + area.height ? bounds.maxY : area.y + area.height;
    if (_minX <= _maxX && _minY <= _maxY) {
      const minX = this.minX, minY = this.minY, maxX = this.maxX, maxY = this.maxY;
      this.minX = _minX < minX ? _minX : minX, this.minY = _minY < minY ? _minY : minY, this.maxX = _maxX > maxX ? _maxX : maxX, this.maxY = _maxY > maxY ? _maxY : maxY;
    }
  }
  /**
   * Pads bounds object, making it grow in all directions.
   * If paddingY is omitted, both paddingX and paddingY will be set to paddingX.
   * @param paddingX - The horizontal padding amount.
   * @param paddingY - The vertical padding amount.
   */
  pad(paddingX = 0, paddingY = paddingX) {
    this.isEmpty() || (this.minX -= paddingX, this.maxX += paddingX, this.minY -= paddingY, this.maxY += paddingY);
  }
  /**
   * Adds padded frame. (x0, y0) should be strictly less than (x1, y1)
   * @param x0 - left X of frame
   * @param y0 - top Y of frame
   * @param x1 - right X of frame
   * @param y1 - bottom Y of frame
   * @param padX - padding X
   * @param padY - padding Y
   */
  addFramePad(x0, y0, x1, y1, padX, padY) {
    x0 -= padX, y0 -= padY, x1 += padX, y1 += padY, this.minX = this.minX < x0 ? this.minX : x0, this.maxX = this.maxX > x1 ? this.maxX : x1, this.minY = this.minY < y0 ? this.minY : y0, this.maxY = this.maxY > y1 ? this.maxY : y1;
  }
}
exports.Bounds = Bounds;


},{"@pixi/core":72}],146:[function(require,module,exports){
"use strict";
var core = require("@pixi/core"), DisplayObject = require("./DisplayObject.js");
const tempMatrix = new core.Matrix();
function sortChildren(a, b) {
  return a.zIndex === b.zIndex ? a._lastSortedIndex - b._lastSortedIndex : a.zIndex - b.zIndex;
}
const _Container = class _Container2 extends DisplayObject.DisplayObject {
  constructor() {
    super(), this.children = [], this.sortableChildren = _Container2.defaultSortableChildren, this.sortDirty = !1;
  }
  /**
   * Overridable method that can be used by Container subclasses whenever the children array is modified.
   * @param _length
   */
  onChildrenChange(_length) {
  }
  /**
   * Adds one or more children to the container.
   *
   * Multiple items can be added like so: `myContainer.addChild(thingOne, thingTwo, thingThree)`
   * @param {...PIXI.DisplayObject} children - The DisplayObject(s) to add to the container
   * @returns {PIXI.DisplayObject} - The first child that was added.
   */
  addChild(...children) {
    if (children.length > 1)
      for (let i = 0; i < children.length; i++)
        this.addChild(children[i]);
    else {
      const child = children[0];
      child.parent && child.parent.removeChild(child), child.parent = this, this.sortDirty = !0, child.transform._parentID = -1, this.children.push(child), this._boundsID++, this.onChildrenChange(this.children.length - 1), this.emit("childAdded", child, this, this.children.length - 1), child.emit("added", this);
    }
    return children[0];
  }
  /**
   * Adds a child to the container at a specified index. If the index is out of bounds an error will be thrown.
   * If the child is already in this container, it will be moved to the specified index.
   * @param {PIXI.DisplayObject} child - The child to add.
   * @param {number} index - The absolute index where the child will be positioned at the end of the operation.
   * @returns {PIXI.DisplayObject} The child that was added.
   */
  addChildAt(child, index) {
    if (index < 0 || index > this.children.length)
      throw new Error(`${child}addChildAt: The index ${index} supplied is out of bounds ${this.children.length}`);
    return child.parent && child.parent.removeChild(child), child.parent = this, this.sortDirty = !0, child.transform._parentID = -1, this.children.splice(index, 0, child), this._boundsID++, this.onChildrenChange(index), child.emit("added", this), this.emit("childAdded", child, this, index), child;
  }
  /**
   * Swaps the position of 2 Display Objects within this container.
   * @param child - First display object to swap
   * @param child2 - Second display object to swap
   */
  swapChildren(child, child2) {
    if (child === child2)
      return;
    const index1 = this.getChildIndex(child), index2 = this.getChildIndex(child2);
    this.children[index1] = child2, this.children[index2] = child, this.onChildrenChange(index1 < index2 ? index1 : index2);
  }
  /**
   * Returns the index position of a child DisplayObject instance
   * @param child - The DisplayObject instance to identify
   * @returns - The index position of the child display object to identify
   */
  getChildIndex(child) {
    const index = this.children.indexOf(child);
    if (index === -1)
      throw new Error("The supplied DisplayObject must be a child of the caller");
    return index;
  }
  /**
   * Changes the position of an existing child in the display object container
   * @param child - The child DisplayObject instance for which you want to change the index number
   * @param index - The resulting index number for the child display object
   */
  setChildIndex(child, index) {
    if (index < 0 || index >= this.children.length)
      throw new Error(`The index ${index} supplied is out of bounds ${this.children.length}`);
    const currentIndex = this.getChildIndex(child);
    core.utils.removeItems(this.children, currentIndex, 1), this.children.splice(index, 0, child), this.onChildrenChange(index);
  }
  /**
   * Returns the child at the specified index
   * @param index - The index to get the child at
   * @returns - The child at the given index, if any.
   */
  getChildAt(index) {
    if (index < 0 || index >= this.children.length)
      throw new Error(`getChildAt: Index (${index}) does not exist.`);
    return this.children[index];
  }
  /**
   * Removes one or more children from the container.
   * @param {...PIXI.DisplayObject} children - The DisplayObject(s) to remove
   * @returns {PIXI.DisplayObject} The first child that was removed.
   */
  removeChild(...children) {
    if (children.length > 1)
      for (let i = 0; i < children.length; i++)
        this.removeChild(children[i]);
    else {
      const child = children[0], index = this.children.indexOf(child);
      if (index === -1)
        return null;
      child.parent = null, child.transform._parentID = -1, core.utils.removeItems(this.children, index, 1), this._boundsID++, this.onChildrenChange(index), child.emit("removed", this), this.emit("childRemoved", child, this, index);
    }
    return children[0];
  }
  /**
   * Removes a child from the specified index position.
   * @param index - The index to get the child from
   * @returns The child that was removed.
   */
  removeChildAt(index) {
    const child = this.getChildAt(index);
    return child.parent = null, child.transform._parentID = -1, core.utils.removeItems(this.children, index, 1), this._boundsID++, this.onChildrenChange(index), child.emit("removed", this), this.emit("childRemoved", child, this, index), child;
  }
  /**
   * Removes all children from this container that are within the begin and end indexes.
   * @param beginIndex - The beginning position.
   * @param endIndex - The ending position. Default value is size of the container.
   * @returns - List of removed children
   */
  removeChildren(beginIndex = 0, endIndex = this.children.length) {
    const begin = beginIndex, end = endIndex, range = end - begin;
    let removed;
    if (range > 0 && range <= end) {
      removed = this.children.splice(begin, range);
      for (let i = 0; i < removed.length; ++i)
        removed[i].parent = null, removed[i].transform && (removed[i].transform._parentID = -1);
      this._boundsID++, this.onChildrenChange(beginIndex);
      for (let i = 0; i < removed.length; ++i)
        removed[i].emit("removed", this), this.emit("childRemoved", removed[i], this, i);
      return removed;
    } else if (range === 0 && this.children.length === 0)
      return [];
    throw new RangeError("removeChildren: numeric values are outside the acceptable range.");
  }
  /** Sorts children by zIndex. Previous order is maintained for 2 children with the same zIndex. */
  sortChildren() {
    let sortRequired = !1;
    for (let i = 0, j = this.children.length; i < j; ++i) {
      const child = this.children[i];
      child._lastSortedIndex = i, !sortRequired && child.zIndex !== 0 && (sortRequired = !0);
    }
    sortRequired && this.children.length > 1 && this.children.sort(sortChildren), this.sortDirty = !1;
  }
  /** Updates the transform on all children of this container for rendering. */
  updateTransform() {
    this.sortableChildren && this.sortDirty && this.sortChildren(), this._boundsID++, this.transform.updateTransform(this.parent.transform), this.worldAlpha = this.alpha * this.parent.worldAlpha;
    for (let i = 0, j = this.children.length; i < j; ++i) {
      const child = this.children[i];
      child.visible && child.updateTransform();
    }
  }
  /**
   * Recalculates the bounds of the container.
   *
   * This implementation will automatically fit the children's bounds into the calculation. Each child's bounds
   * is limited to its mask's bounds or filterArea, if any is applied.
   */
  calculateBounds() {
    this._bounds.clear(), this._calculateBounds();
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (!(!child.visible || !child.renderable))
        if (child.calculateBounds(), child._mask) {
          const maskObject = child._mask.isMaskData ? child._mask.maskObject : child._mask;
          maskObject ? (maskObject.calculateBounds(), this._bounds.addBoundsMask(child._bounds, maskObject._bounds)) : this._bounds.addBounds(child._bounds);
        } else
          child.filterArea ? this._bounds.addBoundsArea(child._bounds, child.filterArea) : this._bounds.addBounds(child._bounds);
    }
    this._bounds.updateID = this._boundsID;
  }
  /**
   * Retrieves the local bounds of the displayObject as a rectangle object.
   *
   * Calling `getLocalBounds` may invalidate the `_bounds` of the whole subtree below. If using it inside a render()
   * call, it is advised to call `getBounds()` immediately after to recalculate the world bounds of the subtree.
   * @param rect - Optional rectangle to store the result of the bounds calculation.
   * @param skipChildrenUpdate - Setting to `true` will stop re-calculation of children transforms,
   *  it was default behaviour of pixi 4.0-5.2 and caused many problems to users.
   * @returns - The rectangular bounding area.
   */
  getLocalBounds(rect, skipChildrenUpdate = !1) {
    const result = super.getLocalBounds(rect);
    if (!skipChildrenUpdate)
      for (let i = 0, j = this.children.length; i < j; ++i) {
        const child = this.children[i];
        child.visible && child.updateTransform();
      }
    return result;
  }
  /**
   * Recalculates the content bounds of this object. This should be overriden to
   * calculate the bounds of this specific object (not including children).
   * @protected
   */
  _calculateBounds() {
  }
  /**
   * Renders this object and its children with culling.
   * @protected
   * @param {PIXI.Renderer} renderer - The renderer
   */
  _renderWithCulling(renderer) {
    const sourceFrame = renderer.renderTexture.sourceFrame;
    if (!(sourceFrame.width > 0 && sourceFrame.height > 0))
      return;
    let bounds, transform;
    this.cullArea ? (bounds = this.cullArea, transform = this.worldTransform) : this._render !== _Container2.prototype._render && (bounds = this.getBounds(!0));
    const projectionTransform = renderer.projection.transform;
    if (projectionTransform && (transform ? (transform = tempMatrix.copyFrom(transform), transform.prepend(projectionTransform)) : transform = projectionTransform), bounds && sourceFrame.intersects(bounds, transform))
      this._render(renderer);
    else if (this.cullArea)
      return;
    for (let i = 0, j = this.children.length; i < j; ++i) {
      const child = this.children[i], childCullable = child.cullable;
      child.cullable = childCullable || !this.cullArea, child.render(renderer), child.cullable = childCullable;
    }
  }
  /**
   * Renders the object using the WebGL renderer.
   *
   * The [_render]{@link PIXI.Container#_render} method is be overriden for rendering the contents of the
   * container itself. This `render` method will invoke it, and also invoke the `render` methods of all
   * children afterward.
   *
   * If `renderable` or `visible` is false or if `worldAlpha` is not positive or if `cullable` is true and
   * the bounds of this object are out of frame, this implementation will entirely skip rendering.
   * See {@link PIXI.DisplayObject} for choosing between `renderable` or `visible`. Generally,
   * setting alpha to zero is not recommended for purely skipping rendering.
   *
   * When your scene becomes large (especially when it is larger than can be viewed in a single screen), it is
   * advised to employ **culling** to automatically skip rendering objects outside of the current screen.
   * See [cullable]{@link PIXI.DisplayObject#cullable} and [cullArea]{@link PIXI.DisplayObject#cullArea}.
   * Other culling methods might be better suited for a large number static objects; see
   * [@pixi-essentials/cull]{@link https://www.npmjs.com/package/@pixi-essentials/cull} and
   * [pixi-cull]{@link https://www.npmjs.com/package/pixi-cull}.
   *
   * The [renderAdvanced]{@link PIXI.Container#renderAdvanced} method is internally used when when masking or
   * filtering is applied on a container. This does, however, break batching and can affect performance when
   * masking and filtering is applied extensively throughout the scene graph.
   * @param renderer - The renderer
   */
  render(renderer) {
    if (!(!this.visible || this.worldAlpha <= 0 || !this.renderable))
      if (this._mask || this.filters?.length)
        this.renderAdvanced(renderer);
      else if (this.cullable)
        this._renderWithCulling(renderer);
      else {
        this._render(renderer);
        for (let i = 0, j = this.children.length; i < j; ++i)
          this.children[i].render(renderer);
      }
  }
  /**
   * Render the object using the WebGL renderer and advanced features.
   * @param renderer - The renderer
   */
  renderAdvanced(renderer) {
    const filters = this.filters, mask = this._mask;
    if (filters) {
      this._enabledFilters || (this._enabledFilters = []), this._enabledFilters.length = 0;
      for (let i = 0; i < filters.length; i++)
        filters[i].enabled && this._enabledFilters.push(filters[i]);
    }
    const flush = filters && this._enabledFilters?.length || mask && (!mask.isMaskData || mask.enabled && (mask.autoDetect || mask.type !== core.MASK_TYPES.NONE));
    if (flush && renderer.batch.flush(), filters && this._enabledFilters?.length && renderer.filter.push(this, this._enabledFilters), mask && renderer.mask.push(this, this._mask), this.cullable)
      this._renderWithCulling(renderer);
    else {
      this._render(renderer);
      for (let i = 0, j = this.children.length; i < j; ++i)
        this.children[i].render(renderer);
    }
    flush && renderer.batch.flush(), mask && renderer.mask.pop(this), filters && this._enabledFilters?.length && renderer.filter.pop();
  }
  /**
   * To be overridden by the subclasses.
   * @param _renderer - The renderer
   */
  _render(_renderer) {
  }
  /**
   * Removes all internal references and listeners as well as removes children from the display list.
   * Do not use a Container after calling `destroy`.
   * @param options - Options parameter. A boolean will act as if all options
   *  have been set to that value
   * @param {boolean} [options.children=false] - if set to true, all the children will have their destroy
   *  method called as well. 'options' will be passed on to those calls.
   * @param {boolean} [options.texture=false] - Only used for child Sprites if options.children is set to true
   *  Should it destroy the texture of the child sprite
   * @param {boolean} [options.baseTexture=false] - Only used for child Sprites if options.children is set to true
   *  Should it destroy the base texture of the child sprite
   */
  destroy(options) {
    super.destroy(), this.sortDirty = !1;
    const destroyChildren = typeof options == "boolean" ? options : options?.children, oldChildren = this.removeChildren(0, this.children.length);
    if (destroyChildren)
      for (let i = 0; i < oldChildren.length; ++i)
        oldChildren[i].destroy(options);
  }
  /** The width of the Container, setting this will actually modify the scale to achieve the value set. */
  get width() {
    return this.scale.x * this.getLocalBounds().width;
  }
  set width(value) {
    const width = this.getLocalBounds().width;
    width !== 0 ? this.scale.x = value / width : this.scale.x = 1, this._width = value;
  }
  /** The height of the Container, setting this will actually modify the scale to achieve the value set. */
  get height() {
    return this.scale.y * this.getLocalBounds().height;
  }
  set height(value) {
    const height = this.getLocalBounds().height;
    height !== 0 ? this.scale.y = value / height : this.scale.y = 1, this._height = value;
  }
};
_Container.defaultSortableChildren = !1;
let Container = _Container;
Container.prototype.containerUpdateTransform = Container.prototype.updateTransform;
exports.Container = Container;


},{"./DisplayObject.js":147,"@pixi/core":72}],147:[function(require,module,exports){
"use strict";
var core = require("@pixi/core"), Bounds = require("./Bounds.js");
class DisplayObject extends core.utils.EventEmitter {
  constructor() {
    super(), this.tempDisplayObjectParent = null, this.transform = new core.Transform(), this.alpha = 1, this.visible = !0, this.renderable = !0, this.cullable = !1, this.cullArea = null, this.parent = null, this.worldAlpha = 1, this._lastSortedIndex = 0, this._zIndex = 0, this.filterArea = null, this.filters = null, this._enabledFilters = null, this._bounds = new Bounds.Bounds(), this._localBounds = null, this._boundsID = 0, this._boundsRect = null, this._localBoundsRect = null, this._mask = null, this._maskRefCount = 0, this._destroyed = !1, this.isSprite = !1, this.isMask = !1;
  }
  /**
   * Mixes all enumerable properties and methods from a source object to DisplayObject.
   * @param source - The source of properties and methods to mix in.
   */
  static mixin(source) {
    const keys = Object.keys(source);
    for (let i = 0; i < keys.length; ++i) {
      const propertyName = keys[i];
      Object.defineProperty(
        DisplayObject.prototype,
        propertyName,
        Object.getOwnPropertyDescriptor(source, propertyName)
      );
    }
  }
  /**
   * Fired when this DisplayObject is added to a Container.
   * @instance
   * @event added
   * @param {PIXI.Container} container - The container added to.
   */
  /**
   * Fired when this DisplayObject is removed from a Container.
   * @instance
   * @event removed
   * @param {PIXI.Container} container - The container removed from.
   */
  /**
   * Fired when this DisplayObject is destroyed. This event is emitted once
   * destroy is finished.
   * @instance
   * @event destroyed
   */
  /** Readonly flag for destroyed display objects. */
  get destroyed() {
    return this._destroyed;
  }
  /** Recursively updates transform of all objects from the root to this one internal function for toLocal() */
  _recursivePostUpdateTransform() {
    this.parent ? (this.parent._recursivePostUpdateTransform(), this.transform.updateTransform(this.parent.transform)) : this.transform.updateTransform(this._tempDisplayObjectParent.transform);
  }
  /** Updates the object transform for rendering. TODO - Optimization pass! */
  updateTransform() {
    this._boundsID++, this.transform.updateTransform(this.parent.transform), this.worldAlpha = this.alpha * this.parent.worldAlpha;
  }
  /**
   * Calculates and returns the (world) bounds of the display object as a [Rectangle]{@link PIXI.Rectangle}.
   *
   * This method is expensive on containers with a large subtree (like the stage). This is because the bounds
   * of a container depend on its children's bounds, which recursively causes all bounds in the subtree to
   * be recalculated. The upside, however, is that calling `getBounds` once on a container will indeed update
   * the bounds of all children (the whole subtree, in fact). This side effect should be exploited by using
   * `displayObject._bounds.getRectangle()` when traversing through all the bounds in a scene graph. Otherwise,
   * calling `getBounds` on each object in a subtree will cause the total cost to increase quadratically as
   * its height increases.
   *
   * The transforms of all objects in a container's **subtree** and of all **ancestors** are updated.
   * The world bounds of all display objects in a container's **subtree** will also be recalculated.
   *
   * The `_bounds` object stores the last calculation of the bounds. You can use to entirely skip bounds
   * calculation if needed.
   *
   * ```js
   * const lastCalculatedBounds = displayObject._bounds.getRectangle(optionalRect);
   * ```
   *
   * Do know that usage of `getLocalBounds` can corrupt the `_bounds` of children (the whole subtree, actually). This
   * is a known issue that has not been solved. See [getLocalBounds]{@link PIXI.DisplayObject#getLocalBounds} for more
   * details.
   *
   * `getBounds` should be called with `skipUpdate` equal to `true` in a render() call. This is because the transforms
   * are guaranteed to be update-to-date. In fact, recalculating inside a render() call may cause corruption in certain
   * cases.
   * @param skipUpdate - Setting to `true` will stop the transforms of the scene graph from
   *  being updated. This means the calculation returned MAY be out of date BUT will give you a
   *  nice performance boost.
   * @param rect - Optional rectangle to store the result of the bounds calculation.
   * @returns - The minimum axis-aligned rectangle in world space that fits around this object.
   */
  getBounds(skipUpdate, rect) {
    return skipUpdate || (this.parent ? (this._recursivePostUpdateTransform(), this.updateTransform()) : (this.parent = this._tempDisplayObjectParent, this.updateTransform(), this.parent = null)), this._bounds.updateID !== this._boundsID && (this.calculateBounds(), this._bounds.updateID = this._boundsID), rect || (this._boundsRect || (this._boundsRect = new core.Rectangle()), rect = this._boundsRect), this._bounds.getRectangle(rect);
  }
  /**
   * Retrieves the local bounds of the displayObject as a rectangle object.
   * @param rect - Optional rectangle to store the result of the bounds calculation.
   * @returns - The rectangular bounding area.
   */
  getLocalBounds(rect) {
    rect || (this._localBoundsRect || (this._localBoundsRect = new core.Rectangle()), rect = this._localBoundsRect), this._localBounds || (this._localBounds = new Bounds.Bounds());
    const transformRef = this.transform, parentRef = this.parent;
    this.parent = null, this._tempDisplayObjectParent.worldAlpha = parentRef?.worldAlpha ?? 1, this.transform = this._tempDisplayObjectParent.transform;
    const worldBounds = this._bounds, worldBoundsID = this._boundsID;
    this._bounds = this._localBounds;
    const bounds = this.getBounds(!1, rect);
    return this.parent = parentRef, this.transform = transformRef, this._bounds = worldBounds, this._bounds.updateID += this._boundsID - worldBoundsID, bounds;
  }
  /**
   * Calculates the global position of the display object.
   * @param position - The world origin to calculate from.
   * @param point - A Point object in which to store the value, optional
   *  (otherwise will create a new Point).
   * @param skipUpdate - Should we skip the update transform.
   * @returns - A point object representing the position of this object.
   */
  toGlobal(position, point, skipUpdate = !1) {
    return skipUpdate || (this._recursivePostUpdateTransform(), this.parent ? this.displayObjectUpdateTransform() : (this.parent = this._tempDisplayObjectParent, this.displayObjectUpdateTransform(), this.parent = null)), this.worldTransform.apply(position, point);
  }
  /**
   * Calculates the local position of the display object relative to another point.
   * @param position - The world origin to calculate from.
   * @param from - The DisplayObject to calculate the global position from.
   * @param point - A Point object in which to store the value, optional
   *  (otherwise will create a new Point).
   * @param skipUpdate - Should we skip the update transform
   * @returns - A point object representing the position of this object
   */
  toLocal(position, from, point, skipUpdate) {
    return from && (position = from.toGlobal(position, point, skipUpdate)), skipUpdate || (this._recursivePostUpdateTransform(), this.parent ? this.displayObjectUpdateTransform() : (this.parent = this._tempDisplayObjectParent, this.displayObjectUpdateTransform(), this.parent = null)), this.worldTransform.applyInverse(position, point);
  }
  /**
   * Set the parent Container of this DisplayObject.
   * @param container - The Container to add this DisplayObject to.
   * @returns - The Container that this DisplayObject was added to.
   */
  setParent(container) {
    if (!container || !container.addChild)
      throw new Error("setParent: Argument must be a Container");
    return container.addChild(this), container;
  }
  /** Remove the DisplayObject from its parent Container. If the DisplayObject has no parent, do nothing. */
  removeFromParent() {
    this.parent?.removeChild(this);
  }
  /**
   * Convenience function to set the position, scale, skew and pivot at once.
   * @param x - The X position
   * @param y - The Y position
   * @param scaleX - The X scale value
   * @param scaleY - The Y scale value
   * @param rotation - The rotation
   * @param skewX - The X skew value
   * @param skewY - The Y skew value
   * @param pivotX - The X pivot value
   * @param pivotY - The Y pivot value
   * @returns - The DisplayObject instance
   */
  setTransform(x = 0, y = 0, scaleX = 1, scaleY = 1, rotation = 0, skewX = 0, skewY = 0, pivotX = 0, pivotY = 0) {
    return this.position.x = x, this.position.y = y, this.scale.x = scaleX || 1, this.scale.y = scaleY || 1, this.rotation = rotation, this.skew.x = skewX, this.skew.y = skewY, this.pivot.x = pivotX, this.pivot.y = pivotY, this;
  }
  /**
   * Base destroy method for generic display objects. This will automatically
   * remove the display object from its parent Container as well as remove
   * all current event listeners and internal references. Do not use a DisplayObject
   * after calling `destroy()`.
   * @param _options
   */
  destroy(_options) {
    this.removeFromParent(), this._destroyed = !0, this.transform = null, this.parent = null, this._bounds = null, this.mask = null, this.cullArea = null, this.filters = null, this.filterArea = null, this.hitArea = null, this.eventMode = "auto", this.interactiveChildren = !1, this.emit("destroyed"), this.removeAllListeners();
  }
  /**
   * @protected
   * @member {PIXI.Container}
   */
  get _tempDisplayObjectParent() {
    return this.tempDisplayObjectParent === null && (this.tempDisplayObjectParent = new TemporaryDisplayObject()), this.tempDisplayObjectParent;
  }
  /**
   * Used in Renderer, cacheAsBitmap and other places where you call an `updateTransform` on root.
   *
   * ```js
   * const cacheParent = elem.enableTempParent();
   * elem.updateTransform();
   * elem.disableTempParent(cacheParent);
   * ```
   * @returns - Current parent
   */
  enableTempParent() {
    const myParent = this.parent;
    return this.parent = this._tempDisplayObjectParent, myParent;
  }
  /**
   * Pair method for `enableTempParent`
   * @param cacheParent - Actual parent of element
   */
  disableTempParent(cacheParent) {
    this.parent = cacheParent;
  }
  /**
   * The position of the displayObject on the x axis relative to the local coordinates of the parent.
   * An alias to position.x
   */
  get x() {
    return this.position.x;
  }
  set x(value) {
    this.transform.position.x = value;
  }
  /**
   * The position of the displayObject on the y axis relative to the local coordinates of the parent.
   * An alias to position.y
   */
  get y() {
    return this.position.y;
  }
  set y(value) {
    this.transform.position.y = value;
  }
  /**
   * Current transform of the object based on world (parent) factors.
   * @readonly
   */
  get worldTransform() {
    return this.transform.worldTransform;
  }
  /**
   * Current transform of the object based on local factors: position, scale, other stuff.
   * @readonly
   */
  get localTransform() {
    return this.transform.localTransform;
  }
  /**
   * The coordinate of the object relative to the local coordinates of the parent.
   * @since 4.0.0
   */
  get position() {
    return this.transform.position;
  }
  set position(value) {
    this.transform.position.copyFrom(value);
  }
  /**
   * The scale factors of this object along the local coordinate axes.
   *
   * The default scale is (1, 1).
   * @since 4.0.0
   */
  get scale() {
    return this.transform.scale;
  }
  set scale(value) {
    this.transform.scale.copyFrom(value);
  }
  /**
   * The center of rotation, scaling, and skewing for this display object in its local space. The `position`
   * is the projection of `pivot` in the parent's local space.
   *
   * By default, the pivot is the origin (0, 0).
   * @since 4.0.0
   */
  get pivot() {
    return this.transform.pivot;
  }
  set pivot(value) {
    this.transform.pivot.copyFrom(value);
  }
  /**
   * The skew factor for the object in radians.
   * @since 4.0.0
   */
  get skew() {
    return this.transform.skew;
  }
  set skew(value) {
    this.transform.skew.copyFrom(value);
  }
  /**
   * The rotation of the object in radians.
   * 'rotation' and 'angle' have the same effect on a display object; rotation is in radians, angle is in degrees.
   */
  get rotation() {
    return this.transform.rotation;
  }
  set rotation(value) {
    this.transform.rotation = value;
  }
  /**
   * The angle of the object in degrees.
   * 'rotation' and 'angle' have the same effect on a display object; rotation is in radians, angle is in degrees.
   */
  get angle() {
    return this.transform.rotation * core.RAD_TO_DEG;
  }
  set angle(value) {
    this.transform.rotation = value * core.DEG_TO_RAD;
  }
  /**
   * The zIndex of the displayObject.
   *
   * If a container has the sortableChildren property set to true, children will be automatically
   * sorted by zIndex value; a higher value will mean it will be moved towards the end of the array,
   * and thus rendered on top of other display objects within the same container.
   * @see PIXI.Container#sortableChildren
   */
  get zIndex() {
    return this._zIndex;
  }
  set zIndex(value) {
    this._zIndex = value, this.parent && (this.parent.sortDirty = !0);
  }
  /**
   * Indicates if the object is globally visible.
   * @readonly
   */
  get worldVisible() {
    let item = this;
    do {
      if (!item.visible)
        return !1;
      item = item.parent;
    } while (item);
    return !0;
  }
  /**
   * Sets a mask for the displayObject. A mask is an object that limits the visibility of an
   * object to the shape of the mask applied to it. In PixiJS a regular mask must be a
   * {@link PIXI.Graphics} or a {@link PIXI.Sprite} object. This allows for much faster masking in canvas as it
   * utilities shape clipping. Furthermore, a mask of an object must be in the subtree of its parent.
   * Otherwise, `getLocalBounds` may calculate incorrect bounds, which makes the container's width and height wrong.
   * To remove a mask, set this property to `null`.
   *
   * For sprite mask both alpha and red channel are used. Black mask is the same as transparent mask.
   * @example
   * import { Graphics, Sprite } from 'pixi.js';
   *
   * const graphics = new Graphics();
   * graphics.beginFill(0xFF3300);
   * graphics.drawRect(50, 250, 100, 100);
   * graphics.endFill();
   *
   * const sprite = new Sprite(texture);
   * sprite.mask = graphics;
   * @todo At the moment, CanvasRenderer doesn't support Sprite as mask.
   */
  get mask() {
    return this._mask;
  }
  set mask(value) {
    if (this._mask !== value) {
      if (this._mask) {
        const maskObject = this._mask.isMaskData ? this._mask.maskObject : this._mask;
        maskObject && (maskObject._maskRefCount--, maskObject._maskRefCount === 0 && (maskObject.renderable = !0, maskObject.isMask = !1));
      }
      if (this._mask = value, this._mask) {
        const maskObject = this._mask.isMaskData ? this._mask.maskObject : this._mask;
        maskObject && (maskObject._maskRefCount === 0 && (maskObject.renderable = !1, maskObject.isMask = !0), maskObject._maskRefCount++);
      }
    }
  }
}
class TemporaryDisplayObject extends DisplayObject {
  constructor() {
    super(...arguments), this.sortDirty = null;
  }
}
DisplayObject.prototype.displayObjectUpdateTransform = DisplayObject.prototype.updateTransform;
exports.DisplayObject = DisplayObject;
exports.TemporaryDisplayObject = TemporaryDisplayObject;


},{"./Bounds.js":145,"@pixi/core":72}],148:[function(require,module,exports){
"use strict";
require("./settings.js");
var Bounds = require("./Bounds.js"), Container = require("./Container.js"), DisplayObject = require("./DisplayObject.js");
exports.Bounds = Bounds.Bounds;
exports.Container = Container.Container;
exports.DisplayObject = DisplayObject.DisplayObject;
exports.TemporaryDisplayObject = DisplayObject.TemporaryDisplayObject;


},{"./Bounds.js":145,"./Container.js":146,"./DisplayObject.js":147,"./settings.js":149}],149:[function(require,module,exports){
"use strict";
var core = require("@pixi/core"), Container = require("./Container.js");
Object.defineProperties(core.settings, {
  /**
   * Sets the default value for the container property 'sortableChildren'.
   * @static
   * @name SORTABLE_CHILDREN
   * @memberof PIXI.settings
   * @deprecated since 7.1.0
   * @type {boolean}
   * @see PIXI.Container.defaultSortableChildren
   */
  SORTABLE_CHILDREN: {
    get() {
      return Container.Container.defaultSortableChildren;
    },
    set(value) {
      core.utils.deprecation("7.1.0", "settings.SORTABLE_CHILDREN is deprecated, use Container.defaultSortableChildren"), Container.Container.defaultSortableChildren = value;
    }
  }
});
Object.defineProperty(exports, "settings", {
  enumerable: !0,
  get: function() {
    return core.settings;
  }
});


},{"./Container.js":146,"@pixi/core":72}],150:[function(require,module,exports){
"use strict";
var core = require("@pixi/core"), EventTicker = require("./EventTicker.js"), FederatedMouseEvent = require("./FederatedMouseEvent.js"), FederatedPointerEvent = require("./FederatedPointerEvent.js"), FederatedWheelEvent = require("./FederatedWheelEvent.js");
const PROPAGATION_LIMIT = 2048, tempHitLocation = new core.Point(), tempLocalMapping = new core.Point();
class EventBoundary {
  /**
   * @param rootTarget - The holder of the event boundary.
   */
  constructor(rootTarget) {
    this.dispatch = new core.utils.EventEmitter(), this.moveOnAll = !1, this.enableGlobalMoveEvents = !0, this.mappingState = {
      trackingData: {}
    }, this.eventPool = /* @__PURE__ */ new Map(), this._allInteractiveElements = [], this._hitElements = [], this._isPointerMoveEvent = !1, this.rootTarget = rootTarget, this.hitPruneFn = this.hitPruneFn.bind(this), this.hitTestFn = this.hitTestFn.bind(this), this.mapPointerDown = this.mapPointerDown.bind(this), this.mapPointerMove = this.mapPointerMove.bind(this), this.mapPointerOut = this.mapPointerOut.bind(this), this.mapPointerOver = this.mapPointerOver.bind(this), this.mapPointerUp = this.mapPointerUp.bind(this), this.mapPointerUpOutside = this.mapPointerUpOutside.bind(this), this.mapWheel = this.mapWheel.bind(this), this.mappingTable = {}, this.addEventMapping("pointerdown", this.mapPointerDown), this.addEventMapping("pointermove", this.mapPointerMove), this.addEventMapping("pointerout", this.mapPointerOut), this.addEventMapping("pointerleave", this.mapPointerOut), this.addEventMapping("pointerover", this.mapPointerOver), this.addEventMapping("pointerup", this.mapPointerUp), this.addEventMapping("pointerupoutside", this.mapPointerUpOutside), this.addEventMapping("wheel", this.mapWheel);
  }
  /**
   * Adds an event mapping for the event `type` handled by `fn`.
   *
   * Event mappings can be used to implement additional or custom events. They take an event
   * coming from the upstream scene (or directly from the {@link PIXI.EventSystem}) and dispatch new downstream events
   * generally trickling down and bubbling up to {@link PIXI.EventBoundary.rootTarget this.rootTarget}.
   *
   * To modify the semantics of existing events, the built-in mapping methods of EventBoundary should be overridden
   * instead.
   * @param type - The type of upstream event to map.
   * @param fn - The mapping method. The context of this function must be bound manually, if desired.
   */
  addEventMapping(type, fn) {
    this.mappingTable[type] || (this.mappingTable[type] = []), this.mappingTable[type].push({
      fn,
      priority: 0
    }), this.mappingTable[type].sort((a, b) => a.priority - b.priority);
  }
  /**
   * Dispatches the given event
   * @param e
   * @param type
   */
  dispatchEvent(e, type) {
    e.propagationStopped = !1, e.propagationImmediatelyStopped = !1, this.propagate(e, type), this.dispatch.emit(type || e.type, e);
  }
  /**
   * Maps the given upstream event through the event boundary and propagates it downstream.
   * @param e
   */
  mapEvent(e) {
    if (!this.rootTarget)
      return;
    const mappers = this.mappingTable[e.type];
    if (mappers)
      for (let i = 0, j = mappers.length; i < j; i++)
        mappers[i].fn(e);
    else
      console.warn(`[EventBoundary]: Event mapping not defined for ${e.type}`);
  }
  /**
   * Finds the DisplayObject that is the target of a event at the given coordinates.
   *
   * The passed (x,y) coordinates are in the world space above this event boundary.
   * @param x
   * @param y
   */
  hitTest(x, y) {
    EventTicker.EventsTicker.pauseUpdate = !0;
    const fn = this._isPointerMoveEvent && this.enableGlobalMoveEvents ? "hitTestMoveRecursive" : "hitTestRecursive", invertedPath = this[fn](
      this.rootTarget,
      this.rootTarget.eventMode,
      tempHitLocation.set(x, y),
      this.hitTestFn,
      this.hitPruneFn
    );
    return invertedPath && invertedPath[0];
  }
  /**
   * Propagate the passed event from from {@link PIXI.EventBoundary.rootTarget this.rootTarget} to its
   * target {@code e.target}.
   * @param e - The event to propagate.
   * @param type
   */
  propagate(e, type) {
    if (!e.target)
      return;
    const composedPath = e.composedPath();
    e.eventPhase = e.CAPTURING_PHASE;
    for (let i = 0, j = composedPath.length - 1; i < j; i++)
      if (e.currentTarget = composedPath[i], this.notifyTarget(e, type), e.propagationStopped || e.propagationImmediatelyStopped)
        return;
    if (e.eventPhase = e.AT_TARGET, e.currentTarget = e.target, this.notifyTarget(e, type), !(e.propagationStopped || e.propagationImmediatelyStopped)) {
      e.eventPhase = e.BUBBLING_PHASE;
      for (let i = composedPath.length - 2; i >= 0; i--)
        if (e.currentTarget = composedPath[i], this.notifyTarget(e, type), e.propagationStopped || e.propagationImmediatelyStopped)
          return;
    }
  }
  /**
   * Emits the event {@code e} to all interactive display objects. The event is propagated in the bubbling phase always.
   *
   * This is used in the `globalpointermove` event.
   * @param e - The emitted event.
   * @param type - The listeners to notify.
   * @param targets - The targets to notify.
   */
  all(e, type, targets = this._allInteractiveElements) {
    if (targets.length === 0)
      return;
    e.eventPhase = e.BUBBLING_PHASE;
    const events = Array.isArray(type) ? type : [type];
    for (let i = targets.length - 1; i >= 0; i--)
      events.forEach((event) => {
        e.currentTarget = targets[i], this.notifyTarget(e, event);
      });
  }
  /**
   * Finds the propagation path from {@link PIXI.EventBoundary.rootTarget rootTarget} to the passed
   * {@code target}. The last element in the path is {@code target}.
   * @param target
   */
  propagationPath(target) {
    const propagationPath = [target];
    for (let i = 0; i < PROPAGATION_LIMIT && target !== this.rootTarget; i++) {
      if (!target.parent)
        throw new Error("Cannot find propagation path to disconnected target");
      propagationPath.push(target.parent), target = target.parent;
    }
    return propagationPath.reverse(), propagationPath;
  }
  hitTestMoveRecursive(currentTarget, eventMode, location, testFn, pruneFn, ignore = !1) {
    let shouldReturn = !1;
    if (this._interactivePrune(currentTarget))
      return null;
    if ((currentTarget.eventMode === "dynamic" || eventMode === "dynamic") && (EventTicker.EventsTicker.pauseUpdate = !1), currentTarget.interactiveChildren && currentTarget.children) {
      const children = currentTarget.children;
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i], nestedHit = this.hitTestMoveRecursive(
          child,
          this._isInteractive(eventMode) ? eventMode : child.eventMode,
          location,
          testFn,
          pruneFn,
          ignore || pruneFn(currentTarget, location)
        );
        if (nestedHit) {
          if (nestedHit.length > 0 && !nestedHit[nestedHit.length - 1].parent)
            continue;
          const isInteractive = currentTarget.isInteractive();
          (nestedHit.length > 0 || isInteractive) && (isInteractive && this._allInteractiveElements.push(currentTarget), nestedHit.push(currentTarget)), this._hitElements.length === 0 && (this._hitElements = nestedHit), shouldReturn = !0;
        }
      }
    }
    const isInteractiveMode = this._isInteractive(eventMode), isInteractiveTarget = currentTarget.isInteractive();
    return isInteractiveMode && isInteractiveTarget && this._allInteractiveElements.push(currentTarget), ignore || this._hitElements.length > 0 ? null : shouldReturn ? this._hitElements : isInteractiveMode && !pruneFn(currentTarget, location) && testFn(currentTarget, location) ? isInteractiveTarget ? [currentTarget] : [] : null;
  }
  /**
   * Recursive implementation for {@link PIXI.EventBoundary.hitTest hitTest}.
   * @param currentTarget - The DisplayObject that is to be hit tested.
   * @param eventMode - The event mode for the `currentTarget` or one of its parents.
   * @param location - The location that is being tested for overlap.
   * @param testFn - Callback that determines whether the target passes hit testing. This callback
   *  can assume that `pruneFn` failed to prune the display object.
   * @param pruneFn - Callback that determiness whether the target and all of its children
   *  cannot pass the hit test. It is used as a preliminary optimization to prune entire subtrees
   *  of the scene graph.
   * @returns An array holding the hit testing target and all its ancestors in order. The first element
   *  is the target itself and the last is {@link PIXI.EventBoundary.rootTarget rootTarget}. This is the opposite
   *  order w.r.t. the propagation path. If no hit testing target is found, null is returned.
   */
  hitTestRecursive(currentTarget, eventMode, location, testFn, pruneFn) {
    if (this._interactivePrune(currentTarget) || pruneFn(currentTarget, location))
      return null;
    if ((currentTarget.eventMode === "dynamic" || eventMode === "dynamic") && (EventTicker.EventsTicker.pauseUpdate = !1), currentTarget.interactiveChildren && currentTarget.children) {
      const children = currentTarget.children;
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i], nestedHit = this.hitTestRecursive(
          child,
          this._isInteractive(eventMode) ? eventMode : child.eventMode,
          location,
          testFn,
          pruneFn
        );
        if (nestedHit) {
          if (nestedHit.length > 0 && !nestedHit[nestedHit.length - 1].parent)
            continue;
          const isInteractive = currentTarget.isInteractive();
          return (nestedHit.length > 0 || isInteractive) && nestedHit.push(currentTarget), nestedHit;
        }
      }
    }
    const isInteractiveMode = this._isInteractive(eventMode), isInteractiveTarget = currentTarget.isInteractive();
    return isInteractiveMode && testFn(currentTarget, location) ? isInteractiveTarget ? [currentTarget] : [] : null;
  }
  _isInteractive(int) {
    return int === "static" || int === "dynamic";
  }
  _interactivePrune(displayObject) {
    return !!(!displayObject || displayObject.isMask || !displayObject.visible || !displayObject.renderable || displayObject.eventMode === "none" || displayObject.eventMode === "passive" && !displayObject.interactiveChildren || displayObject.isMask);
  }
  /**
   * Checks whether the display object or any of its children cannot pass the hit test at all.
   *
   * {@link PIXI.EventBoundary}'s implementation uses the {@link PIXI.DisplayObject.hitArea hitArea}
   * and {@link PIXI.DisplayObject._mask} for pruning.
   * @param displayObject
   * @param location
   */
  hitPruneFn(displayObject, location) {
    if (displayObject.hitArea && (displayObject.worldTransform.applyInverse(location, tempLocalMapping), !displayObject.hitArea.contains(tempLocalMapping.x, tempLocalMapping.y)))
      return !0;
    if (displayObject._mask) {
      const maskObject = displayObject._mask.isMaskData ? displayObject._mask.maskObject : displayObject._mask;
      if (maskObject && !maskObject.containsPoint?.(location))
        return !0;
    }
    return !1;
  }
  /**
   * Checks whether the display object passes hit testing for the given location.
   * @param displayObject
   * @param location
   * @returns - Whether `displayObject` passes hit testing for `location`.
   */
  hitTestFn(displayObject, location) {
    return displayObject.eventMode === "passive" ? !1 : displayObject.hitArea ? !0 : displayObject.containsPoint ? displayObject.containsPoint(location) : !1;
  }
  /**
   * Notify all the listeners to the event's `currentTarget`.
   *
   * If the `currentTarget` contains the property `on<type>`, then it is called here,
   * simulating the behavior from version 6.x and prior.
   * @param e - The event passed to the target.
   * @param type
   */
  notifyTarget(e, type) {
    type = type ?? e.type;
    const handlerKey = `on${type}`;
    e.currentTarget[handlerKey]?.(e);
    const key = e.eventPhase === e.CAPTURING_PHASE || e.eventPhase === e.AT_TARGET ? `${type}capture` : type;
    this.notifyListeners(e, key), e.eventPhase === e.AT_TARGET && this.notifyListeners(e, type);
  }
  /**
   * Maps the upstream `pointerdown` events to a downstream `pointerdown` event.
   *
   * `touchstart`, `rightdown`, `mousedown` events are also dispatched for specific pointer types.
   * @param from
   */
  mapPointerDown(from) {
    if (!(from instanceof FederatedPointerEvent.FederatedPointerEvent)) {
      console.warn("EventBoundary cannot map a non-pointer event as a pointer event");
      return;
    }
    const e = this.createPointerEvent(from);
    if (this.dispatchEvent(e, "pointerdown"), e.pointerType === "touch")
      this.dispatchEvent(e, "touchstart");
    else if (e.pointerType === "mouse" || e.pointerType === "pen") {
      const isRightButton = e.button === 2;
      this.dispatchEvent(e, isRightButton ? "rightdown" : "mousedown");
    }
    const trackingData = this.trackingData(from.pointerId);
    trackingData.pressTargetsByButton[from.button] = e.composedPath(), this.freeEvent(e);
  }
  /**
   * Maps the upstream `pointermove` to downstream `pointerout`, `pointerover`, and `pointermove` events, in that order.
   *
   * The tracking data for the specific pointer has an updated `overTarget`. `mouseout`, `mouseover`,
   * `mousemove`, and `touchmove` events are fired as well for specific pointer types.
   * @param from - The upstream `pointermove` event.
   */
  mapPointerMove(from) {
    if (!(from instanceof FederatedPointerEvent.FederatedPointerEvent)) {
      console.warn("EventBoundary cannot map a non-pointer event as a pointer event");
      return;
    }
    this._allInteractiveElements.length = 0, this._hitElements.length = 0, this._isPointerMoveEvent = !0;
    const e = this.createPointerEvent(from);
    this._isPointerMoveEvent = !1;
    const isMouse = e.pointerType === "mouse" || e.pointerType === "pen", trackingData = this.trackingData(from.pointerId), outTarget = this.findMountedTarget(trackingData.overTargets);
    if (trackingData.overTargets?.length > 0 && outTarget !== e.target) {
      const outType = from.type === "mousemove" ? "mouseout" : "pointerout", outEvent = this.createPointerEvent(from, outType, outTarget);
      if (this.dispatchEvent(outEvent, "pointerout"), isMouse && this.dispatchEvent(outEvent, "mouseout"), !e.composedPath().includes(outTarget)) {
        const leaveEvent = this.createPointerEvent(from, "pointerleave", outTarget);
        for (leaveEvent.eventPhase = leaveEvent.AT_TARGET; leaveEvent.target && !e.composedPath().includes(leaveEvent.target); )
          leaveEvent.currentTarget = leaveEvent.target, this.notifyTarget(leaveEvent), isMouse && this.notifyTarget(leaveEvent, "mouseleave"), leaveEvent.target = leaveEvent.target.parent;
        this.freeEvent(leaveEvent);
      }
      this.freeEvent(outEvent);
    }
    if (outTarget !== e.target) {
      const overType = from.type === "mousemove" ? "mouseover" : "pointerover", overEvent = this.clonePointerEvent(e, overType);
      this.dispatchEvent(overEvent, "pointerover"), isMouse && this.dispatchEvent(overEvent, "mouseover");
      let overTargetAncestor = outTarget?.parent;
      for (; overTargetAncestor && overTargetAncestor !== this.rootTarget.parent && overTargetAncestor !== e.target; )
        overTargetAncestor = overTargetAncestor.parent;
      if (!overTargetAncestor || overTargetAncestor === this.rootTarget.parent) {
        const enterEvent = this.clonePointerEvent(e, "pointerenter");
        for (enterEvent.eventPhase = enterEvent.AT_TARGET; enterEvent.target && enterEvent.target !== outTarget && enterEvent.target !== this.rootTarget.parent; )
          enterEvent.currentTarget = enterEvent.target, this.notifyTarget(enterEvent), isMouse && this.notifyTarget(enterEvent, "mouseenter"), enterEvent.target = enterEvent.target.parent;
        this.freeEvent(enterEvent);
      }
      this.freeEvent(overEvent);
    }
    const allMethods = [], allowGlobalPointerEvents = this.enableGlobalMoveEvents ?? !0;
    this.moveOnAll ? allMethods.push("pointermove") : this.dispatchEvent(e, "pointermove"), allowGlobalPointerEvents && allMethods.push("globalpointermove"), e.pointerType === "touch" && (this.moveOnAll ? allMethods.splice(1, 0, "touchmove") : this.dispatchEvent(e, "touchmove"), allowGlobalPointerEvents && allMethods.push("globaltouchmove")), isMouse && (this.moveOnAll ? allMethods.splice(1, 0, "mousemove") : this.dispatchEvent(e, "mousemove"), allowGlobalPointerEvents && allMethods.push("globalmousemove"), this.cursor = e.target?.cursor), allMethods.length > 0 && this.all(e, allMethods), this._allInteractiveElements.length = 0, this._hitElements.length = 0, trackingData.overTargets = e.composedPath(), this.freeEvent(e);
  }
  /**
   * Maps the upstream `pointerover` to downstream `pointerover` and `pointerenter` events, in that order.
   *
   * The tracking data for the specific pointer gets a new `overTarget`.
   * @param from - The upstream `pointerover` event.
   */
  mapPointerOver(from) {
    if (!(from instanceof FederatedPointerEvent.FederatedPointerEvent)) {
      console.warn("EventBoundary cannot map a non-pointer event as a pointer event");
      return;
    }
    const trackingData = this.trackingData(from.pointerId), e = this.createPointerEvent(from), isMouse = e.pointerType === "mouse" || e.pointerType === "pen";
    this.dispatchEvent(e, "pointerover"), isMouse && this.dispatchEvent(e, "mouseover"), e.pointerType === "mouse" && (this.cursor = e.target?.cursor);
    const enterEvent = this.clonePointerEvent(e, "pointerenter");
    for (enterEvent.eventPhase = enterEvent.AT_TARGET; enterEvent.target && enterEvent.target !== this.rootTarget.parent; )
      enterEvent.currentTarget = enterEvent.target, this.notifyTarget(enterEvent), isMouse && this.notifyTarget(enterEvent, "mouseenter"), enterEvent.target = enterEvent.target.parent;
    trackingData.overTargets = e.composedPath(), this.freeEvent(e), this.freeEvent(enterEvent);
  }
  /**
   * Maps the upstream `pointerout` to downstream `pointerout`, `pointerleave` events, in that order.
   *
   * The tracking data for the specific pointer is cleared of a `overTarget`.
   * @param from - The upstream `pointerout` event.
   */
  mapPointerOut(from) {
    if (!(from instanceof FederatedPointerEvent.FederatedPointerEvent)) {
      console.warn("EventBoundary cannot map a non-pointer event as a pointer event");
      return;
    }
    const trackingData = this.trackingData(from.pointerId);
    if (trackingData.overTargets) {
      const isMouse = from.pointerType === "mouse" || from.pointerType === "pen", outTarget = this.findMountedTarget(trackingData.overTargets), outEvent = this.createPointerEvent(from, "pointerout", outTarget);
      this.dispatchEvent(outEvent), isMouse && this.dispatchEvent(outEvent, "mouseout");
      const leaveEvent = this.createPointerEvent(from, "pointerleave", outTarget);
      for (leaveEvent.eventPhase = leaveEvent.AT_TARGET; leaveEvent.target && leaveEvent.target !== this.rootTarget.parent; )
        leaveEvent.currentTarget = leaveEvent.target, this.notifyTarget(leaveEvent), isMouse && this.notifyTarget(leaveEvent, "mouseleave"), leaveEvent.target = leaveEvent.target.parent;
      trackingData.overTargets = null, this.freeEvent(outEvent), this.freeEvent(leaveEvent);
    }
    this.cursor = null;
  }
  /**
   * Maps the upstream `pointerup` event to downstream `pointerup`, `pointerupoutside`,
   * and `click`/`rightclick`/`pointertap` events, in that order.
   *
   * The `pointerupoutside` event bubbles from the original `pointerdown` target to the most specific
   * ancestor of the `pointerdown` and `pointerup` targets, which is also the `click` event's target. `touchend`,
   * `rightup`, `mouseup`, `touchendoutside`, `rightupoutside`, `mouseupoutside`, and `tap` are fired as well for
   * specific pointer types.
   * @param from - The upstream `pointerup` event.
   */
  mapPointerUp(from) {
    if (!(from instanceof FederatedPointerEvent.FederatedPointerEvent)) {
      console.warn("EventBoundary cannot map a non-pointer event as a pointer event");
      return;
    }
    const now = performance.now(), e = this.createPointerEvent(from);
    if (this.dispatchEvent(e, "pointerup"), e.pointerType === "touch")
      this.dispatchEvent(e, "touchend");
    else if (e.pointerType === "mouse" || e.pointerType === "pen") {
      const isRightButton = e.button === 2;
      this.dispatchEvent(e, isRightButton ? "rightup" : "mouseup");
    }
    const trackingData = this.trackingData(from.pointerId), pressTarget = this.findMountedTarget(trackingData.pressTargetsByButton[from.button]);
    let clickTarget = pressTarget;
    if (pressTarget && !e.composedPath().includes(pressTarget)) {
      let currentTarget = pressTarget;
      for (; currentTarget && !e.composedPath().includes(currentTarget); ) {
        if (e.currentTarget = currentTarget, this.notifyTarget(e, "pointerupoutside"), e.pointerType === "touch")
          this.notifyTarget(e, "touchendoutside");
        else if (e.pointerType === "mouse" || e.pointerType === "pen") {
          const isRightButton = e.button === 2;
          this.notifyTarget(e, isRightButton ? "rightupoutside" : "mouseupoutside");
        }
        currentTarget = currentTarget.parent;
      }
      delete trackingData.pressTargetsByButton[from.button], clickTarget = currentTarget;
    }
    if (clickTarget) {
      const clickEvent = this.clonePointerEvent(e, "click");
      clickEvent.target = clickTarget, clickEvent.path = null, trackingData.clicksByButton[from.button] || (trackingData.clicksByButton[from.button] = {
        clickCount: 0,
        target: clickEvent.target,
        timeStamp: now
      });
      const clickHistory = trackingData.clicksByButton[from.button];
      if (clickHistory.target === clickEvent.target && now - clickHistory.timeStamp < 200 ? ++clickHistory.clickCount : clickHistory.clickCount = 1, clickHistory.target = clickEvent.target, clickHistory.timeStamp = now, clickEvent.detail = clickHistory.clickCount, clickEvent.pointerType === "mouse") {
        const isRightButton = clickEvent.button === 2;
        this.dispatchEvent(clickEvent, isRightButton ? "rightclick" : "click");
      } else
        clickEvent.pointerType === "touch" && this.dispatchEvent(clickEvent, "tap");
      this.dispatchEvent(clickEvent, "pointertap"), this.freeEvent(clickEvent);
    }
    this.freeEvent(e);
  }
  /**
   * Maps the upstream `pointerupoutside` event to a downstream `pointerupoutside` event, bubbling from the original
   * `pointerdown` target to `rootTarget`.
   *
   * (The most specific ancestor of the `pointerdown` event and the `pointerup` event must the
   * `{@link PIXI.EventBoundary}'s root because the `pointerup` event occurred outside of the boundary.)
   *
   * `touchendoutside`, `mouseupoutside`, and `rightupoutside` events are fired as well for specific pointer
   * types. The tracking data for the specific pointer is cleared of a `pressTarget`.
   * @param from - The upstream `pointerupoutside` event.
   */
  mapPointerUpOutside(from) {
    if (!(from instanceof FederatedPointerEvent.FederatedPointerEvent)) {
      console.warn("EventBoundary cannot map a non-pointer event as a pointer event");
      return;
    }
    const trackingData = this.trackingData(from.pointerId), pressTarget = this.findMountedTarget(trackingData.pressTargetsByButton[from.button]), e = this.createPointerEvent(from);
    if (pressTarget) {
      let currentTarget = pressTarget;
      for (; currentTarget; )
        e.currentTarget = currentTarget, this.notifyTarget(e, "pointerupoutside"), e.pointerType === "touch" ? this.notifyTarget(e, "touchendoutside") : (e.pointerType === "mouse" || e.pointerType === "pen") && this.notifyTarget(e, e.button === 2 ? "rightupoutside" : "mouseupoutside"), currentTarget = currentTarget.parent;
      delete trackingData.pressTargetsByButton[from.button];
    }
    this.freeEvent(e);
  }
  /**
   * Maps the upstream `wheel` event to a downstream `wheel` event.
   * @param from - The upstream `wheel` event.
   */
  mapWheel(from) {
    if (!(from instanceof FederatedWheelEvent.FederatedWheelEvent)) {
      console.warn("EventBoundary cannot map a non-wheel event as a wheel event");
      return;
    }
    const wheelEvent = this.createWheelEvent(from);
    this.dispatchEvent(wheelEvent), this.freeEvent(wheelEvent);
  }
  /**
   * Finds the most specific event-target in the given propagation path that is still mounted in the scene graph.
   *
   * This is used to find the correct `pointerup` and `pointerout` target in the case that the original `pointerdown`
   * or `pointerover` target was unmounted from the scene graph.
   * @param propagationPath - The propagation path was valid in the past.
   * @returns - The most specific event-target still mounted at the same location in the scene graph.
   */
  findMountedTarget(propagationPath) {
    if (!propagationPath)
      return null;
    let currentTarget = propagationPath[0];
    for (let i = 1; i < propagationPath.length && propagationPath[i].parent === currentTarget; i++)
      currentTarget = propagationPath[i];
    return currentTarget;
  }
  /**
   * Creates an event whose {@code originalEvent} is {@code from}, with an optional `type` and `target` override.
   *
   * The event is allocated using {@link PIXI.EventBoundary#allocateEvent this.allocateEvent}.
   * @param from - The {@code originalEvent} for the returned event.
   * @param [type=from.type] - The type of the returned event.
   * @param target - The target of the returned event.
   */
  createPointerEvent(from, type, target) {
    const event = this.allocateEvent(FederatedPointerEvent.FederatedPointerEvent);
    return this.copyPointerData(from, event), this.copyMouseData(from, event), this.copyData(from, event), event.nativeEvent = from.nativeEvent, event.originalEvent = from, event.target = target ?? this.hitTest(event.global.x, event.global.y) ?? this._hitElements[0], typeof type == "string" && (event.type = type), event;
  }
  /**
   * Creates a wheel event whose {@code originalEvent} is {@code from}.
   *
   * The event is allocated using {@link PIXI.EventBoundary#allocateEvent this.allocateEvent}.
   * @param from - The upstream wheel event.
   */
  createWheelEvent(from) {
    const event = this.allocateEvent(FederatedWheelEvent.FederatedWheelEvent);
    return this.copyWheelData(from, event), this.copyMouseData(from, event), this.copyData(from, event), event.nativeEvent = from.nativeEvent, event.originalEvent = from, event.target = this.hitTest(event.global.x, event.global.y), event;
  }
  /**
   * Clones the event {@code from}, with an optional {@code type} override.
   *
   * The event is allocated using {@link PIXI.EventBoundary#allocateEvent this.allocateEvent}.
   * @param from - The event to clone.
   * @param [type=from.type] - The type of the returned event.
   */
  clonePointerEvent(from, type) {
    const event = this.allocateEvent(FederatedPointerEvent.FederatedPointerEvent);
    return event.nativeEvent = from.nativeEvent, event.originalEvent = from.originalEvent, this.copyPointerData(from, event), this.copyMouseData(from, event), this.copyData(from, event), event.target = from.target, event.path = from.composedPath().slice(), event.type = type ?? event.type, event;
  }
  /**
   * Copies wheel {@link PIXI.FederatedWheelEvent} data from {@code from} into {@code to}.
   *
   * The following properties are copied:
   * + deltaMode
   * + deltaX
   * + deltaY
   * + deltaZ
   * @param from
   * @param to
   */
  copyWheelData(from, to) {
    to.deltaMode = from.deltaMode, to.deltaX = from.deltaX, to.deltaY = from.deltaY, to.deltaZ = from.deltaZ;
  }
  /**
   * Copies pointer {@link PIXI.FederatedPointerEvent} data from {@code from} into {@code to}.
   *
   * The following properties are copied:
   * + pointerId
   * + width
   * + height
   * + isPrimary
   * + pointerType
   * + pressure
   * + tangentialPressure
   * + tiltX
   * + tiltY
   * @param from
   * @param to
   */
  copyPointerData(from, to) {
    from instanceof FederatedPointerEvent.FederatedPointerEvent && to instanceof FederatedPointerEvent.FederatedPointerEvent && (to.pointerId = from.pointerId, to.width = from.width, to.height = from.height, to.isPrimary = from.isPrimary, to.pointerType = from.pointerType, to.pressure = from.pressure, to.tangentialPressure = from.tangentialPressure, to.tiltX = from.tiltX, to.tiltY = from.tiltY, to.twist = from.twist);
  }
  /**
   * Copies mouse {@link PIXI.FederatedMouseEvent} data from {@code from} to {@code to}.
   *
   * The following properties are copied:
   * + altKey
   * + button
   * + buttons
   * + clientX
   * + clientY
   * + metaKey
   * + movementX
   * + movementY
   * + pageX
   * + pageY
   * + x
   * + y
   * + screen
   * + shiftKey
   * + global
   * @param from
   * @param to
   */
  copyMouseData(from, to) {
    from instanceof FederatedMouseEvent.FederatedMouseEvent && to instanceof FederatedMouseEvent.FederatedMouseEvent && (to.altKey = from.altKey, to.button = from.button, to.buttons = from.buttons, to.client.copyFrom(from.client), to.ctrlKey = from.ctrlKey, to.metaKey = from.metaKey, to.movement.copyFrom(from.movement), to.screen.copyFrom(from.screen), to.shiftKey = from.shiftKey, to.global.copyFrom(from.global));
  }
  /**
   * Copies base {@link PIXI.FederatedEvent} data from {@code from} into {@code to}.
   *
   * The following properties are copied:
   * + isTrusted
   * + srcElement
   * + timeStamp
   * + type
   * @param from - The event to copy data from.
   * @param to - The event to copy data into.
   */
  copyData(from, to) {
    to.isTrusted = from.isTrusted, to.srcElement = from.srcElement, to.timeStamp = performance.now(), to.type = from.type, to.detail = from.detail, to.view = from.view, to.which = from.which, to.layer.copyFrom(from.layer), to.page.copyFrom(from.page);
  }
  /**
   * @param id - The pointer ID.
   * @returns The tracking data stored for the given pointer. If no data exists, a blank
   *  state will be created.
   */
  trackingData(id) {
    return this.mappingState.trackingData[id] || (this.mappingState.trackingData[id] = {
      pressTargetsByButton: {},
      clicksByButton: {},
      overTarget: null
    }), this.mappingState.trackingData[id];
  }
  /**
   * Allocate a specific type of event from {@link PIXI.EventBoundary#eventPool this.eventPool}.
   *
   * This allocation is constructor-agnostic, as long as it only takes one argument - this event
   * boundary.
   * @param constructor - The event's constructor.
   */
  allocateEvent(constructor) {
    this.eventPool.has(constructor) || this.eventPool.set(constructor, []);
    const event = this.eventPool.get(constructor).pop() || new constructor(this);
    return event.eventPhase = event.NONE, event.currentTarget = null, event.path = null, event.target = null, event;
  }
  /**
   * Frees the event and puts it back into the event pool.
   *
   * It is illegal to reuse the event until it is allocated again, using `this.allocateEvent`.
   *
   * It is also advised that events not allocated from {@link PIXI.EventBoundary#allocateEvent this.allocateEvent}
   * not be freed. This is because of the possibility that the same event is freed twice, which can cause
   * it to be allocated twice & result in overwriting.
   * @param event - The event to be freed.
   * @throws Error if the event is managed by another event boundary.
   */
  freeEvent(event) {
    if (event.manager !== this)
      throw new Error("It is illegal to free an event not managed by this EventBoundary!");
    const constructor = event.constructor;
    this.eventPool.has(constructor) || this.eventPool.set(constructor, []), this.eventPool.get(constructor).push(event);
  }
  /**
   * Similar to {@link PIXI.EventEmitter.emit}, except it stops if the `propagationImmediatelyStopped` flag
   * is set on the event.
   * @param e - The event to call each listener with.
   * @param type - The event key.
   */
  notifyListeners(e, type) {
    const listeners = e.currentTarget._events[type];
    if (listeners && e.currentTarget.isInteractive())
      if ("fn" in listeners)
        listeners.once && e.currentTarget.removeListener(type, listeners.fn, void 0, !0), listeners.fn.call(listeners.context, e);
      else
        for (let i = 0, j = listeners.length; i < j && !e.propagationImmediatelyStopped; i++)
          listeners[i].once && e.currentTarget.removeListener(type, listeners[i].fn, void 0, !0), listeners[i].fn.call(listeners[i].context, e);
  }
}
exports.EventBoundary = EventBoundary;


},{"./EventTicker.js":152,"./FederatedMouseEvent.js":156,"./FederatedPointerEvent.js":157,"./FederatedWheelEvent.js":158,"@pixi/core":72}],151:[function(require,module,exports){
"use strict";
var core = require("@pixi/core"), EventBoundary = require("./EventBoundary.js"), EventTicker = require("./EventTicker.js"), FederatedPointerEvent = require("./FederatedPointerEvent.js"), FederatedWheelEvent = require("./FederatedWheelEvent.js");
const MOUSE_POINTER_ID = 1, TOUCH_TO_POINTER = {
  touchstart: "pointerdown",
  touchend: "pointerup",
  touchendoutside: "pointerupoutside",
  touchmove: "pointermove",
  touchcancel: "pointercancel"
}, _EventSystem = class _EventSystem2 {
  /**
   * @param {PIXI.Renderer} renderer
   */
  constructor(renderer) {
    this.supportsTouchEvents = "ontouchstart" in globalThis, this.supportsPointerEvents = !!globalThis.PointerEvent, this.domElement = null, this.resolution = 1, this.renderer = renderer, this.rootBoundary = new EventBoundary.EventBoundary(null), EventTicker.EventsTicker.init(this), this.autoPreventDefault = !0, this.eventsAdded = !1, this.rootPointerEvent = new FederatedPointerEvent.FederatedPointerEvent(null), this.rootWheelEvent = new FederatedWheelEvent.FederatedWheelEvent(null), this.cursorStyles = {
      default: "inherit",
      pointer: "pointer"
    }, this.features = new Proxy({ ..._EventSystem2.defaultEventFeatures }, {
      set: (target, key, value) => (key === "globalMove" && (this.rootBoundary.enableGlobalMoveEvents = value), target[key] = value, !0)
    }), this.onPointerDown = this.onPointerDown.bind(this), this.onPointerMove = this.onPointerMove.bind(this), this.onPointerUp = this.onPointerUp.bind(this), this.onPointerOverOut = this.onPointerOverOut.bind(this), this.onWheel = this.onWheel.bind(this);
  }
  /**
   * The default interaction mode for all display objects.
   * @see PIXI.DisplayObject.eventMode
   * @type {PIXI.EventMode}
   * @readonly
   * @since 7.2.0
   */
  static get defaultEventMode() {
    return this._defaultEventMode;
  }
  /**
   * Runner init called, view is available at this point.
   * @ignore
   */
  init(options) {
    const { view, resolution } = this.renderer;
    this.setTargetElement(view), this.resolution = resolution, _EventSystem2._defaultEventMode = options.eventMode ?? "auto", Object.assign(this.features, options.eventFeatures ?? {}), this.rootBoundary.enableGlobalMoveEvents = this.features.globalMove;
  }
  /**
   * Handle changing resolution.
   * @ignore
   */
  resolutionChange(resolution) {
    this.resolution = resolution;
  }
  /** Destroys all event listeners and detaches the renderer. */
  destroy() {
    this.setTargetElement(null), this.renderer = null;
  }
  /**
   * Sets the current cursor mode, handling any callbacks or CSS style changes.
   * @param mode - cursor mode, a key from the cursorStyles dictionary
   */
  setCursor(mode) {
    mode = mode || "default";
    let applyStyles = !0;
    if (globalThis.OffscreenCanvas && this.domElement instanceof OffscreenCanvas && (applyStyles = !1), this.currentCursor === mode)
      return;
    this.currentCursor = mode;
    const style = this.cursorStyles[mode];
    if (style)
      switch (typeof style) {
        case "string":
          applyStyles && (this.domElement.style.cursor = style);
          break;
        case "function":
          style(mode);
          break;
        case "object":
          applyStyles && Object.assign(this.domElement.style, style);
          break;
      }
    else
      applyStyles && typeof mode == "string" && !Object.prototype.hasOwnProperty.call(this.cursorStyles, mode) && (this.domElement.style.cursor = mode);
  }
  /**
   * The global pointer event.
   * Useful for getting the pointer position without listening to events.
   * @since 7.2.0
   */
  get pointer() {
    return this.rootPointerEvent;
  }
  /**
   * Event handler for pointer down events on {@link PIXI.EventSystem#domElement this.domElement}.
   * @param nativeEvent - The native mouse/pointer/touch event.
   */
  onPointerDown(nativeEvent) {
    if (!this.features.click)
      return;
    this.rootBoundary.rootTarget = this.renderer.lastObjectRendered;
    const events = this.normalizeToPointerData(nativeEvent);
    this.autoPreventDefault && events[0].isNormalized && (nativeEvent.cancelable || !("cancelable" in nativeEvent)) && nativeEvent.preventDefault();
    for (let i = 0, j = events.length; i < j; i++) {
      const nativeEvent2 = events[i], federatedEvent = this.bootstrapEvent(this.rootPointerEvent, nativeEvent2);
      this.rootBoundary.mapEvent(federatedEvent);
    }
    this.setCursor(this.rootBoundary.cursor);
  }
  /**
   * Event handler for pointer move events on on {@link PIXI.EventSystem#domElement this.domElement}.
   * @param nativeEvent - The native mouse/pointer/touch events.
   */
  onPointerMove(nativeEvent) {
    if (!this.features.move)
      return;
    this.rootBoundary.rootTarget = this.renderer.lastObjectRendered, EventTicker.EventsTicker.pointerMoved();
    const normalizedEvents = this.normalizeToPointerData(nativeEvent);
    for (let i = 0, j = normalizedEvents.length; i < j; i++) {
      const event = this.bootstrapEvent(this.rootPointerEvent, normalizedEvents[i]);
      this.rootBoundary.mapEvent(event);
    }
    this.setCursor(this.rootBoundary.cursor);
  }
  /**
   * Event handler for pointer up events on {@link PIXI.EventSystem#domElement this.domElement}.
   * @param nativeEvent - The native mouse/pointer/touch event.
   */
  onPointerUp(nativeEvent) {
    if (!this.features.click)
      return;
    this.rootBoundary.rootTarget = this.renderer.lastObjectRendered;
    let target = nativeEvent.target;
    nativeEvent.composedPath && nativeEvent.composedPath().length > 0 && (target = nativeEvent.composedPath()[0]);
    const outside = target !== this.domElement ? "outside" : "", normalizedEvents = this.normalizeToPointerData(nativeEvent);
    for (let i = 0, j = normalizedEvents.length; i < j; i++) {
      const event = this.bootstrapEvent(this.rootPointerEvent, normalizedEvents[i]);
      event.type += outside, this.rootBoundary.mapEvent(event);
    }
    this.setCursor(this.rootBoundary.cursor);
  }
  /**
   * Event handler for pointer over & out events on {@link PIXI.EventSystem#domElement this.domElement}.
   * @param nativeEvent - The native mouse/pointer/touch event.
   */
  onPointerOverOut(nativeEvent) {
    if (!this.features.click)
      return;
    this.rootBoundary.rootTarget = this.renderer.lastObjectRendered;
    const normalizedEvents = this.normalizeToPointerData(nativeEvent);
    for (let i = 0, j = normalizedEvents.length; i < j; i++) {
      const event = this.bootstrapEvent(this.rootPointerEvent, normalizedEvents[i]);
      this.rootBoundary.mapEvent(event);
    }
    this.setCursor(this.rootBoundary.cursor);
  }
  /**
   * Passive handler for `wheel` events on {@link PIXI.EventSystem.domElement this.domElement}.
   * @param nativeEvent - The native wheel event.
   */
  onWheel(nativeEvent) {
    if (!this.features.wheel)
      return;
    const wheelEvent = this.normalizeWheelEvent(nativeEvent);
    this.rootBoundary.rootTarget = this.renderer.lastObjectRendered, this.rootBoundary.mapEvent(wheelEvent);
  }
  /**
   * Sets the {@link PIXI.EventSystem#domElement domElement} and binds event listeners.
   *
   * To deregister the current DOM element without setting a new one, pass {@code null}.
   * @param element - The new DOM element.
   */
  setTargetElement(element) {
    this.removeEvents(), this.domElement = element, EventTicker.EventsTicker.domElement = element, this.addEvents();
  }
  /** Register event listeners on {@link PIXI.Renderer#domElement this.domElement}. */
  addEvents() {
    if (this.eventsAdded || !this.domElement)
      return;
    EventTicker.EventsTicker.addTickerListener();
    const style = this.domElement.style;
    style && (globalThis.navigator.msPointerEnabled ? (style.msContentZooming = "none", style.msTouchAction = "none") : this.supportsPointerEvents && (style.touchAction = "none")), this.supportsPointerEvents ? (globalThis.document.addEventListener("pointermove", this.onPointerMove, !0), this.domElement.addEventListener("pointerdown", this.onPointerDown, !0), this.domElement.addEventListener("pointerleave", this.onPointerOverOut, !0), this.domElement.addEventListener("pointerover", this.onPointerOverOut, !0), globalThis.addEventListener("pointerup", this.onPointerUp, !0)) : (globalThis.document.addEventListener("mousemove", this.onPointerMove, !0), this.domElement.addEventListener("mousedown", this.onPointerDown, !0), this.domElement.addEventListener("mouseout", this.onPointerOverOut, !0), this.domElement.addEventListener("mouseover", this.onPointerOverOut, !0), globalThis.addEventListener("mouseup", this.onPointerUp, !0), this.supportsTouchEvents && (this.domElement.addEventListener("touchstart", this.onPointerDown, !0), this.domElement.addEventListener("touchend", this.onPointerUp, !0), this.domElement.addEventListener("touchmove", this.onPointerMove, !0))), this.domElement.addEventListener("wheel", this.onWheel, {
      passive: !0,
      capture: !0
    }), this.eventsAdded = !0;
  }
  /** Unregister event listeners on {@link PIXI.EventSystem#domElement this.domElement}. */
  removeEvents() {
    if (!this.eventsAdded || !this.domElement)
      return;
    EventTicker.EventsTicker.removeTickerListener();
    const style = this.domElement.style;
    globalThis.navigator.msPointerEnabled ? (style.msContentZooming = "", style.msTouchAction = "") : this.supportsPointerEvents && (style.touchAction = ""), this.supportsPointerEvents ? (globalThis.document.removeEventListener("pointermove", this.onPointerMove, !0), this.domElement.removeEventListener("pointerdown", this.onPointerDown, !0), this.domElement.removeEventListener("pointerleave", this.onPointerOverOut, !0), this.domElement.removeEventListener("pointerover", this.onPointerOverOut, !0), globalThis.removeEventListener("pointerup", this.onPointerUp, !0)) : (globalThis.document.removeEventListener("mousemove", this.onPointerMove, !0), this.domElement.removeEventListener("mousedown", this.onPointerDown, !0), this.domElement.removeEventListener("mouseout", this.onPointerOverOut, !0), this.domElement.removeEventListener("mouseover", this.onPointerOverOut, !0), globalThis.removeEventListener("mouseup", this.onPointerUp, !0), this.supportsTouchEvents && (this.domElement.removeEventListener("touchstart", this.onPointerDown, !0), this.domElement.removeEventListener("touchend", this.onPointerUp, !0), this.domElement.removeEventListener("touchmove", this.onPointerMove, !0))), this.domElement.removeEventListener("wheel", this.onWheel, !0), this.domElement = null, this.eventsAdded = !1;
  }
  /**
   * Maps x and y coords from a DOM object and maps them correctly to the PixiJS view. The
   * resulting value is stored in the point. This takes into account the fact that the DOM
   * element could be scaled and positioned anywhere on the screen.
   * @param  {PIXI.IPointData} point - the point that the result will be stored in
   * @param  {number} x - the x coord of the position to map
   * @param  {number} y - the y coord of the position to map
   */
  mapPositionToPoint(point, x, y) {
    const rect = this.domElement.isConnected ? this.domElement.getBoundingClientRect() : {
      x: 0,
      y: 0,
      width: this.domElement.width,
      height: this.domElement.height,
      left: 0,
      top: 0
    }, resolutionMultiplier = 1 / this.resolution;
    point.x = (x - rect.left) * (this.domElement.width / rect.width) * resolutionMultiplier, point.y = (y - rect.top) * (this.domElement.height / rect.height) * resolutionMultiplier;
  }
  /**
   * Ensures that the original event object contains all data that a regular pointer event would have
   * @param event - The original event data from a touch or mouse event
   * @returns An array containing a single normalized pointer event, in the case of a pointer
   *  or mouse event, or a multiple normalized pointer events if there are multiple changed touches
   */
  normalizeToPointerData(event) {
    const normalizedEvents = [];
    if (this.supportsTouchEvents && event instanceof TouchEvent)
      for (let i = 0, li = event.changedTouches.length; i < li; i++) {
        const touch = event.changedTouches[i];
        typeof touch.button > "u" && (touch.button = 0), typeof touch.buttons > "u" && (touch.buttons = 1), typeof touch.isPrimary > "u" && (touch.isPrimary = event.touches.length === 1 && event.type === "touchstart"), typeof touch.width > "u" && (touch.width = touch.radiusX || 1), typeof touch.height > "u" && (touch.height = touch.radiusY || 1), typeof touch.tiltX > "u" && (touch.tiltX = 0), typeof touch.tiltY > "u" && (touch.tiltY = 0), typeof touch.pointerType > "u" && (touch.pointerType = "touch"), typeof touch.pointerId > "u" && (touch.pointerId = touch.identifier || 0), typeof touch.pressure > "u" && (touch.pressure = touch.force || 0.5), typeof touch.twist > "u" && (touch.twist = 0), typeof touch.tangentialPressure > "u" && (touch.tangentialPressure = 0), typeof touch.layerX > "u" && (touch.layerX = touch.offsetX = touch.clientX), typeof touch.layerY > "u" && (touch.layerY = touch.offsetY = touch.clientY), touch.isNormalized = !0, touch.type = event.type, normalizedEvents.push(touch);
      }
    else if (!globalThis.MouseEvent || event instanceof MouseEvent && (!this.supportsPointerEvents || !(event instanceof globalThis.PointerEvent))) {
      const tempEvent = event;
      typeof tempEvent.isPrimary > "u" && (tempEvent.isPrimary = !0), typeof tempEvent.width > "u" && (tempEvent.width = 1), typeof tempEvent.height > "u" && (tempEvent.height = 1), typeof tempEvent.tiltX > "u" && (tempEvent.tiltX = 0), typeof tempEvent.tiltY > "u" && (tempEvent.tiltY = 0), typeof tempEvent.pointerType > "u" && (tempEvent.pointerType = "mouse"), typeof tempEvent.pointerId > "u" && (tempEvent.pointerId = MOUSE_POINTER_ID), typeof tempEvent.pressure > "u" && (tempEvent.pressure = 0.5), typeof tempEvent.twist > "u" && (tempEvent.twist = 0), typeof tempEvent.tangentialPressure > "u" && (tempEvent.tangentialPressure = 0), tempEvent.isNormalized = !0, normalizedEvents.push(tempEvent);
    } else
      normalizedEvents.push(event);
    return normalizedEvents;
  }
  /**
   * Normalizes the native {@link https://w3c.github.io/uievents/#interface-wheelevent WheelEvent}.
   *
   * The returned {@link PIXI.FederatedWheelEvent} is a shared instance. It will not persist across
   * multiple native wheel events.
   * @param nativeEvent - The native wheel event that occurred on the canvas.
   * @returns A federated wheel event.
   */
  normalizeWheelEvent(nativeEvent) {
    const event = this.rootWheelEvent;
    return this.transferMouseData(event, nativeEvent), event.deltaX = nativeEvent.deltaX, event.deltaY = nativeEvent.deltaY, event.deltaZ = nativeEvent.deltaZ, event.deltaMode = nativeEvent.deltaMode, this.mapPositionToPoint(event.screen, nativeEvent.clientX, nativeEvent.clientY), event.global.copyFrom(event.screen), event.offset.copyFrom(event.screen), event.nativeEvent = nativeEvent, event.type = nativeEvent.type, event;
  }
  /**
   * Normalizes the `nativeEvent` into a federateed {@link PIXI.FederatedPointerEvent}.
   * @param event
   * @param nativeEvent
   */
  bootstrapEvent(event, nativeEvent) {
    return event.originalEvent = null, event.nativeEvent = nativeEvent, event.pointerId = nativeEvent.pointerId, event.width = nativeEvent.width, event.height = nativeEvent.height, event.isPrimary = nativeEvent.isPrimary, event.pointerType = nativeEvent.pointerType, event.pressure = nativeEvent.pressure, event.tangentialPressure = nativeEvent.tangentialPressure, event.tiltX = nativeEvent.tiltX, event.tiltY = nativeEvent.tiltY, event.twist = nativeEvent.twist, this.transferMouseData(event, nativeEvent), this.mapPositionToPoint(event.screen, nativeEvent.clientX, nativeEvent.clientY), event.global.copyFrom(event.screen), event.offset.copyFrom(event.screen), event.isTrusted = nativeEvent.isTrusted, event.type === "pointerleave" && (event.type = "pointerout"), event.type.startsWith("mouse") && (event.type = event.type.replace("mouse", "pointer")), event.type.startsWith("touch") && (event.type = TOUCH_TO_POINTER[event.type] || event.type), event;
  }
  /**
   * Transfers base & mouse event data from the {@code nativeEvent} to the federated event.
   * @param event
   * @param nativeEvent
   */
  transferMouseData(event, nativeEvent) {
    event.isTrusted = nativeEvent.isTrusted, event.srcElement = nativeEvent.srcElement, event.timeStamp = performance.now(), event.type = nativeEvent.type, event.altKey = nativeEvent.altKey, event.button = nativeEvent.button, event.buttons = nativeEvent.buttons, event.client.x = nativeEvent.clientX, event.client.y = nativeEvent.clientY, event.ctrlKey = nativeEvent.ctrlKey, event.metaKey = nativeEvent.metaKey, event.movement.x = nativeEvent.movementX, event.movement.y = nativeEvent.movementY, event.page.x = nativeEvent.pageX, event.page.y = nativeEvent.pageY, event.relatedTarget = null, event.shiftKey = nativeEvent.shiftKey;
  }
};
_EventSystem.extension = {
  name: "events",
  type: [
    core.ExtensionType.RendererSystem,
    core.ExtensionType.CanvasRendererSystem
  ]
}, /**
* The event features that are enabled by the EventSystem
* This option only is available when using **@pixi/events** package
* (included in the **pixi.js** and **pixi.js-legacy** bundle), otherwise it will be ignored.
* @since 7.2.0
*/
_EventSystem.defaultEventFeatures = {
  move: !0,
  globalMove: !0,
  click: !0,
  wheel: !0
};
let EventSystem = _EventSystem;
core.extensions.add(EventSystem);
exports.EventSystem = EventSystem;


},{"./EventBoundary.js":150,"./EventTicker.js":152,"./FederatedPointerEvent.js":157,"./FederatedWheelEvent.js":158,"@pixi/core":72}],152:[function(require,module,exports){
"use strict";
var core = require("@pixi/core");
class EventsTickerClass {
  constructor() {
    this.interactionFrequency = 10, this._deltaTime = 0, this._didMove = !1, this.tickerAdded = !1, this._pauseUpdate = !0;
  }
  /**
   * Initializes the event ticker.
   * @param events - The event system.
   */
  init(events) {
    this.removeTickerListener(), this.events = events, this.interactionFrequency = 10, this._deltaTime = 0, this._didMove = !1, this.tickerAdded = !1, this._pauseUpdate = !0;
  }
  /** Whether to pause the update checks or not. */
  get pauseUpdate() {
    return this._pauseUpdate;
  }
  set pauseUpdate(paused) {
    this._pauseUpdate = paused;
  }
  /** Adds the ticker listener. */
  addTickerListener() {
    this.tickerAdded || !this.domElement || (core.Ticker.system.add(this.tickerUpdate, this, core.UPDATE_PRIORITY.INTERACTION), this.tickerAdded = !0);
  }
  /** Removes the ticker listener. */
  removeTickerListener() {
    this.tickerAdded && (core.Ticker.system.remove(this.tickerUpdate, this), this.tickerAdded = !1);
  }
  /** Sets flag to not fire extra events when the user has already moved there mouse */
  pointerMoved() {
    this._didMove = !0;
  }
  /** Updates the state of interactive objects. */
  update() {
    if (!this.domElement || this._pauseUpdate)
      return;
    if (this._didMove) {
      this._didMove = !1;
      return;
    }
    const rootPointerEvent = this.events.rootPointerEvent;
    this.events.supportsTouchEvents && rootPointerEvent.pointerType === "touch" || globalThis.document.dispatchEvent(new PointerEvent("pointermove", {
      clientX: rootPointerEvent.clientX,
      clientY: rootPointerEvent.clientY
    }));
  }
  /**
   * Updates the state of interactive objects if at least {@link interactionFrequency}
   * milliseconds have passed since the last invocation.
   *
   * Invoked by a throttled ticker update from {@link PIXI.Ticker.system}.
   * @param deltaTime - time delta since the last call
   */
  tickerUpdate(deltaTime) {
    this._deltaTime += deltaTime, !(this._deltaTime < this.interactionFrequency) && (this._deltaTime = 0, this.update());
  }
}
const EventsTicker = new EventsTickerClass();
exports.EventsTicker = EventsTicker;


},{"@pixi/core":72}],153:[function(require,module,exports){
"use strict";
var core = require("@pixi/core");
class FederatedEvent {
  /**
   * @param manager - The event boundary which manages this event. Propagation can only occur
   *  within the boundary's jurisdiction.
   */
  constructor(manager) {
    this.bubbles = !0, this.cancelBubble = !0, this.cancelable = !1, this.composed = !1, this.defaultPrevented = !1, this.eventPhase = FederatedEvent.prototype.NONE, this.propagationStopped = !1, this.propagationImmediatelyStopped = !1, this.layer = new core.Point(), this.page = new core.Point(), this.NONE = 0, this.CAPTURING_PHASE = 1, this.AT_TARGET = 2, this.BUBBLING_PHASE = 3, this.manager = manager;
  }
  /** @readonly */
  get layerX() {
    return this.layer.x;
  }
  /** @readonly */
  get layerY() {
    return this.layer.y;
  }
  /** @readonly */
  get pageX() {
    return this.page.x;
  }
  /** @readonly */
  get pageY() {
    return this.page.y;
  }
  /**
   * Fallback for the deprecated @code{PIXI.InteractionEvent.data}.
   * @deprecated since 7.0.0
   */
  get data() {
    return this;
  }
  /** The propagation path for this event. Alias for {@link PIXI.EventBoundary.propagationPath}. */
  composedPath() {
    return this.manager && (!this.path || this.path[this.path.length - 1] !== this.target) && (this.path = this.target ? this.manager.propagationPath(this.target) : []), this.path;
  }
  /**
   * Unimplemented method included for implementing the DOM interface {@code Event}. It will throw an {@code Error}.
   * @deprecated
   * @param _type
   * @param _bubbles
   * @param _cancelable
   */
  initEvent(_type, _bubbles, _cancelable) {
    throw new Error("initEvent() is a legacy DOM API. It is not implemented in the Federated Events API.");
  }
  /**
   * Unimplemented method included for implementing the DOM interface {@code UIEvent}. It will throw an {@code Error}.
   * @deprecated
   * @param _typeArg
   * @param _bubblesArg
   * @param _cancelableArg
   * @param _viewArg
   * @param _detailArg
   */
  initUIEvent(_typeArg, _bubblesArg, _cancelableArg, _viewArg, _detailArg) {
    throw new Error("initUIEvent() is a legacy DOM API. It is not implemented in the Federated Events API.");
  }
  /** Prevent default behavior of PixiJS and the user agent. */
  preventDefault() {
    this.nativeEvent instanceof Event && this.nativeEvent.cancelable && this.nativeEvent.preventDefault(), this.defaultPrevented = !0;
  }
  /**
   * Stop this event from propagating to any addition listeners, including on the
   * {@link PIXI.FederatedEventTarget.currentTarget currentTarget} and also the following
   * event targets on the propagation path.
   */
  stopImmediatePropagation() {
    this.propagationImmediatelyStopped = !0;
  }
  /**
   * Stop this event from propagating to the next {@link PIXI.FederatedEventTarget}. The rest of the listeners
   * on the {@link PIXI.FederatedEventTarget.currentTarget currentTarget} will still be notified.
   */
  stopPropagation() {
    this.propagationStopped = !0;
  }
}
exports.FederatedEvent = FederatedEvent;


},{"@pixi/core":72}],154:[function(require,module,exports){
"use strict";


},{}],155:[function(require,module,exports){
"use strict";
var core = require("@pixi/core"), display = require("@pixi/display"), EventSystem = require("./EventSystem.js"), FederatedEvent = require("./FederatedEvent.js");
function convertEventModeToInteractiveMode(mode) {
  return mode === "dynamic" || mode === "static";
}
const FederatedDisplayObject = {
  /**
   * Property-based event handler for the `click` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onclick = (event) => {
   *  //some function here that happens on click
   * }
   */
  onclick: null,
  /**
   * Property-based event handler for the `mousedown` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onmousedown = (event) => {
   *  //some function here that happens on mousedown
   * }
   */
  onmousedown: null,
  /**
   * Property-based event handler for the `mouseenter` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onmouseenter = (event) => {
   *  //some function here that happens on mouseenter
   * }
   */
  onmouseenter: null,
  /**
   * Property-based event handler for the `mouseleave` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onmouseleave = (event) => {
   *  //some function here that happens on mouseleave
   * }
   */
  onmouseleave: null,
  /**
   * Property-based event handler for the `mousemove` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onmousemove = (event) => {
   *  //some function here that happens on mousemove
   * }
   */
  onmousemove: null,
  /**
   * Property-based event handler for the `globalmousemove` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onglobalmousemove = (event) => {
   *  //some function here that happens on globalmousemove
   * }
   */
  onglobalmousemove: null,
  /**
   * Property-based event handler for the `mouseout` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onmouseout = (event) => {
   *  //some function here that happens on mouseout
   * }
   */
  onmouseout: null,
  /**
   * Property-based event handler for the `mouseover` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onmouseover = (event) => {
   *  //some function here that happens on mouseover
   * }
   */
  onmouseover: null,
  /**
   * Property-based event handler for the `mouseup` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onmouseup = (event) => {
   *  //some function here that happens on mouseup
   * }
   */
  onmouseup: null,
  /**
   * Property-based event handler for the `mouseupoutside` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onmouseupoutside = (event) => {
   *  //some function here that happens on mouseupoutside
   * }
   */
  onmouseupoutside: null,
  /**
   * Property-based event handler for the `pointercancel` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onpointercancel = (event) => {
   *  //some function here that happens on pointercancel
   * }
   */
  onpointercancel: null,
  /**
   * Property-based event handler for the `pointerdown` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onpointerdown = (event) => {
   *  //some function here that happens on pointerdown
   * }
   */
  onpointerdown: null,
  /**
   * Property-based event handler for the `pointerenter` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onpointerenter = (event) => {
   *  //some function here that happens on pointerenter
   * }
   */
  onpointerenter: null,
  /**
   * Property-based event handler for the `pointerleave` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onpointerleave = (event) => {
   *  //some function here that happens on pointerleave
   * }
   */
  onpointerleave: null,
  /**
   * Property-based event handler for the `pointermove` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onpointermove = (event) => {
   *  //some function here that happens on pointermove
   * }
   */
  onpointermove: null,
  /**
   * Property-based event handler for the `globalpointermove` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onglobalpointermove = (event) => {
   *  //some function here that happens on globalpointermove
   * }
   */
  onglobalpointermove: null,
  /**
   * Property-based event handler for the `pointerout` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onpointerout = (event) => {
   *  //some function here that happens on pointerout
   * }
   */
  onpointerout: null,
  /**
   * Property-based event handler for the `pointerover` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onpointerover = (event) => {
   *  //some function here that happens on pointerover
   * }
   */
  onpointerover: null,
  /**
   * Property-based event handler for the `pointertap` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onpointertap = (event) => {
   *  //some function here that happens on pointertap
   * }
   */
  onpointertap: null,
  /**
   * Property-based event handler for the `pointerup` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onpointerup = (event) => {
   *  //some function here that happens on pointerup
   * }
   */
  onpointerup: null,
  /**
   * Property-based event handler for the `pointerupoutside` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onpointerupoutside = (event) => {
   *  //some function here that happens on pointerupoutside
   * }
   */
  onpointerupoutside: null,
  /**
   * Property-based event handler for the `rightclick` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onrightclick = (event) => {
   *  //some function here that happens on rightclick
   * }
   */
  onrightclick: null,
  /**
   * Property-based event handler for the `rightdown` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onrightdown = (event) => {
   *  //some function here that happens on rightdown
   * }
   */
  onrightdown: null,
  /**
   * Property-based event handler for the `rightup` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onrightup = (event) => {
   *  //some function here that happens on rightup
   * }
   */
  onrightup: null,
  /**
   * Property-based event handler for the `rightupoutside` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onrightupoutside = (event) => {
   *  //some function here that happens on rightupoutside
   * }
   */
  onrightupoutside: null,
  /**
   * Property-based event handler for the `tap` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.ontap = (event) => {
   *  //some function here that happens on tap
   * }
   */
  ontap: null,
  /**
   * Property-based event handler for the `touchcancel` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.ontouchcancel = (event) => {
   *  //some function here that happens on touchcancel
   * }
   */
  ontouchcancel: null,
  /**
   * Property-based event handler for the `touchend` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.ontouchend = (event) => {
   *  //some function here that happens on touchend
   * }
   */
  ontouchend: null,
  /**
   * Property-based event handler for the `touchendoutside` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.ontouchendoutside = (event) => {
   *  //some function here that happens on touchendoutside
   * }
   */
  ontouchendoutside: null,
  /**
   * Property-based event handler for the `touchmove` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.ontouchmove = (event) => {
   *  //some function here that happens on touchmove
   * }
   */
  ontouchmove: null,
  /**
   * Property-based event handler for the `globaltouchmove` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onglobaltouchmove = (event) => {
   *  //some function here that happens on globaltouchmove
   * }
   */
  onglobaltouchmove: null,
  /**
   * Property-based event handler for the `touchstart` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.ontouchstart = (event) => {
   *  //some function here that happens on touchstart
   * }
   */
  ontouchstart: null,
  /**
   * Property-based event handler for the `wheel` event.
   * @memberof PIXI.DisplayObject#
   * @default null
   * @example
   * this.onwheel = (event) => {
   *  //some function here that happens on wheel
   * }
   */
  onwheel: null,
  /**
   * @ignore
   */
  _internalInteractive: void 0,
  /**
   * Enable interaction events for the DisplayObject. Touch, pointer and mouse
   * @memberof PIXI.DisplayObject#
   */
  get interactive() {
    return this._internalInteractive ?? convertEventModeToInteractiveMode(EventSystem.EventSystem.defaultEventMode);
  },
  set interactive(value) {
    core.utils.deprecation(
      "7.2.0",
      // eslint-disable-next-line max-len
      "Setting interactive is deprecated, use eventMode = 'none'/'passive'/'auto'/'static'/'dynamic' instead."
    ), this._internalInteractive = value, this.eventMode = value ? "static" : "auto";
  },
  /**
   * @ignore
   */
  _internalEventMode: void 0,
  /**
   * Enable interaction events for the DisplayObject. Touch, pointer and mouse.
   * This now replaces the `interactive` property.
   * There are 5 types of interaction settings:
   * - `'none'`: Ignores all interaction events, even on its children.
   * - `'passive'`: Does not emit events and ignores all hit testing on itself and non-interactive children.
   * Interactive children will still emit events.
   * - `'auto'`: Does not emit events but is hit tested if parent is interactive. Same as `interactive = false` in v7
   * - `'static'`: Emit events and is hit tested. Same as `interaction = true` in v7
   * - `'dynamic'`: Emits events and is hit tested but will also receive mock interaction events fired from a ticker to
   * allow for interaction when the mouse isn't moving
   * @example
   * import { Sprite } from 'pixi.js';
   *
   * const sprite = new Sprite(texture);
   * sprite.eventMode = 'static';
   * sprite.on('tap', (event) => {
   *     // Handle event
   * });
   * @memberof PIXI.DisplayObject#
   * @since 7.2.0
   */
  get eventMode() {
    return this._internalEventMode ?? EventSystem.EventSystem.defaultEventMode;
  },
  set eventMode(value) {
    this._internalInteractive = convertEventModeToInteractiveMode(value), this._internalEventMode = value;
  },
  /**
   * Determines if the displayObject is interactive or not
   * @returns {boolean} Whether the displayObject is interactive or not
   * @memberof PIXI.DisplayObject#
   * @since 7.2.0
   * @example
   * import { Sprite } from 'pixi.js';
   * const sprite = new Sprite(texture);
   * sprite.eventMode = 'static';
   * sprite.isInteractive(); // true
   *
   * sprite.eventMode = 'dynamic';
   * sprite.isInteractive(); // true
   *
   * sprite.eventMode = 'none';
   * sprite.isInteractive(); // false
   *
   * sprite.eventMode = 'passive';
   * sprite.isInteractive(); // false
   *
   * sprite.eventMode = 'auto';
   * sprite.isInteractive(); // false
   */
  isInteractive() {
    return this.eventMode === "static" || this.eventMode === "dynamic";
  },
  /**
   * Determines if the children to the displayObject can be clicked/touched
   * Setting this to false allows PixiJS to bypass a recursive `hitTest` function
   * @memberof PIXI.Container#
   */
  interactiveChildren: !0,
  /**
   * Interaction shape. Children will be hit first, then this shape will be checked.
   * Setting this will cause this shape to be checked in hit tests rather than the displayObject's bounds.
   * @example
   * import { Rectangle, Sprite } from 'pixi.js';
   *
   * const sprite = new Sprite(texture);
   * sprite.interactive = true;
   * sprite.hitArea = new Rectangle(0, 0, 100, 100);
   * @member {PIXI.IHitArea}
   * @memberof PIXI.DisplayObject#
   */
  hitArea: null,
  /**
   * Unlike `on` or `addListener` which are methods from EventEmitter, `addEventListener`
   * seeks to be compatible with the DOM's `addEventListener` with support for options.
   * **IMPORTANT:** _Only_ available if using the `@pixi/events` package.
   * @memberof PIXI.DisplayObject
   * @param type - The type of event to listen to.
   * @param listener - The listener callback or object.
   * @param options - Listener options, used for capture phase.
   * @example
   * // Tell the user whether they did a single, double, triple, or nth click.
   * button.addEventListener('click', {
   *     handleEvent(e): {
   *         let prefix;
   *
   *         switch (e.detail) {
   *             case 1: prefix = 'single'; break;
   *             case 2: prefix = 'double'; break;
   *             case 3: prefix = 'triple'; break;
   *             default: prefix = e.detail + 'th'; break;
   *         }
   *
   *         console.log('That was a ' + prefix + 'click');
   *     }
   * });
   *
   * // But skip the first click!
   * button.parent.addEventListener('click', function blockClickOnce(e) {
   *     e.stopImmediatePropagation();
   *     button.parent.removeEventListener('click', blockClickOnce, true);
   * }, {
   *     capture: true,
   * });
   */
  addEventListener(type, listener, options) {
    const capture = typeof options == "boolean" && options || typeof options == "object" && options.capture, context = typeof listener == "function" ? void 0 : listener;
    type = capture ? `${type}capture` : type, listener = typeof listener == "function" ? listener : listener.handleEvent, this.on(type, listener, context);
  },
  /**
   * Unlike `off` or `removeListener` which are methods from EventEmitter, `removeEventListener`
   * seeks to be compatible with the DOM's `removeEventListener` with support for options.
   * **IMPORTANT:** _Only_ available if using the `@pixi/events` package.
   * @memberof PIXI.DisplayObject
   * @param type - The type of event the listener is bound to.
   * @param listener - The listener callback or object.
   * @param options - The original listener options. This is required to deregister a capture phase listener.
   */
  removeEventListener(type, listener, options) {
    const capture = typeof options == "boolean" && options || typeof options == "object" && options.capture, context = typeof listener == "function" ? void 0 : listener;
    type = capture ? `${type}capture` : type, listener = typeof listener == "function" ? listener : listener.handleEvent, this.off(type, listener, context);
  },
  /**
   * Dispatch the event on this {@link PIXI.DisplayObject} using the event's {@link PIXI.EventBoundary}.
   *
   * The target of the event is set to `this` and the `defaultPrevented` flag is cleared before dispatch.
   *
   * **IMPORTANT:** _Only_ available if using the `@pixi/events` package.
   * @memberof PIXI.DisplayObject
   * @param e - The event to dispatch.
   * @returns Whether the {@link PIXI.FederatedEvent.preventDefault preventDefault}() method was not invoked.
   * @example
   * // Reuse a click event!
   * button.dispatchEvent(clickEvent);
   */
  dispatchEvent(e) {
    if (!(e instanceof FederatedEvent.FederatedEvent))
      throw new Error("DisplayObject cannot propagate events outside of the Federated Events API");
    return e.defaultPrevented = !1, e.path = null, e.target = this, e.manager.dispatchEvent(e), !e.defaultPrevented;
  }
};
display.DisplayObject.mixin(FederatedDisplayObject);
exports.FederatedDisplayObject = FederatedDisplayObject;


},{"./EventSystem.js":151,"./FederatedEvent.js":153,"@pixi/core":72,"@pixi/display":148}],156:[function(require,module,exports){
"use strict";
var core = require("@pixi/core"), FederatedEvent = require("./FederatedEvent.js");
class FederatedMouseEvent extends FederatedEvent.FederatedEvent {
  constructor() {
    super(...arguments), this.client = new core.Point(), this.movement = new core.Point(), this.offset = new core.Point(), this.global = new core.Point(), this.screen = new core.Point();
  }
  /** @readonly */
  get clientX() {
    return this.client.x;
  }
  /** @readonly */
  get clientY() {
    return this.client.y;
  }
  /**
   * Alias for {@link PIXI.FederatedMouseEvent.clientX this.clientX}.
   * @readonly
   */
  get x() {
    return this.clientX;
  }
  /**
   * Alias for {@link PIXI.FederatedMouseEvent.clientY this.clientY}.
   * @readonly
   */
  get y() {
    return this.clientY;
  }
  /** @readonly */
  get movementX() {
    return this.movement.x;
  }
  /** @readonly */
  get movementY() {
    return this.movement.y;
  }
  /** @readonly */
  get offsetX() {
    return this.offset.x;
  }
  /** @readonly */
  get offsetY() {
    return this.offset.y;
  }
  /** @readonly */
  get globalX() {
    return this.global.x;
  }
  /** @readonly */
  get globalY() {
    return this.global.y;
  }
  /**
   * The pointer coordinates in the renderer's screen. Alias for {@code screen.x}.
   * @readonly
   */
  get screenX() {
    return this.screen.x;
  }
  /**
   * The pointer coordinates in the renderer's screen. Alias for {@code screen.y}.
   * @readonly
   */
  get screenY() {
    return this.screen.y;
  }
  /**
   * This will return the local coordinates of the specified displayObject for this InteractionData
   * @param {PIXI.DisplayObject} displayObject - The DisplayObject that you would like the local
   *  coords off
   * @param {PIXI.IPointData} point - A Point object in which to store the value, optional (otherwise
   *  will create a new point)
   * @param {PIXI.IPointData} globalPos - A Point object containing your custom global coords, optional
   *  (otherwise will use the current global coords)
   * @returns - A point containing the coordinates of the InteractionData position relative
   *  to the DisplayObject
   */
  getLocalPosition(displayObject, point, globalPos) {
    return displayObject.worldTransform.applyInverse(globalPos || this.global, point);
  }
  /**
   * Whether the modifier key was pressed when this event natively occurred.
   * @param key - The modifier key.
   */
  getModifierState(key) {
    return "getModifierState" in this.nativeEvent && this.nativeEvent.getModifierState(key);
  }
  /**
   * Not supported.
   * @param _typeArg
   * @param _canBubbleArg
   * @param _cancelableArg
   * @param _viewArg
   * @param _detailArg
   * @param _screenXArg
   * @param _screenYArg
   * @param _clientXArg
   * @param _clientYArg
   * @param _ctrlKeyArg
   * @param _altKeyArg
   * @param _shiftKeyArg
   * @param _metaKeyArg
   * @param _buttonArg
   * @param _relatedTargetArg
   * @deprecated since 7.0.0
   */
  // eslint-disable-next-line max-params
  initMouseEvent(_typeArg, _canBubbleArg, _cancelableArg, _viewArg, _detailArg, _screenXArg, _screenYArg, _clientXArg, _clientYArg, _ctrlKeyArg, _altKeyArg, _shiftKeyArg, _metaKeyArg, _buttonArg, _relatedTargetArg) {
    throw new Error("Method not implemented.");
  }
}
exports.FederatedMouseEvent = FederatedMouseEvent;


},{"./FederatedEvent.js":153,"@pixi/core":72}],157:[function(require,module,exports){
"use strict";
var FederatedMouseEvent = require("./FederatedMouseEvent.js");
class FederatedPointerEvent extends FederatedMouseEvent.FederatedMouseEvent {
  constructor() {
    super(...arguments), this.width = 0, this.height = 0, this.isPrimary = !1;
  }
  // Only included for completeness for now
  getCoalescedEvents() {
    return this.type === "pointermove" || this.type === "mousemove" || this.type === "touchmove" ? [this] : [];
  }
  // Only included for completeness for now
  getPredictedEvents() {
    throw new Error("getPredictedEvents is not supported!");
  }
}
exports.FederatedPointerEvent = FederatedPointerEvent;


},{"./FederatedMouseEvent.js":156}],158:[function(require,module,exports){
"use strict";
var FederatedMouseEvent = require("./FederatedMouseEvent.js");
class FederatedWheelEvent extends FederatedMouseEvent.FederatedMouseEvent {
  constructor() {
    super(...arguments), this.DOM_DELTA_PIXEL = 0, this.DOM_DELTA_LINE = 1, this.DOM_DELTA_PAGE = 2;
  }
}
FederatedWheelEvent.DOM_DELTA_PIXEL = 0, /** Units specified in lines. */
FederatedWheelEvent.DOM_DELTA_LINE = 1, /** Units specified in pages. */
FederatedWheelEvent.DOM_DELTA_PAGE = 2;
exports.FederatedWheelEvent = FederatedWheelEvent;


},{"./FederatedMouseEvent.js":156}],159:[function(require,module,exports){
"use strict";
var EventBoundary = require("./EventBoundary.js"), EventSystem = require("./EventSystem.js"), FederatedEvent = require("./FederatedEvent.js");
require("./FederatedEventMap.js");
var FederatedEventTarget = require("./FederatedEventTarget.js"), FederatedMouseEvent = require("./FederatedMouseEvent.js"), FederatedPointerEvent = require("./FederatedPointerEvent.js"), FederatedWheelEvent = require("./FederatedWheelEvent.js");
exports.EventBoundary = EventBoundary.EventBoundary;
exports.EventSystem = EventSystem.EventSystem;
exports.FederatedEvent = FederatedEvent.FederatedEvent;
exports.FederatedDisplayObject = FederatedEventTarget.FederatedDisplayObject;
exports.FederatedMouseEvent = FederatedMouseEvent.FederatedMouseEvent;
exports.FederatedPointerEvent = FederatedPointerEvent.FederatedPointerEvent;
exports.FederatedWheelEvent = FederatedWheelEvent.FederatedWheelEvent;


},{"./EventBoundary.js":150,"./EventSystem.js":151,"./FederatedEvent.js":153,"./FederatedEventMap.js":154,"./FederatedEventTarget.js":155,"./FederatedMouseEvent.js":156,"./FederatedPointerEvent.js":157,"./FederatedWheelEvent.js":158}],160:[function(require,module,exports){
"use strict";
var ExtensionType = /* @__PURE__ */ ((ExtensionType2) => (ExtensionType2.Renderer = "renderer", ExtensionType2.Application = "application", ExtensionType2.RendererSystem = "renderer-webgl-system", ExtensionType2.RendererPlugin = "renderer-webgl-plugin", ExtensionType2.CanvasRendererSystem = "renderer-canvas-system", ExtensionType2.CanvasRendererPlugin = "renderer-canvas-plugin", ExtensionType2.Asset = "asset", ExtensionType2.LoadParser = "load-parser", ExtensionType2.ResolveParser = "resolve-parser", ExtensionType2.CacheParser = "cache-parser", ExtensionType2.DetectionParser = "detection-parser", ExtensionType2))(ExtensionType || {});
const normalizeExtension = (ext) => {
  if (typeof ext == "function" || typeof ext == "object" && ext.extension) {
    if (!ext.extension)
      throw new Error("Extension class must have an extension object");
    ext = { ...typeof ext.extension != "object" ? { type: ext.extension } : ext.extension, ref: ext };
  }
  if (typeof ext == "object")
    ext = { ...ext };
  else
    throw new Error("Invalid extension type");
  return typeof ext.type == "string" && (ext.type = [ext.type]), ext;
}, normalizePriority = (ext, defaultPriority) => normalizeExtension(ext).priority ?? defaultPriority, extensions = {
  /** @ignore */
  _addHandlers: {},
  /** @ignore */
  _removeHandlers: {},
  /** @ignore */
  _queue: {},
  /**
   * Remove extensions from PixiJS.
   * @param extensions - Extensions to be removed.
   * @returns {PIXI.extensions} For chaining.
   */
  remove(...extensions2) {
    return extensions2.map(normalizeExtension).forEach((ext) => {
      ext.type.forEach((type) => this._removeHandlers[type]?.(ext));
    }), this;
  },
  /**
   * Register new extensions with PixiJS.
   * @param extensions - The spread of extensions to add to PixiJS.
   * @returns {PIXI.extensions} For chaining.
   */
  add(...extensions2) {
    return extensions2.map(normalizeExtension).forEach((ext) => {
      ext.type.forEach((type) => {
        const handlers = this._addHandlers, queue = this._queue;
        handlers[type] ? handlers[type](ext) : (queue[type] = queue[type] || [], queue[type].push(ext));
      });
    }), this;
  },
  /**
   * Internal method to handle extensions by name.
   * @param type - The extension type.
   * @param onAdd  - Function for handling when extensions are added/registered passes {@link PIXI.ExtensionFormat}.
   * @param onRemove  - Function for handling when extensions are removed/unregistered passes {@link PIXI.ExtensionFormat}.
   * @returns {PIXI.extensions} For chaining.
   */
  handle(type, onAdd, onRemove) {
    const addHandlers = this._addHandlers, removeHandlers = this._removeHandlers;
    if (addHandlers[type] || removeHandlers[type])
      throw new Error(`Extension type ${type} already has a handler`);
    addHandlers[type] = onAdd, removeHandlers[type] = onRemove;
    const queue = this._queue;
    return queue[type] && (queue[type].forEach((ext) => onAdd(ext)), delete queue[type]), this;
  },
  /**
   * Handle a type, but using a map by `name` property.
   * @param type - Type of extension to handle.
   * @param map - The object map of named extensions.
   * @returns {PIXI.extensions} For chaining.
   */
  handleByMap(type, map) {
    return this.handle(
      type,
      (extension) => {
        map[extension.name] = extension.ref;
      },
      (extension) => {
        delete map[extension.name];
      }
    );
  },
  /**
   * Handle a type, but using a list of extensions.
   * @param type - Type of extension to handle.
   * @param list - The list of extensions.
   * @param defaultPriority - The default priority to use if none is specified.
   * @returns {PIXI.extensions} For chaining.
   */
  handleByList(type, list, defaultPriority = -1) {
    return this.handle(
      type,
      (extension) => {
        list.includes(extension.ref) || (list.push(extension.ref), list.sort((a, b) => normalizePriority(b, defaultPriority) - normalizePriority(a, defaultPriority)));
      },
      (extension) => {
        const index = list.indexOf(extension.ref);
        index !== -1 && list.splice(index, 1);
      }
    );
  }
};
exports.ExtensionType = ExtensionType;
exports.extensions = extensions;


},{}],161:[function(require,module,exports){
"use strict";


},{}],162:[function(require,module,exports){
"use strict";


},{}],163:[function(require,module,exports){
"use strict";
var _const = require("./const.js"), Point = require("./Point.js");
class Matrix {
  /**
   * @param a - x scale
   * @param b - y skew
   * @param c - x skew
   * @param d - y scale
   * @param tx - x translation
   * @param ty - y translation
   */
  constructor(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) {
    this.array = null, this.a = a, this.b = b, this.c = c, this.d = d, this.tx = tx, this.ty = ty;
  }
  /**
   * Creates a Matrix object based on the given array. The Element to Matrix mapping order is as follows:
   *
   * a = array[0]
   * b = array[1]
   * c = array[3]
   * d = array[4]
   * tx = array[2]
   * ty = array[5]
   * @param array - The array that the matrix will be populated from.
   */
  fromArray(array) {
    this.a = array[0], this.b = array[1], this.c = array[3], this.d = array[4], this.tx = array[2], this.ty = array[5];
  }
  /**
   * Sets the matrix properties.
   * @param a - Matrix component
   * @param b - Matrix component
   * @param c - Matrix component
   * @param d - Matrix component
   * @param tx - Matrix component
   * @param ty - Matrix component
   * @returns This matrix. Good for chaining method calls.
   */
  set(a, b, c, d, tx, ty) {
    return this.a = a, this.b = b, this.c = c, this.d = d, this.tx = tx, this.ty = ty, this;
  }
  /**
   * Creates an array from the current Matrix object.
   * @param transpose - Whether we need to transpose the matrix or not
   * @param [out=new Float32Array(9)] - If provided the array will be assigned to out
   * @returns The newly created array which contains the matrix
   */
  toArray(transpose, out) {
    this.array || (this.array = new Float32Array(9));
    const array = out || this.array;
    return transpose ? (array[0] = this.a, array[1] = this.b, array[2] = 0, array[3] = this.c, array[4] = this.d, array[5] = 0, array[6] = this.tx, array[7] = this.ty, array[8] = 1) : (array[0] = this.a, array[1] = this.c, array[2] = this.tx, array[3] = this.b, array[4] = this.d, array[5] = this.ty, array[6] = 0, array[7] = 0, array[8] = 1), array;
  }
  /**
   * Get a new position with the current transformation applied.
   * Can be used to go from a child's coordinate space to the world coordinate space. (e.g. rendering)
   * @param pos - The origin
   * @param {PIXI.Point} [newPos] - The point that the new position is assigned to (allowed to be same as input)
   * @returns {PIXI.Point} The new point, transformed through this matrix
   */
  apply(pos, newPos) {
    newPos = newPos || new Point.Point();
    const x = pos.x, y = pos.y;
    return newPos.x = this.a * x + this.c * y + this.tx, newPos.y = this.b * x + this.d * y + this.ty, newPos;
  }
  /**
   * Get a new position with the inverse of the current transformation applied.
   * Can be used to go from the world coordinate space to a child's coordinate space. (e.g. input)
   * @param pos - The origin
   * @param {PIXI.Point} [newPos] - The point that the new position is assigned to (allowed to be same as input)
   * @returns {PIXI.Point} The new point, inverse-transformed through this matrix
   */
  applyInverse(pos, newPos) {
    newPos = newPos || new Point.Point();
    const id = 1 / (this.a * this.d + this.c * -this.b), x = pos.x, y = pos.y;
    return newPos.x = this.d * id * x + -this.c * id * y + (this.ty * this.c - this.tx * this.d) * id, newPos.y = this.a * id * y + -this.b * id * x + (-this.ty * this.a + this.tx * this.b) * id, newPos;
  }
  /**
   * Translates the matrix on the x and y.
   * @param x - How much to translate x by
   * @param y - How much to translate y by
   * @returns This matrix. Good for chaining method calls.
   */
  translate(x, y) {
    return this.tx += x, this.ty += y, this;
  }
  /**
   * Applies a scale transformation to the matrix.
   * @param x - The amount to scale horizontally
   * @param y - The amount to scale vertically
   * @returns This matrix. Good for chaining method calls.
   */
  scale(x, y) {
    return this.a *= x, this.d *= y, this.c *= x, this.b *= y, this.tx *= x, this.ty *= y, this;
  }
  /**
   * Applies a rotation transformation to the matrix.
   * @param angle - The angle in radians.
   * @returns This matrix. Good for chaining method calls.
   */
  rotate(angle) {
    const cos = Math.cos(angle), sin = Math.sin(angle), a1 = this.a, c1 = this.c, tx1 = this.tx;
    return this.a = a1 * cos - this.b * sin, this.b = a1 * sin + this.b * cos, this.c = c1 * cos - this.d * sin, this.d = c1 * sin + this.d * cos, this.tx = tx1 * cos - this.ty * sin, this.ty = tx1 * sin + this.ty * cos, this;
  }
  /**
   * Appends the given Matrix to this Matrix.
   * @param matrix - The matrix to append.
   * @returns This matrix. Good for chaining method calls.
   */
  append(matrix) {
    const a1 = this.a, b1 = this.b, c1 = this.c, d1 = this.d;
    return this.a = matrix.a * a1 + matrix.b * c1, this.b = matrix.a * b1 + matrix.b * d1, this.c = matrix.c * a1 + matrix.d * c1, this.d = matrix.c * b1 + matrix.d * d1, this.tx = matrix.tx * a1 + matrix.ty * c1 + this.tx, this.ty = matrix.tx * b1 + matrix.ty * d1 + this.ty, this;
  }
  /**
   * Sets the matrix based on all the available properties
   * @param x - Position on the x axis
   * @param y - Position on the y axis
   * @param pivotX - Pivot on the x axis
   * @param pivotY - Pivot on the y axis
   * @param scaleX - Scale on the x axis
   * @param scaleY - Scale on the y axis
   * @param rotation - Rotation in radians
   * @param skewX - Skew on the x axis
   * @param skewY - Skew on the y axis
   * @returns This matrix. Good for chaining method calls.
   */
  setTransform(x, y, pivotX, pivotY, scaleX, scaleY, rotation, skewX, skewY) {
    return this.a = Math.cos(rotation + skewY) * scaleX, this.b = Math.sin(rotation + skewY) * scaleX, this.c = -Math.sin(rotation - skewX) * scaleY, this.d = Math.cos(rotation - skewX) * scaleY, this.tx = x - (pivotX * this.a + pivotY * this.c), this.ty = y - (pivotX * this.b + pivotY * this.d), this;
  }
  /**
   * Prepends the given Matrix to this Matrix.
   * @param matrix - The matrix to prepend
   * @returns This matrix. Good for chaining method calls.
   */
  prepend(matrix) {
    const tx1 = this.tx;
    if (matrix.a !== 1 || matrix.b !== 0 || matrix.c !== 0 || matrix.d !== 1) {
      const a1 = this.a, c1 = this.c;
      this.a = a1 * matrix.a + this.b * matrix.c, this.b = a1 * matrix.b + this.b * matrix.d, this.c = c1 * matrix.a + this.d * matrix.c, this.d = c1 * matrix.b + this.d * matrix.d;
    }
    return this.tx = tx1 * matrix.a + this.ty * matrix.c + matrix.tx, this.ty = tx1 * matrix.b + this.ty * matrix.d + matrix.ty, this;
  }
  /**
   * Decomposes the matrix (x, y, scaleX, scaleY, and rotation) and sets the properties on to a transform.
   * @param transform - The transform to apply the properties to.
   * @returns The transform with the newly applied properties
   */
  decompose(transform) {
    const a = this.a, b = this.b, c = this.c, d = this.d, pivot = transform.pivot, skewX = -Math.atan2(-c, d), skewY = Math.atan2(b, a), delta = Math.abs(skewX + skewY);
    return delta < 1e-5 || Math.abs(_const.PI_2 - delta) < 1e-5 ? (transform.rotation = skewY, transform.skew.x = transform.skew.y = 0) : (transform.rotation = 0, transform.skew.x = skewX, transform.skew.y = skewY), transform.scale.x = Math.sqrt(a * a + b * b), transform.scale.y = Math.sqrt(c * c + d * d), transform.position.x = this.tx + (pivot.x * a + pivot.y * c), transform.position.y = this.ty + (pivot.x * b + pivot.y * d), transform;
  }
  /**
   * Inverts this matrix
   * @returns This matrix. Good for chaining method calls.
   */
  invert() {
    const a1 = this.a, b1 = this.b, c1 = this.c, d1 = this.d, tx1 = this.tx, n = a1 * d1 - b1 * c1;
    return this.a = d1 / n, this.b = -b1 / n, this.c = -c1 / n, this.d = a1 / n, this.tx = (c1 * this.ty - d1 * tx1) / n, this.ty = -(a1 * this.ty - b1 * tx1) / n, this;
  }
  /**
   * Resets this Matrix to an identity (default) matrix.
   * @returns This matrix. Good for chaining method calls.
   */
  identity() {
    return this.a = 1, this.b = 0, this.c = 0, this.d = 1, this.tx = 0, this.ty = 0, this;
  }
  /**
   * Creates a new Matrix object with the same values as this one.
   * @returns A copy of this matrix. Good for chaining method calls.
   */
  clone() {
    const matrix = new Matrix();
    return matrix.a = this.a, matrix.b = this.b, matrix.c = this.c, matrix.d = this.d, matrix.tx = this.tx, matrix.ty = this.ty, matrix;
  }
  /**
   * Changes the values of the given matrix to be the same as the ones in this matrix
   * @param matrix - The matrix to copy to.
   * @returns The matrix given in parameter with its values updated.
   */
  copyTo(matrix) {
    return matrix.a = this.a, matrix.b = this.b, matrix.c = this.c, matrix.d = this.d, matrix.tx = this.tx, matrix.ty = this.ty, matrix;
  }
  /**
   * Changes the values of the matrix to be the same as the ones in given matrix
   * @param {PIXI.Matrix} matrix - The matrix to copy from.
   * @returns {PIXI.Matrix} this
   */
  copyFrom(matrix) {
    return this.a = matrix.a, this.b = matrix.b, this.c = matrix.c, this.d = matrix.d, this.tx = matrix.tx, this.ty = matrix.ty, this;
  }
  /**
   * A default (identity) matrix
   * @readonly
   */
  static get IDENTITY() {
    return new Matrix();
  }
  /**
   * A temp matrix
   * @readonly
   */
  static get TEMP_MATRIX() {
    return new Matrix();
  }
}
Matrix.prototype.toString = function() {
  return `[@pixi/math:Matrix a=${this.a} b=${this.b} c=${this.c} d=${this.d} tx=${this.tx} ty=${this.ty}]`;
};
exports.Matrix = Matrix;


},{"./Point.js":165,"./const.js":167}],164:[function(require,module,exports){
"use strict";
class ObservablePoint {
  /**
   * Creates a new `ObservablePoint`
   * @param cb - callback function triggered when `x` and/or `y` are changed
   * @param scope - owner of callback
   * @param {number} [x=0] - position of the point on the x axis
   * @param {number} [y=0] - position of the point on the y axis
   */
  constructor(cb, scope, x = 0, y = 0) {
    this._x = x, this._y = y, this.cb = cb, this.scope = scope;
  }
  /**
   * Creates a clone of this point.
   * The callback and scope params can be overridden otherwise they will default
   * to the clone object's values.
   * @override
   * @param cb - The callback function triggered when `x` and/or `y` are changed
   * @param scope - The owner of the callback
   * @returns a copy of this observable point
   */
  clone(cb = this.cb, scope = this.scope) {
    return new ObservablePoint(cb, scope, this._x, this._y);
  }
  /**
   * Sets the point to a new `x` and `y` position.
   * If `y` is omitted, both `x` and `y` will be set to `x`.
   * @param {number} [x=0] - position of the point on the x axis
   * @param {number} [y=x] - position of the point on the y axis
   * @returns The observable point instance itself
   */
  set(x = 0, y = x) {
    return (this._x !== x || this._y !== y) && (this._x = x, this._y = y, this.cb.call(this.scope)), this;
  }
  /**
   * Copies x and y from the given point (`p`)
   * @param p - The point to copy from. Can be any of type that is or extends `IPointData`
   * @returns The observable point instance itself
   */
  copyFrom(p) {
    return (this._x !== p.x || this._y !== p.y) && (this._x = p.x, this._y = p.y, this.cb.call(this.scope)), this;
  }
  /**
   * Copies this point's x and y into that of the given point (`p`)
   * @param p - The point to copy to. Can be any of type that is or extends `IPointData`
   * @returns The point (`p`) with values updated
   */
  copyTo(p) {
    return p.set(this._x, this._y), p;
  }
  /**
   * Accepts another point (`p`) and returns `true` if the given point is equal to this point
   * @param p - The point to check
   * @returns Returns `true` if both `x` and `y` are equal
   */
  equals(p) {
    return p.x === this._x && p.y === this._y;
  }
  /** Position of the observable point on the x axis. */
  get x() {
    return this._x;
  }
  set x(value) {
    this._x !== value && (this._x = value, this.cb.call(this.scope));
  }
  /** Position of the observable point on the y axis. */
  get y() {
    return this._y;
  }
  set y(value) {
    this._y !== value && (this._y = value, this.cb.call(this.scope));
  }
}
ObservablePoint.prototype.toString = function() {
  return `[@pixi/math:ObservablePoint x=${this.x} y=${this.y} scope=${this.scope}]`;
};
exports.ObservablePoint = ObservablePoint;


},{}],165:[function(require,module,exports){
"use strict";
class Point {
  /**
   * Creates a new `Point`
   * @param {number} [x=0] - position of the point on the x axis
   * @param {number} [y=0] - position of the point on the y axis
   */
  constructor(x = 0, y = 0) {
    this.x = 0, this.y = 0, this.x = x, this.y = y;
  }
  /**
   * Creates a clone of this point
   * @returns A clone of this point
   */
  clone() {
    return new Point(this.x, this.y);
  }
  /**
   * Copies `x` and `y` from the given point into this point
   * @param p - The point to copy from
   * @returns The point instance itself
   */
  copyFrom(p) {
    return this.set(p.x, p.y), this;
  }
  /**
   * Copies this point's x and y into the given point (`p`).
   * @param p - The point to copy to. Can be any of type that is or extends `IPointData`
   * @returns The point (`p`) with values updated
   */
  copyTo(p) {
    return p.set(this.x, this.y), p;
  }
  /**
   * Accepts another point (`p`) and returns `true` if the given point is equal to this point
   * @param p - The point to check
   * @returns Returns `true` if both `x` and `y` are equal
   */
  equals(p) {
    return p.x === this.x && p.y === this.y;
  }
  /**
   * Sets the point to a new `x` and `y` position.
   * If `y` is omitted, both `x` and `y` will be set to `x`.
   * @param {number} [x=0] - position of the point on the `x` axis
   * @param {number} [y=x] - position of the point on the `y` axis
   * @returns The point instance itself
   */
  set(x = 0, y = x) {
    return this.x = x, this.y = y, this;
  }
}
Point.prototype.toString = function() {
  return `[@pixi/math:Point x=${this.x} y=${this.y}]`;
};
exports.Point = Point;


},{}],166:[function(require,module,exports){
"use strict";
var Matrix = require("./Matrix.js"), ObservablePoint = require("./ObservablePoint.js");
const _Transform = class {
  constructor() {
    this.worldTransform = new Matrix.Matrix(), this.localTransform = new Matrix.Matrix(), this.position = new ObservablePoint.ObservablePoint(this.onChange, this, 0, 0), this.scale = new ObservablePoint.ObservablePoint(this.onChange, this, 1, 1), this.pivot = new ObservablePoint.ObservablePoint(this.onChange, this, 0, 0), this.skew = new ObservablePoint.ObservablePoint(this.updateSkew, this, 0, 0), this._rotation = 0, this._cx = 1, this._sx = 0, this._cy = 0, this._sy = 1, this._localID = 0, this._currentLocalID = 0, this._worldID = 0, this._parentID = 0;
  }
  /** Called when a value changes. */
  onChange() {
    this._localID++;
  }
  /** Called when the skew or the rotation changes. */
  updateSkew() {
    this._cx = Math.cos(this._rotation + this.skew.y), this._sx = Math.sin(this._rotation + this.skew.y), this._cy = -Math.sin(this._rotation - this.skew.x), this._sy = Math.cos(this._rotation - this.skew.x), this._localID++;
  }
  /** Updates the local transformation matrix. */
  updateLocalTransform() {
    const lt = this.localTransform;
    this._localID !== this._currentLocalID && (lt.a = this._cx * this.scale.x, lt.b = this._sx * this.scale.x, lt.c = this._cy * this.scale.y, lt.d = this._sy * this.scale.y, lt.tx = this.position.x - (this.pivot.x * lt.a + this.pivot.y * lt.c), lt.ty = this.position.y - (this.pivot.x * lt.b + this.pivot.y * lt.d), this._currentLocalID = this._localID, this._parentID = -1);
  }
  /**
   * Updates the local and the world transformation matrices.
   * @param parentTransform - The parent transform
   */
  updateTransform(parentTransform) {
    const lt = this.localTransform;
    if (this._localID !== this._currentLocalID && (lt.a = this._cx * this.scale.x, lt.b = this._sx * this.scale.x, lt.c = this._cy * this.scale.y, lt.d = this._sy * this.scale.y, lt.tx = this.position.x - (this.pivot.x * lt.a + this.pivot.y * lt.c), lt.ty = this.position.y - (this.pivot.x * lt.b + this.pivot.y * lt.d), this._currentLocalID = this._localID, this._parentID = -1), this._parentID !== parentTransform._worldID) {
      const pt = parentTransform.worldTransform, wt = this.worldTransform;
      wt.a = lt.a * pt.a + lt.b * pt.c, wt.b = lt.a * pt.b + lt.b * pt.d, wt.c = lt.c * pt.a + lt.d * pt.c, wt.d = lt.c * pt.b + lt.d * pt.d, wt.tx = lt.tx * pt.a + lt.ty * pt.c + pt.tx, wt.ty = lt.tx * pt.b + lt.ty * pt.d + pt.ty, this._parentID = parentTransform._worldID, this._worldID++;
    }
  }
  /**
   * Decomposes a matrix and sets the transforms properties based on it.
   * @param matrix - The matrix to decompose
   */
  setFromMatrix(matrix) {
    matrix.decompose(this), this._localID++;
  }
  /** The rotation of the object in radians. */
  get rotation() {
    return this._rotation;
  }
  set rotation(value) {
    this._rotation !== value && (this._rotation = value, this.updateSkew());
  }
};
_Transform.IDENTITY = new _Transform();
let Transform = _Transform;
Transform.prototype.toString = function() {
  return `[@pixi/math:Transform position=(${this.position.x}, ${this.position.y}) rotation=${this.rotation} scale=(${this.scale.x}, ${this.scale.y}) skew=(${this.skew.x}, ${this.skew.y}) ]`;
};
exports.Transform = Transform;


},{"./Matrix.js":163,"./ObservablePoint.js":164}],167:[function(require,module,exports){
"use strict";
const PI_2 = Math.PI * 2, RAD_TO_DEG = 180 / Math.PI, DEG_TO_RAD = Math.PI / 180;
var SHAPES = /* @__PURE__ */ ((SHAPES2) => (SHAPES2[SHAPES2.POLY = 0] = "POLY", SHAPES2[SHAPES2.RECT = 1] = "RECT", SHAPES2[SHAPES2.CIRC = 2] = "CIRC", SHAPES2[SHAPES2.ELIP = 3] = "ELIP", SHAPES2[SHAPES2.RREC = 4] = "RREC", SHAPES2))(SHAPES || {});
exports.DEG_TO_RAD = DEG_TO_RAD;
exports.PI_2 = PI_2;
exports.RAD_TO_DEG = RAD_TO_DEG;
exports.SHAPES = SHAPES;


},{}],168:[function(require,module,exports){
"use strict";
var Matrix = require("./Matrix.js");
const ux = [1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1, 0, 1], uy = [0, 1, 1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1], vx = [0, -1, -1, -1, 0, 1, 1, 1, 0, 1, 1, 1, 0, -1, -1, -1], vy = [1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, 1, 1, 1, 0, -1], rotationCayley = [], rotationMatrices = [], signum = Math.sign;
function init() {
  for (let i = 0; i < 16; i++) {
    const row = [];
    rotationCayley.push(row);
    for (let j = 0; j < 16; j++) {
      const _ux = signum(ux[i] * ux[j] + vx[i] * uy[j]), _uy = signum(uy[i] * ux[j] + vy[i] * uy[j]), _vx = signum(ux[i] * vx[j] + vx[i] * vy[j]), _vy = signum(uy[i] * vx[j] + vy[i] * vy[j]);
      for (let k = 0; k < 16; k++)
        if (ux[k] === _ux && uy[k] === _uy && vx[k] === _vx && vy[k] === _vy) {
          row.push(k);
          break;
        }
    }
  }
  for (let i = 0; i < 16; i++) {
    const mat = new Matrix.Matrix();
    mat.set(ux[i], uy[i], vx[i], vy[i], 0, 0), rotationMatrices.push(mat);
  }
}
init();
const groupD8 = {
  /**
   * | Rotation | Direction |
   * |----------|-----------|
   * | 0°       | East      |
   * @readonly
   */
  E: 0,
  /**
   * | Rotation | Direction |
   * |----------|-----------|
   * | 45°↻     | Southeast |
   * @readonly
   */
  SE: 1,
  /**
   * | Rotation | Direction |
   * |----------|-----------|
   * | 90°↻     | South     |
   * @readonly
   */
  S: 2,
  /**
   * | Rotation | Direction |
   * |----------|-----------|
   * | 135°↻    | Southwest |
   * @readonly
   */
  SW: 3,
  /**
   * | Rotation | Direction |
   * |----------|-----------|
   * | 180°     | West      |
   * @readonly
   */
  W: 4,
  /**
   * | Rotation    | Direction    |
   * |-------------|--------------|
   * | -135°/225°↻ | Northwest    |
   * @readonly
   */
  NW: 5,
  /**
   * | Rotation    | Direction    |
   * |-------------|--------------|
   * | -90°/270°↻  | North        |
   * @readonly
   */
  N: 6,
  /**
   * | Rotation    | Direction    |
   * |-------------|--------------|
   * | -45°/315°↻  | Northeast    |
   * @readonly
   */
  NE: 7,
  /**
   * Reflection about Y-axis.
   * @readonly
   */
  MIRROR_VERTICAL: 8,
  /**
   * Reflection about the main diagonal.
   * @readonly
   */
  MAIN_DIAGONAL: 10,
  /**
   * Reflection about X-axis.
   * @readonly
   */
  MIRROR_HORIZONTAL: 12,
  /**
   * Reflection about reverse diagonal.
   * @readonly
   */
  REVERSE_DIAGONAL: 14,
  /**
   * @param {PIXI.GD8Symmetry} ind - sprite rotation angle.
   * @returns {PIXI.GD8Symmetry} The X-component of the U-axis
   *    after rotating the axes.
   */
  uX: (ind) => ux[ind],
  /**
   * @param {PIXI.GD8Symmetry} ind - sprite rotation angle.
   * @returns {PIXI.GD8Symmetry} The Y-component of the U-axis
   *    after rotating the axes.
   */
  uY: (ind) => uy[ind],
  /**
   * @param {PIXI.GD8Symmetry} ind - sprite rotation angle.
   * @returns {PIXI.GD8Symmetry} The X-component of the V-axis
   *    after rotating the axes.
   */
  vX: (ind) => vx[ind],
  /**
   * @param {PIXI.GD8Symmetry} ind - sprite rotation angle.
   * @returns {PIXI.GD8Symmetry} The Y-component of the V-axis
   *    after rotating the axes.
   */
  vY: (ind) => vy[ind],
  /**
   * @param {PIXI.GD8Symmetry} rotation - symmetry whose opposite
   *   is needed. Only rotations have opposite symmetries while
   *   reflections don't.
   * @returns {PIXI.GD8Symmetry} The opposite symmetry of `rotation`
   */
  inv: (rotation) => rotation & 8 ? rotation & 15 : -rotation & 7,
  /**
   * Composes the two D8 operations.
   *
   * Taking `^` as reflection:
   *
   * |       | E=0 | S=2 | W=4 | N=6 | E^=8 | S^=10 | W^=12 | N^=14 |
   * |-------|-----|-----|-----|-----|------|-------|-------|-------|
   * | E=0   | E   | S   | W   | N   | E^   | S^    | W^    | N^    |
   * | S=2   | S   | W   | N   | E   | S^   | W^    | N^    | E^    |
   * | W=4   | W   | N   | E   | S   | W^   | N^    | E^    | S^    |
   * | N=6   | N   | E   | S   | W   | N^   | E^    | S^    | W^    |
   * | E^=8  | E^  | N^  | W^  | S^  | E    | N     | W     | S     |
   * | S^=10 | S^  | E^  | N^  | W^  | S    | E     | N     | W     |
   * | W^=12 | W^  | S^  | E^  | N^  | W    | S     | E     | N     |
   * | N^=14 | N^  | W^  | S^  | E^  | N    | W     | S     | E     |
   *
   * [This is a Cayley table]{@link https://en.wikipedia.org/wiki/Cayley_table}
   * @param {PIXI.GD8Symmetry} rotationSecond - Second operation, which
   *   is the row in the above cayley table.
   * @param {PIXI.GD8Symmetry} rotationFirst - First operation, which
   *   is the column in the above cayley table.
   * @returns {PIXI.GD8Symmetry} Composed operation
   */
  add: (rotationSecond, rotationFirst) => rotationCayley[rotationSecond][rotationFirst],
  /**
   * Reverse of `add`.
   * @param {PIXI.GD8Symmetry} rotationSecond - Second operation
   * @param {PIXI.GD8Symmetry} rotationFirst - First operation
   * @returns {PIXI.GD8Symmetry} Result
   */
  sub: (rotationSecond, rotationFirst) => rotationCayley[rotationSecond][groupD8.inv(rotationFirst)],
  /**
   * Adds 180 degrees to rotation, which is a commutative
   * operation.
   * @param {number} rotation - The number to rotate.
   * @returns {number} Rotated number
   */
  rotate180: (rotation) => rotation ^ 4,
  /**
   * Checks if the rotation angle is vertical, i.e. south
   * or north. It doesn't work for reflections.
   * @param {PIXI.GD8Symmetry} rotation - The number to check.
   * @returns {boolean} Whether or not the direction is vertical
   */
  isVertical: (rotation) => (rotation & 3) === 2,
  // rotation % 4 === 2
  /**
   * Approximates the vector `V(dx,dy)` into one of the
   * eight directions provided by `groupD8`.
   * @param {number} dx - X-component of the vector
   * @param {number} dy - Y-component of the vector
   * @returns {PIXI.GD8Symmetry} Approximation of the vector into
   *  one of the eight symmetries.
   */
  byDirection: (dx, dy) => Math.abs(dx) * 2 <= Math.abs(dy) ? dy >= 0 ? groupD8.S : groupD8.N : Math.abs(dy) * 2 <= Math.abs(dx) ? dx > 0 ? groupD8.E : groupD8.W : dy > 0 ? dx > 0 ? groupD8.SE : groupD8.SW : dx > 0 ? groupD8.NE : groupD8.NW,
  /**
   * Helps sprite to compensate texture packer rotation.
   * @param {PIXI.Matrix} matrix - sprite world matrix
   * @param {PIXI.GD8Symmetry} rotation - The rotation factor to use.
   * @param {number} tx - sprite anchoring
   * @param {number} ty - sprite anchoring
   */
  matrixAppendRotationInv: (matrix, rotation, tx = 0, ty = 0) => {
    const mat = rotationMatrices[groupD8.inv(rotation)];
    mat.tx = tx, mat.ty = ty, matrix.append(mat);
  }
};
exports.groupD8 = groupD8;


},{"./Matrix.js":163}],169:[function(require,module,exports){
"use strict";
var Circle = require("./shapes/Circle.js"), Ellipse = require("./shapes/Ellipse.js"), Polygon = require("./shapes/Polygon.js"), Rectangle = require("./shapes/Rectangle.js"), RoundedRectangle = require("./shapes/RoundedRectangle.js"), groupD8 = require("./groupD8.js");
require("./IPoint.js");
require("./IPointData.js");
var Matrix = require("./Matrix.js"), ObservablePoint = require("./ObservablePoint.js"), Point = require("./Point.js"), Transform = require("./Transform.js"), _const = require("./const.js");
exports.Circle = Circle.Circle;
exports.Ellipse = Ellipse.Ellipse;
exports.Polygon = Polygon.Polygon;
exports.Rectangle = Rectangle.Rectangle;
exports.RoundedRectangle = RoundedRectangle.RoundedRectangle;
exports.groupD8 = groupD8.groupD8;
exports.Matrix = Matrix.Matrix;
exports.ObservablePoint = ObservablePoint.ObservablePoint;
exports.Point = Point.Point;
exports.Transform = Transform.Transform;
exports.DEG_TO_RAD = _const.DEG_TO_RAD;
exports.PI_2 = _const.PI_2;
exports.RAD_TO_DEG = _const.RAD_TO_DEG;
exports.SHAPES = _const.SHAPES;


},{"./IPoint.js":161,"./IPointData.js":162,"./Matrix.js":163,"./ObservablePoint.js":164,"./Point.js":165,"./Transform.js":166,"./const.js":167,"./groupD8.js":168,"./shapes/Circle.js":170,"./shapes/Ellipse.js":171,"./shapes/Polygon.js":172,"./shapes/Rectangle.js":173,"./shapes/RoundedRectangle.js":174}],170:[function(require,module,exports){
"use strict";
var _const = require("../const.js"), Rectangle = require("./Rectangle.js");
class Circle {
  /**
   * @param x - The X coordinate of the center of this circle
   * @param y - The Y coordinate of the center of this circle
   * @param radius - The radius of the circle
   */
  constructor(x = 0, y = 0, radius = 0) {
    this.x = x, this.y = y, this.radius = radius, this.type = _const.SHAPES.CIRC;
  }
  /**
   * Creates a clone of this Circle instance
   * @returns A copy of the Circle
   */
  clone() {
    return new Circle(this.x, this.y, this.radius);
  }
  /**
   * Checks whether the x and y coordinates given are contained within this circle
   * @param x - The X coordinate of the point to test
   * @param y - The Y coordinate of the point to test
   * @returns Whether the x/y coordinates are within this Circle
   */
  contains(x, y) {
    if (this.radius <= 0)
      return !1;
    const r2 = this.radius * this.radius;
    let dx = this.x - x, dy = this.y - y;
    return dx *= dx, dy *= dy, dx + dy <= r2;
  }
  /**
   * Returns the framing rectangle of the circle as a Rectangle object
   * @returns The framing rectangle
   */
  getBounds() {
    return new Rectangle.Rectangle(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
  }
}
Circle.prototype.toString = function() {
  return `[@pixi/math:Circle x=${this.x} y=${this.y} radius=${this.radius}]`;
};
exports.Circle = Circle;


},{"../const.js":167,"./Rectangle.js":173}],171:[function(require,module,exports){
"use strict";
var _const = require("../const.js"), Rectangle = require("./Rectangle.js");
class Ellipse {
  /**
   * @param x - The X coordinate of the center of this ellipse
   * @param y - The Y coordinate of the center of this ellipse
   * @param halfWidth - The half width of this ellipse
   * @param halfHeight - The half height of this ellipse
   */
  constructor(x = 0, y = 0, halfWidth = 0, halfHeight = 0) {
    this.x = x, this.y = y, this.width = halfWidth, this.height = halfHeight, this.type = _const.SHAPES.ELIP;
  }
  /**
   * Creates a clone of this Ellipse instance
   * @returns {PIXI.Ellipse} A copy of the ellipse
   */
  clone() {
    return new Ellipse(this.x, this.y, this.width, this.height);
  }
  /**
   * Checks whether the x and y coordinates given are contained within this ellipse
   * @param x - The X coordinate of the point to test
   * @param y - The Y coordinate of the point to test
   * @returns Whether the x/y coords are within this ellipse
   */
  contains(x, y) {
    if (this.width <= 0 || this.height <= 0)
      return !1;
    let normx = (x - this.x) / this.width, normy = (y - this.y) / this.height;
    return normx *= normx, normy *= normy, normx + normy <= 1;
  }
  /**
   * Returns the framing rectangle of the ellipse as a Rectangle object
   * @returns The framing rectangle
   */
  getBounds() {
    return new Rectangle.Rectangle(this.x - this.width, this.y - this.height, this.width, this.height);
  }
}
Ellipse.prototype.toString = function() {
  return `[@pixi/math:Ellipse x=${this.x} y=${this.y} width=${this.width} height=${this.height}]`;
};
exports.Ellipse = Ellipse;


},{"../const.js":167,"./Rectangle.js":173}],172:[function(require,module,exports){
"use strict";
var _const = require("../const.js");
class Polygon {
  /**
   * @param {PIXI.IPointData[]|number[]} points - This can be an array of Points
   *  that form the polygon, a flat array of numbers that will be interpreted as [x,y, x,y, ...], or
   *  the arguments passed can be all the points of the polygon e.g.
   *  `new Polygon(new Point(), new Point(), ...)`, or the arguments passed can be flat
   *  x,y values e.g. `new Polygon(x,y, x,y, x,y, ...)` where `x` and `y` are Numbers.
   */
  constructor(...points) {
    let flat = Array.isArray(points[0]) ? points[0] : points;
    if (typeof flat[0] != "number") {
      const p = [];
      for (let i = 0, il = flat.length; i < il; i++)
        p.push(flat[i].x, flat[i].y);
      flat = p;
    }
    this.points = flat, this.type = _const.SHAPES.POLY, this.closeStroke = !0;
  }
  /**
   * Creates a clone of this polygon.
   * @returns - A copy of the polygon.
   */
  clone() {
    const points = this.points.slice(), polygon = new Polygon(points);
    return polygon.closeStroke = this.closeStroke, polygon;
  }
  /**
   * Checks whether the x and y coordinates passed to this function are contained within this polygon.
   * @param x - The X coordinate of the point to test.
   * @param y - The Y coordinate of the point to test.
   * @returns - Whether the x/y coordinates are within this polygon.
   */
  contains(x, y) {
    let inside = !1;
    const length = this.points.length / 2;
    for (let i = 0, j = length - 1; i < length; j = i++) {
      const xi = this.points[i * 2], yi = this.points[i * 2 + 1], xj = this.points[j * 2], yj = this.points[j * 2 + 1];
      yi > y != yj > y && x < (xj - xi) * ((y - yi) / (yj - yi)) + xi && (inside = !inside);
    }
    return inside;
  }
}
Polygon.prototype.toString = function() {
  return `[@pixi/math:PolygoncloseStroke=${this.closeStroke}points=${this.points.reduce((pointsDesc, currentPoint) => `${pointsDesc}, ${currentPoint}`, "")}]`;
};
exports.Polygon = Polygon;


},{"../const.js":167}],173:[function(require,module,exports){
"use strict";
var _const = require("../const.js"), Point = require("../Point.js");
const tempPoints = [new Point.Point(), new Point.Point(), new Point.Point(), new Point.Point()];
class Rectangle {
  /**
   * @param x - The X coordinate of the upper-left corner of the rectangle
   * @param y - The Y coordinate of the upper-left corner of the rectangle
   * @param width - The overall width of the rectangle
   * @param height - The overall height of the rectangle
   */
  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = Number(x), this.y = Number(y), this.width = Number(width), this.height = Number(height), this.type = _const.SHAPES.RECT;
  }
  /** Returns the left edge of the rectangle. */
  get left() {
    return this.x;
  }
  /** Returns the right edge of the rectangle. */
  get right() {
    return this.x + this.width;
  }
  /** Returns the top edge of the rectangle. */
  get top() {
    return this.y;
  }
  /** Returns the bottom edge of the rectangle. */
  get bottom() {
    return this.y + this.height;
  }
  /** A constant empty rectangle. */
  static get EMPTY() {
    return new Rectangle(0, 0, 0, 0);
  }
  /**
   * Creates a clone of this Rectangle
   * @returns a copy of the rectangle
   */
  clone() {
    return new Rectangle(this.x, this.y, this.width, this.height);
  }
  /**
   * Copies another rectangle to this one.
   * @param rectangle - The rectangle to copy from.
   * @returns Returns itself.
   */
  copyFrom(rectangle) {
    return this.x = rectangle.x, this.y = rectangle.y, this.width = rectangle.width, this.height = rectangle.height, this;
  }
  /**
   * Copies this rectangle to another one.
   * @param rectangle - The rectangle to copy to.
   * @returns Returns given parameter.
   */
  copyTo(rectangle) {
    return rectangle.x = this.x, rectangle.y = this.y, rectangle.width = this.width, rectangle.height = this.height, rectangle;
  }
  /**
   * Checks whether the x and y coordinates given are contained within this Rectangle
   * @param x - The X coordinate of the point to test
   * @param y - The Y coordinate of the point to test
   * @returns Whether the x/y coordinates are within this Rectangle
   */
  contains(x, y) {
    return this.width <= 0 || this.height <= 0 ? !1 : x >= this.x && x < this.x + this.width && y >= this.y && y < this.y + this.height;
  }
  /**
   * Determines whether the `other` Rectangle transformed by `transform` intersects with `this` Rectangle object.
   * Returns true only if the area of the intersection is >0, this means that Rectangles
   * sharing a side are not overlapping. Another side effect is that an arealess rectangle
   * (width or height equal to zero) can't intersect any other rectangle.
   * @param {Rectangle} other - The Rectangle to intersect with `this`.
   * @param {Matrix} transform - The transformation matrix of `other`.
   * @returns {boolean} A value of `true` if the transformed `other` Rectangle intersects with `this`; otherwise `false`.
   */
  intersects(other, transform) {
    if (!transform) {
      const x02 = this.x < other.x ? other.x : this.x;
      if ((this.right > other.right ? other.right : this.right) <= x02)
        return !1;
      const y02 = this.y < other.y ? other.y : this.y;
      return (this.bottom > other.bottom ? other.bottom : this.bottom) > y02;
    }
    const x0 = this.left, x1 = this.right, y0 = this.top, y1 = this.bottom;
    if (x1 <= x0 || y1 <= y0)
      return !1;
    const lt = tempPoints[0].set(other.left, other.top), lb = tempPoints[1].set(other.left, other.bottom), rt = tempPoints[2].set(other.right, other.top), rb = tempPoints[3].set(other.right, other.bottom);
    if (rt.x <= lt.x || lb.y <= lt.y)
      return !1;
    const s = Math.sign(transform.a * transform.d - transform.b * transform.c);
    if (s === 0 || (transform.apply(lt, lt), transform.apply(lb, lb), transform.apply(rt, rt), transform.apply(rb, rb), Math.max(lt.x, lb.x, rt.x, rb.x) <= x0 || Math.min(lt.x, lb.x, rt.x, rb.x) >= x1 || Math.max(lt.y, lb.y, rt.y, rb.y) <= y0 || Math.min(lt.y, lb.y, rt.y, rb.y) >= y1))
      return !1;
    const nx = s * (lb.y - lt.y), ny = s * (lt.x - lb.x), n00 = nx * x0 + ny * y0, n10 = nx * x1 + ny * y0, n01 = nx * x0 + ny * y1, n11 = nx * x1 + ny * y1;
    if (Math.max(n00, n10, n01, n11) <= nx * lt.x + ny * lt.y || Math.min(n00, n10, n01, n11) >= nx * rb.x + ny * rb.y)
      return !1;
    const mx = s * (lt.y - rt.y), my = s * (rt.x - lt.x), m00 = mx * x0 + my * y0, m10 = mx * x1 + my * y0, m01 = mx * x0 + my * y1, m11 = mx * x1 + my * y1;
    return !(Math.max(m00, m10, m01, m11) <= mx * lt.x + my * lt.y || Math.min(m00, m10, m01, m11) >= mx * rb.x + my * rb.y);
  }
  /**
   * Pads the rectangle making it grow in all directions.
   * If paddingY is omitted, both paddingX and paddingY will be set to paddingX.
   * @param paddingX - The horizontal padding amount.
   * @param paddingY - The vertical padding amount.
   * @returns Returns itself.
   */
  pad(paddingX = 0, paddingY = paddingX) {
    return this.x -= paddingX, this.y -= paddingY, this.width += paddingX * 2, this.height += paddingY * 2, this;
  }
  /**
   * Fits this rectangle around the passed one.
   * @param rectangle - The rectangle to fit.
   * @returns Returns itself.
   */
  fit(rectangle) {
    const x1 = Math.max(this.x, rectangle.x), x2 = Math.min(this.x + this.width, rectangle.x + rectangle.width), y1 = Math.max(this.y, rectangle.y), y2 = Math.min(this.y + this.height, rectangle.y + rectangle.height);
    return this.x = x1, this.width = Math.max(x2 - x1, 0), this.y = y1, this.height = Math.max(y2 - y1, 0), this;
  }
  /**
   * Enlarges rectangle that way its corners lie on grid
   * @param resolution - resolution
   * @param eps - precision
   * @returns Returns itself.
   */
  ceil(resolution = 1, eps = 1e-3) {
    const x2 = Math.ceil((this.x + this.width - eps) * resolution) / resolution, y2 = Math.ceil((this.y + this.height - eps) * resolution) / resolution;
    return this.x = Math.floor((this.x + eps) * resolution) / resolution, this.y = Math.floor((this.y + eps) * resolution) / resolution, this.width = x2 - this.x, this.height = y2 - this.y, this;
  }
  /**
   * Enlarges this rectangle to include the passed rectangle.
   * @param rectangle - The rectangle to include.
   * @returns Returns itself.
   */
  enlarge(rectangle) {
    const x1 = Math.min(this.x, rectangle.x), x2 = Math.max(this.x + this.width, rectangle.x + rectangle.width), y1 = Math.min(this.y, rectangle.y), y2 = Math.max(this.y + this.height, rectangle.y + rectangle.height);
    return this.x = x1, this.width = x2 - x1, this.y = y1, this.height = y2 - y1, this;
  }
}
Rectangle.prototype.toString = function() {
  return `[@pixi/math:Rectangle x=${this.x} y=${this.y} width=${this.width} height=${this.height}]`;
};
exports.Rectangle = Rectangle;


},{"../Point.js":165,"../const.js":167}],174:[function(require,module,exports){
"use strict";
var _const = require("../const.js");
class RoundedRectangle {
  /**
   * @param x - The X coordinate of the upper-left corner of the rounded rectangle
   * @param y - The Y coordinate of the upper-left corner of the rounded rectangle
   * @param width - The overall width of this rounded rectangle
   * @param height - The overall height of this rounded rectangle
   * @param radius - Controls the radius of the rounded corners
   */
  constructor(x = 0, y = 0, width = 0, height = 0, radius = 20) {
    this.x = x, this.y = y, this.width = width, this.height = height, this.radius = radius, this.type = _const.SHAPES.RREC;
  }
  /**
   * Creates a clone of this Rounded Rectangle.
   * @returns - A copy of the rounded rectangle.
   */
  clone() {
    return new RoundedRectangle(this.x, this.y, this.width, this.height, this.radius);
  }
  /**
   * Checks whether the x and y coordinates given are contained within this Rounded Rectangle
   * @param x - The X coordinate of the point to test.
   * @param y - The Y coordinate of the point to test.
   * @returns - Whether the x/y coordinates are within this Rounded Rectangle.
   */
  contains(x, y) {
    if (this.width <= 0 || this.height <= 0)
      return !1;
    if (x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height) {
      const radius = Math.max(0, Math.min(this.radius, Math.min(this.width, this.height) / 2));
      if (y >= this.y + radius && y <= this.y + this.height - radius || x >= this.x + radius && x <= this.x + this.width - radius)
        return !0;
      let dx = x - (this.x + radius), dy = y - (this.y + radius);
      const radius2 = radius * radius;
      if (dx * dx + dy * dy <= radius2 || (dx = x - (this.x + this.width - radius), dx * dx + dy * dy <= radius2) || (dy = y - (this.y + this.height - radius), dx * dx + dy * dy <= radius2) || (dx = x - (this.x + radius), dx * dx + dy * dy <= radius2))
        return !0;
    }
    return !1;
  }
}
RoundedRectangle.prototype.toString = function() {
  return `[@pixi/math:RoundedRectangle x=${this.x} y=${this.y}width=${this.width} height=${this.height} radius=${this.radius}]`;
};
exports.RoundedRectangle = RoundedRectangle;


},{"../const.js":167}],175:[function(require,module,exports){
"use strict";
class Runner {
  /**
   * @param name - The function name that will be executed on the listeners added to this Runner.
   */
  constructor(name) {
    this.items = [], this._name = name, this._aliasCount = 0;
  }
  /* eslint-disable jsdoc/require-param, jsdoc/check-param-names */
  /**
   * Dispatch/Broadcast Runner to all listeners added to the queue.
   * @param {...any} params - (optional) parameters to pass to each listener
   */
  /*  eslint-enable jsdoc/require-param, jsdoc/check-param-names */
  emit(a0, a1, a2, a3, a4, a5, a6, a7) {
    if (arguments.length > 8)
      throw new Error("max arguments reached");
    const { name, items } = this;
    this._aliasCount++;
    for (let i = 0, len = items.length; i < len; i++)
      items[i][name](a0, a1, a2, a3, a4, a5, a6, a7);
    return items === this.items && this._aliasCount--, this;
  }
  ensureNonAliasedItems() {
    this._aliasCount > 0 && this.items.length > 1 && (this._aliasCount = 0, this.items = this.items.slice(0));
  }
  /**
   * Add a listener to the Runner
   *
   * Runners do not need to have scope or functions passed to them.
   * All that is required is to pass the listening object and ensure that it has contains a function that has the same name
   * as the name provided to the Runner when it was created.
   *
   * E.g. A listener passed to this Runner will require a 'complete' function.
   *
   * ```js
   * import { Runner } from '@pixi/runner';
   *
   * const complete = new Runner('complete');
   * ```
   *
   * The scope used will be the object itself.
   * @param {any} item - The object that will be listening.
   */
  add(item) {
    return item[this._name] && (this.ensureNonAliasedItems(), this.remove(item), this.items.push(item)), this;
  }
  /**
   * Remove a single listener from the dispatch queue.
   * @param {any} item - The listener that you would like to remove.
   */
  remove(item) {
    const index = this.items.indexOf(item);
    return index !== -1 && (this.ensureNonAliasedItems(), this.items.splice(index, 1)), this;
  }
  /**
   * Check to see if the listener is already in the Runner
   * @param {any} item - The listener that you would like to check.
   */
  contains(item) {
    return this.items.includes(item);
  }
  /** Remove all listeners from the Runner */
  removeAll() {
    return this.ensureNonAliasedItems(), this.items.length = 0, this;
  }
  /** Remove all references, don't use after this. */
  destroy() {
    this.removeAll(), this.items = null, this._name = null;
  }
  /**
   * `true` if there are no this Runner contains no listeners
   * @readonly
   */
  get empty() {
    return this.items.length === 0;
  }
  /**
   * The name of the runner.
   * @readonly
   */
  get name() {
    return this._name;
  }
}
Object.defineProperties(Runner.prototype, {
  /**
   * Alias for `emit`
   * @memberof PIXI.Runner#
   * @method dispatch
   * @see PIXI.Runner#emit
   */
  dispatch: { value: Runner.prototype.emit },
  /**
   * Alias for `emit`
   * @memberof PIXI.Runner#
   * @method run
   * @see PIXI.Runner#emit
   */
  run: { value: Runner.prototype.emit }
});
exports.Runner = Runner;


},{}],176:[function(require,module,exports){
"use strict";
var Runner = require("./Runner.js");
exports.Runner = Runner.Runner;


},{"./Runner.js":175}],177:[function(require,module,exports){
"use strict";


},{}],178:[function(require,module,exports){
"use strict";


},{}],179:[function(require,module,exports){
"use strict";
const BrowserAdapter = {
  /**
   * Creates a canvas element of the given size.
   * This canvas is created using the browser's native canvas element.
   * @param width - width of the canvas
   * @param height - height of the canvas
   */
  createCanvas: (width, height) => {
    const canvas = document.createElement("canvas");
    return canvas.width = width, canvas.height = height, canvas;
  },
  getCanvasRenderingContext2D: () => CanvasRenderingContext2D,
  getWebGLRenderingContext: () => WebGLRenderingContext,
  getNavigator: () => navigator,
  getBaseUrl: () => document.baseURI ?? window.location.href,
  getFontFaceSet: () => document.fonts,
  fetch: (url, options) => fetch(url, options),
  parseXML: (xml) => new DOMParser().parseFromString(xml, "text/xml")
};
exports.BrowserAdapter = BrowserAdapter;


},{}],180:[function(require,module,exports){
"use strict";
var adapter = require("./adapter.js");
require("./ICanvas.js");
require("./ICanvasRenderingContext2D.js");
var settings = require("./settings.js"), isMobile = require("./utils/isMobile.js");
exports.BrowserAdapter = adapter.BrowserAdapter;
exports.settings = settings.settings;
exports.isMobile = isMobile.isMobile;


},{"./ICanvas.js":177,"./ICanvasRenderingContext2D.js":178,"./adapter.js":179,"./settings.js":181,"./utils/isMobile.js":182}],181:[function(require,module,exports){
"use strict";
var adapter = require("./adapter.js");
const settings = {
  /**
   * This adapter is used to call methods that are platform dependent.
   * For example `document.createElement` only runs on the web but fails in node environments.
   * This allows us to support more platforms by abstracting away specific implementations per platform.
   *
   * By default the adapter is set to work in the browser. However you can create your own
   * by implementing the `IAdapter` interface. See `IAdapter` for more information.
   * @name ADAPTER
   * @memberof PIXI.settings
   * @type {PIXI.IAdapter}
   * @default PIXI.BrowserAdapter
   */
  ADAPTER: adapter.BrowserAdapter,
  /**
   * Default resolution / device pixel ratio of the renderer.
   * @static
   * @name RESOLUTION
   * @memberof PIXI.settings
   * @type {number}
   * @default 1
   */
  RESOLUTION: 1,
  /**
   * Enables bitmap creation before image load. This feature is experimental.
   * @static
   * @name CREATE_IMAGE_BITMAP
   * @memberof PIXI.settings
   * @type {boolean}
   * @default false
   */
  CREATE_IMAGE_BITMAP: !1,
  /**
   * If true PixiJS will Math.floor() x/y values when rendering, stopping pixel interpolation.
   * Advantages can include sharper image quality (like text) and faster rendering on canvas.
   * The main disadvantage is movement of objects may appear less smooth.
   * @static
   * @memberof PIXI.settings
   * @type {boolean}
   * @default false
   */
  ROUND_PIXELS: !1
};
exports.settings = settings;


},{"./adapter.js":179}],182:[function(require,module,exports){
"use strict";
var isMobileJs = require("ismobilejs");
const isMobileCall = isMobileJs.default ?? isMobileJs, isMobile = isMobileCall(globalThis.navigator);
exports.isMobile = isMobile;


},{"ismobilejs":218}],183:[function(require,module,exports){
"use strict";
var _const = require("./const.js"), TickerListener = require("./TickerListener.js");
const _Ticker = class _Ticker2 {
  constructor() {
    this.autoStart = !1, this.deltaTime = 1, this.lastTime = -1, this.speed = 1, this.started = !1, this._requestId = null, this._maxElapsedMS = 100, this._minElapsedMS = 0, this._protected = !1, this._lastFrame = -1, this._head = new TickerListener.TickerListener(null, null, 1 / 0), this.deltaMS = 1 / _Ticker2.targetFPMS, this.elapsedMS = 1 / _Ticker2.targetFPMS, this._tick = (time) => {
      this._requestId = null, this.started && (this.update(time), this.started && this._requestId === null && this._head.next && (this._requestId = requestAnimationFrame(this._tick)));
    };
  }
  /**
   * Conditionally requests a new animation frame.
   * If a frame has not already been requested, and if the internal
   * emitter has listeners, a new frame is requested.
   * @private
   */
  _requestIfNeeded() {
    this._requestId === null && this._head.next && (this.lastTime = performance.now(), this._lastFrame = this.lastTime, this._requestId = requestAnimationFrame(this._tick));
  }
  /**
   * Conditionally cancels a pending animation frame.
   * @private
   */
  _cancelIfNeeded() {
    this._requestId !== null && (cancelAnimationFrame(this._requestId), this._requestId = null);
  }
  /**
   * Conditionally requests a new animation frame.
   * If the ticker has been started it checks if a frame has not already
   * been requested, and if the internal emitter has listeners. If these
   * conditions are met, a new frame is requested. If the ticker has not
   * been started, but autoStart is `true`, then the ticker starts now,
   * and continues with the previous conditions to request a new frame.
   * @private
   */
  _startIfPossible() {
    this.started ? this._requestIfNeeded() : this.autoStart && this.start();
  }
  /**
   * Register a handler for tick events. Calls continuously unless
   * it is removed or the ticker is stopped.
   * @param fn - The listener function to be added for updates
   * @param context - The listener context
   * @param {number} [priority=PIXI.UPDATE_PRIORITY.NORMAL] - The priority for emitting
   * @returns This instance of a ticker
   */
  add(fn, context, priority = _const.UPDATE_PRIORITY.NORMAL) {
    return this._addListener(new TickerListener.TickerListener(fn, context, priority));
  }
  /**
   * Add a handler for the tick event which is only execute once.
   * @param fn - The listener function to be added for one update
   * @param context - The listener context
   * @param {number} [priority=PIXI.UPDATE_PRIORITY.NORMAL] - The priority for emitting
   * @returns This instance of a ticker
   */
  addOnce(fn, context, priority = _const.UPDATE_PRIORITY.NORMAL) {
    return this._addListener(new TickerListener.TickerListener(fn, context, priority, !0));
  }
  /**
   * Internally adds the event handler so that it can be sorted by priority.
   * Priority allows certain handler (user, AnimatedSprite, Interaction) to be run
   * before the rendering.
   * @private
   * @param listener - Current listener being added.
   * @returns This instance of a ticker
   */
  _addListener(listener) {
    let current = this._head.next, previous = this._head;
    if (!current)
      listener.connect(previous);
    else {
      for (; current; ) {
        if (listener.priority > current.priority) {
          listener.connect(previous);
          break;
        }
        previous = current, current = current.next;
      }
      listener.previous || listener.connect(previous);
    }
    return this._startIfPossible(), this;
  }
  /**
   * Removes any handlers matching the function and context parameters.
   * If no handlers are left after removing, then it cancels the animation frame.
   * @param fn - The listener function to be removed
   * @param context - The listener context to be removed
   * @returns This instance of a ticker
   */
  remove(fn, context) {
    let listener = this._head.next;
    for (; listener; )
      listener.match(fn, context) ? listener = listener.destroy() : listener = listener.next;
    return this._head.next || this._cancelIfNeeded(), this;
  }
  /**
   * The number of listeners on this ticker, calculated by walking through linked list
   * @readonly
   * @member {number}
   */
  get count() {
    if (!this._head)
      return 0;
    let count = 0, current = this._head;
    for (; current = current.next; )
      count++;
    return count;
  }
  /** Starts the ticker. If the ticker has listeners a new animation frame is requested at this point. */
  start() {
    this.started || (this.started = !0, this._requestIfNeeded());
  }
  /** Stops the ticker. If the ticker has requested an animation frame it is canceled at this point. */
  stop() {
    this.started && (this.started = !1, this._cancelIfNeeded());
  }
  /** Destroy the ticker and don't use after this. Calling this method removes all references to internal events. */
  destroy() {
    if (!this._protected) {
      this.stop();
      let listener = this._head.next;
      for (; listener; )
        listener = listener.destroy(!0);
      this._head.destroy(), this._head = null;
    }
  }
  /**
   * Triggers an update. An update entails setting the
   * current {@link PIXI.Ticker#elapsedMS},
   * the current {@link PIXI.Ticker#deltaTime},
   * invoking all listeners with current deltaTime,
   * and then finally setting {@link PIXI.Ticker#lastTime}
   * with the value of currentTime that was provided.
   * This method will be called automatically by animation
   * frame callbacks if the ticker instance has been started
   * and listeners are added.
   * @param {number} [currentTime=performance.now()] - the current time of execution
   */
  update(currentTime = performance.now()) {
    let elapsedMS;
    if (currentTime > this.lastTime) {
      if (elapsedMS = this.elapsedMS = currentTime - this.lastTime, elapsedMS > this._maxElapsedMS && (elapsedMS = this._maxElapsedMS), elapsedMS *= this.speed, this._minElapsedMS) {
        const delta = currentTime - this._lastFrame | 0;
        if (delta < this._minElapsedMS)
          return;
        this._lastFrame = currentTime - delta % this._minElapsedMS;
      }
      this.deltaMS = elapsedMS, this.deltaTime = this.deltaMS * _Ticker2.targetFPMS;
      const head = this._head;
      let listener = head.next;
      for (; listener; )
        listener = listener.emit(this.deltaTime);
      head.next || this._cancelIfNeeded();
    } else
      this.deltaTime = this.deltaMS = this.elapsedMS = 0;
    this.lastTime = currentTime;
  }
  /**
   * The frames per second at which this ticker is running.
   * The default is approximately 60 in most modern browsers.
   * **Note:** This does not factor in the value of
   * {@link PIXI.Ticker#speed}, which is specific
   * to scaling {@link PIXI.Ticker#deltaTime}.
   * @member {number}
   * @readonly
   */
  get FPS() {
    return 1e3 / this.elapsedMS;
  }
  /**
   * Manages the maximum amount of milliseconds allowed to
   * elapse between invoking {@link PIXI.Ticker#update}.
   * This value is used to cap {@link PIXI.Ticker#deltaTime},
   * but does not effect the measured value of {@link PIXI.Ticker#FPS}.
   * When setting this property it is clamped to a value between
   * `0` and `Ticker.targetFPMS * 1000`.
   * @member {number}
   * @default 10
   */
  get minFPS() {
    return 1e3 / this._maxElapsedMS;
  }
  set minFPS(fps) {
    const minFPS = Math.min(this.maxFPS, fps), minFPMS = Math.min(Math.max(0, minFPS) / 1e3, _Ticker2.targetFPMS);
    this._maxElapsedMS = 1 / minFPMS;
  }
  /**
   * Manages the minimum amount of milliseconds required to
   * elapse between invoking {@link PIXI.Ticker#update}.
   * This will effect the measured value of {@link PIXI.Ticker#FPS}.
   * If it is set to `0`, then there is no limit; PixiJS will render as many frames as it can.
   * Otherwise it will be at least `minFPS`
   * @member {number}
   * @default 0
   */
  get maxFPS() {
    return this._minElapsedMS ? Math.round(1e3 / this._minElapsedMS) : 0;
  }
  set maxFPS(fps) {
    if (fps === 0)
      this._minElapsedMS = 0;
    else {
      const maxFPS = Math.max(this.minFPS, fps);
      this._minElapsedMS = 1 / (maxFPS / 1e3);
    }
  }
  /**
   * The shared ticker instance used by {@link PIXI.AnimatedSprite} and by
   * {@link PIXI.VideoResource} to update animation frames / video textures.
   *
   * It may also be used by {@link PIXI.Application} if created with the `sharedTicker` option property set to true.
   *
   * The property {@link PIXI.Ticker#autoStart} is set to `true` for this instance.
   * Please follow the examples for usage, including how to opt-out of auto-starting the shared ticker.
   * @example
   * import { Ticker } from 'pixi.js';
   *
   * const ticker = Ticker.shared;
   * // Set this to prevent starting this ticker when listeners are added.
   * // By default this is true only for the PIXI.Ticker.shared instance.
   * ticker.autoStart = false;
   *
   * // FYI, call this to ensure the ticker is stopped. It should be stopped
   * // if you have not attempted to render anything yet.
   * ticker.stop();
   *
   * // Call this when you are ready for a running shared ticker.
   * ticker.start();
   * @example
   * import { autoDetectRenderer, Container } from 'pixi.js';
   *
   * // You may use the shared ticker to render...
   * const renderer = autoDetectRenderer();
   * const stage = new Container();
   * document.body.appendChild(renderer.view);
   * ticker.add((time) => renderer.render(stage));
   *
   * // Or you can just update it manually.
   * ticker.autoStart = false;
   * ticker.stop();
   * const animate = (time) => {
   *     ticker.update(time);
   *     renderer.render(stage);
   *     requestAnimationFrame(animate);
   * };
   * animate(performance.now());
   * @member {PIXI.Ticker}
   * @static
   */
  static get shared() {
    if (!_Ticker2._shared) {
      const shared = _Ticker2._shared = new _Ticker2();
      shared.autoStart = !0, shared._protected = !0;
    }
    return _Ticker2._shared;
  }
  /**
   * The system ticker instance used by {@link PIXI.BasePrepare} for core timing
   * functionality that shouldn't usually need to be paused, unlike the `shared`
   * ticker which drives visual animations and rendering which may want to be paused.
   *
   * The property {@link PIXI.Ticker#autoStart} is set to `true` for this instance.
   * @member {PIXI.Ticker}
   * @static
   */
  static get system() {
    if (!_Ticker2._system) {
      const system = _Ticker2._system = new _Ticker2();
      system.autoStart = !0, system._protected = !0;
    }
    return _Ticker2._system;
  }
};
_Ticker.targetFPMS = 0.06;
let Ticker = _Ticker;
exports.Ticker = Ticker;


},{"./TickerListener.js":184,"./const.js":186}],184:[function(require,module,exports){
"use strict";
class TickerListener {
  /**
   * Constructor
   * @private
   * @param fn - The listener function to be added for one update
   * @param context - The listener context
   * @param priority - The priority for emitting
   * @param once - If the handler should fire once
   */
  constructor(fn, context = null, priority = 0, once = !1) {
    this.next = null, this.previous = null, this._destroyed = !1, this.fn = fn, this.context = context, this.priority = priority, this.once = once;
  }
  /**
   * Simple compare function to figure out if a function and context match.
   * @private
   * @param fn - The listener function to be added for one update
   * @param context - The listener context
   * @returns `true` if the listener match the arguments
   */
  match(fn, context = null) {
    return this.fn === fn && this.context === context;
  }
  /**
   * Emit by calling the current function.
   * @private
   * @param deltaTime - time since the last emit.
   * @returns Next ticker
   */
  emit(deltaTime) {
    this.fn && (this.context ? this.fn.call(this.context, deltaTime) : this.fn(deltaTime));
    const redirect = this.next;
    return this.once && this.destroy(!0), this._destroyed && (this.next = null), redirect;
  }
  /**
   * Connect to the list.
   * @private
   * @param previous - Input node, previous listener
   */
  connect(previous) {
    this.previous = previous, previous.next && (previous.next.previous = this), this.next = previous.next, previous.next = this;
  }
  /**
   * Destroy and don't use after this.
   * @private
   * @param hard - `true` to remove the `next` reference, this
   *        is considered a hard destroy. Soft destroy maintains the next reference.
   * @returns The listener to redirect while emitting or removing.
   */
  destroy(hard = !1) {
    this._destroyed = !0, this.fn = null, this.context = null, this.previous && (this.previous.next = this.next), this.next && (this.next.previous = this.previous);
    const redirect = this.next;
    return this.next = hard ? null : redirect, this.previous = null, redirect;
  }
}
exports.TickerListener = TickerListener;


},{}],185:[function(require,module,exports){
"use strict";
var extensions = require("@pixi/extensions"), _const = require("./const.js"), Ticker = require("./Ticker.js");
class TickerPlugin {
  /**
   * Initialize the plugin with scope of application instance
   * @static
   * @private
   * @param {object} [options] - See application options
   */
  static init(options) {
    options = Object.assign({
      autoStart: !0,
      sharedTicker: !1
    }, options), Object.defineProperty(
      this,
      "ticker",
      {
        set(ticker) {
          this._ticker && this._ticker.remove(this.render, this), this._ticker = ticker, ticker && ticker.add(this.render, this, _const.UPDATE_PRIORITY.LOW);
        },
        get() {
          return this._ticker;
        }
      }
    ), this.stop = () => {
      this._ticker.stop();
    }, this.start = () => {
      this._ticker.start();
    }, this._ticker = null, this.ticker = options.sharedTicker ? Ticker.Ticker.shared : new Ticker.Ticker(), options.autoStart && this.start();
  }
  /**
   * Clean up the ticker, scoped to application.
   * @static
   * @private
   */
  static destroy() {
    if (this._ticker) {
      const oldTicker = this._ticker;
      this.ticker = null, oldTicker.destroy();
    }
  }
}
TickerPlugin.extension = extensions.ExtensionType.Application;
extensions.extensions.add(TickerPlugin);
exports.TickerPlugin = TickerPlugin;


},{"./Ticker.js":183,"./const.js":186,"@pixi/extensions":160}],186:[function(require,module,exports){
"use strict";
var UPDATE_PRIORITY = /* @__PURE__ */ ((UPDATE_PRIORITY2) => (UPDATE_PRIORITY2[UPDATE_PRIORITY2.INTERACTION = 50] = "INTERACTION", UPDATE_PRIORITY2[UPDATE_PRIORITY2.HIGH = 25] = "HIGH", UPDATE_PRIORITY2[UPDATE_PRIORITY2.NORMAL = 0] = "NORMAL", UPDATE_PRIORITY2[UPDATE_PRIORITY2.LOW = -25] = "LOW", UPDATE_PRIORITY2[UPDATE_PRIORITY2.UTILITY = -50] = "UTILITY", UPDATE_PRIORITY2))(UPDATE_PRIORITY || {});
exports.UPDATE_PRIORITY = UPDATE_PRIORITY;


},{}],187:[function(require,module,exports){
"use strict";
require("./settings.js");
var _const = require("./const.js"), Ticker = require("./Ticker.js"), TickerPlugin = require("./TickerPlugin.js");
exports.UPDATE_PRIORITY = _const.UPDATE_PRIORITY;
exports.Ticker = Ticker.Ticker;
exports.TickerPlugin = TickerPlugin.TickerPlugin;


},{"./Ticker.js":183,"./TickerPlugin.js":185,"./const.js":186,"./settings.js":188}],188:[function(require,module,exports){
"use strict";
var settings = require("@pixi/settings"), utils = require("@pixi/utils"), Ticker = require("./Ticker.js");
Object.defineProperties(settings.settings, {
  /**
   * Target frames per millisecond.
   * @static
   * @name TARGET_FPMS
   * @memberof PIXI.settings
   * @type {number}
   * @deprecated since 7.1.0
   * @see PIXI.Ticker.targetFPMS
   */
  TARGET_FPMS: {
    get() {
      return Ticker.Ticker.targetFPMS;
    },
    set(value) {
      utils.deprecation("7.1.0", "settings.TARGET_FPMS is deprecated, use Ticker.targetFPMS"), Ticker.Ticker.targetFPMS = value;
    }
  }
});
Object.defineProperty(exports, "settings", {
  enumerable: !0,
  get: function() {
    return settings.settings;
  }
});


},{"./Ticker.js":183,"@pixi/settings":180,"@pixi/utils":202}],189:[function(require,module,exports){
"use strict";
var constants = require("@pixi/constants");
let promise;
async function detectVideoAlphaMode() {
  return promise ?? (promise = (async () => {
    const gl = document.createElement("canvas").getContext("webgl");
    if (!gl)
      return constants.ALPHA_MODES.UNPACK;
    const video = await new Promise((resolve) => {
      const video2 = document.createElement("video");
      video2.onloadeddata = () => resolve(video2), video2.onerror = () => resolve(null), video2.autoplay = !1, video2.crossOrigin = "anonymous", video2.preload = "auto", video2.src = "data:video/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEAAAAAAAHTEU2bdLpNu4tTq4QVSalmU6yBoU27i1OrhBZUrmtTrIHGTbuMU6uEElTDZ1OsggEXTbuMU6uEHFO7a1OsggG97AEAAAAAAABZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmoCrXsYMPQkBNgIRMYXZmV0GETGF2ZkSJiEBEAAAAAAAAFlSua8yuAQAAAAAAAEPXgQFzxYgAAAAAAAAAAZyBACK1nIN1bmSIgQCGhVZfVlA5g4EBI+ODhAJiWgDglLCBArqBApqBAlPAgQFVsIRVuYEBElTDZ9Vzc9JjwItjxYgAAAAAAAAAAWfInEWjh0VOQ09ERVJEh49MYXZjIGxpYnZweC12cDlnyKJFo4hEVVJBVElPTkSHlDAwOjAwOjAwLjA0MDAwMDAwMAAAH0O2dcfngQCgwqGggQAAAIJJg0IAABAAFgA4JBwYSgAAICAAEb///4r+AAB1oZ2mm+6BAaWWgkmDQgAAEAAWADgkHBhKAAAgIABIQBxTu2uRu4+zgQC3iveBAfGCAXHwgQM=", video2.load();
    });
    if (!video)
      return constants.ALPHA_MODES.UNPACK;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer), gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0
    ), gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1), gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE), gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    const pixel = new Uint8Array(4);
    return gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel), gl.deleteFramebuffer(framebuffer), gl.deleteTexture(texture), gl.getExtension("WEBGL_lose_context")?.loseContext(), pixel[0] <= pixel[3] ? constants.ALPHA_MODES.PMA : constants.ALPHA_MODES.UNPACK;
  })()), promise;
}
exports.detectVideoAlphaMode = detectVideoAlphaMode;


},{"@pixi/constants":31}],190:[function(require,module,exports){
"use strict";
var deprecation = require("../logging/deprecation.js");
function skipHello() {
  deprecation.deprecation("7.0.0", "skipHello is deprecated, please use settings.RENDER_OPTIONS.hello");
}
function sayHello() {
  deprecation.deprecation("7.0.0", `sayHello is deprecated, please use Renderer's "hello" option`);
}
exports.sayHello = sayHello;
exports.skipHello = skipHello;


},{"../logging/deprecation.js":203}],191:[function(require,module,exports){
"use strict";
require("../settings.js");
var settings = require("@pixi/settings");
let supported;
function isWebGLSupported() {
  return typeof supported > "u" && (supported = function() {
    const contextOptions = {
      stencil: !0,
      failIfMajorPerformanceCaveat: settings.settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT
    };
    try {
      if (!settings.settings.ADAPTER.getWebGLRenderingContext())
        return !1;
      const canvas = settings.settings.ADAPTER.createCanvas();
      let gl = canvas.getContext("webgl", contextOptions) || canvas.getContext("experimental-webgl", contextOptions);
      const success = !!gl?.getContextAttributes()?.stencil;
      if (gl) {
        const loseContext = gl.getExtension("WEBGL_lose_context");
        loseContext && loseContext.loseContext();
      }
      return gl = null, success;
    } catch {
      return !1;
    }
  }()), supported;
}
exports.isWebGLSupported = isWebGLSupported;


},{"../settings.js":213,"@pixi/settings":180}],192:[function(require,module,exports){
"use strict";
var color = require("@pixi/color"), deprecation = require("../logging/deprecation.js");
function hex2rgb(hex, out = []) {
  return deprecation.deprecation("7.2.0", "utils.hex2rgb is deprecated, use Color#toRgbArray instead"), color.Color.shared.setValue(hex).toRgbArray(out);
}
function hex2string(hex) {
  return deprecation.deprecation("7.2.0", "utils.hex2string is deprecated, use Color#toHex instead"), color.Color.shared.setValue(hex).toHex();
}
function string2hex(string) {
  return deprecation.deprecation("7.2.0", "utils.string2hex is deprecated, use Color#toNumber instead"), color.Color.shared.setValue(string).toNumber();
}
function rgb2hex(rgb) {
  return deprecation.deprecation("7.2.0", "utils.rgb2hex is deprecated, use Color#toNumber instead"), color.Color.shared.setValue(rgb).toNumber();
}
exports.hex2rgb = hex2rgb;
exports.hex2string = hex2string;
exports.rgb2hex = rgb2hex;
exports.string2hex = string2hex;


},{"../logging/deprecation.js":203,"@pixi/color":28}],193:[function(require,module,exports){
"use strict";
var color = require("@pixi/color"), constants = require("@pixi/constants"), deprecation = require("../logging/deprecation.js");
function mapPremultipliedBlendModes() {
  const pm = [], npm = [];
  for (let i = 0; i < 32; i++)
    pm[i] = i, npm[i] = i;
  pm[constants.BLEND_MODES.NORMAL_NPM] = constants.BLEND_MODES.NORMAL, pm[constants.BLEND_MODES.ADD_NPM] = constants.BLEND_MODES.ADD, pm[constants.BLEND_MODES.SCREEN_NPM] = constants.BLEND_MODES.SCREEN, npm[constants.BLEND_MODES.NORMAL] = constants.BLEND_MODES.NORMAL_NPM, npm[constants.BLEND_MODES.ADD] = constants.BLEND_MODES.ADD_NPM, npm[constants.BLEND_MODES.SCREEN] = constants.BLEND_MODES.SCREEN_NPM;
  const array = [];
  return array.push(npm), array.push(pm), array;
}
const premultiplyBlendMode = mapPremultipliedBlendModes();
function correctBlendMode(blendMode, premultiplied) {
  return premultiplyBlendMode[premultiplied ? 1 : 0][blendMode];
}
function premultiplyRgba(rgb, alpha, out, premultiply = !0) {
  return deprecation.deprecation("7.2.0", "utils.premultiplyRgba has moved to Color.premultiply"), color.Color.shared.setValue(rgb).premultiply(alpha, premultiply).toArray(out ?? new Float32Array(4));
}
function premultiplyTint(tint, alpha) {
  return deprecation.deprecation("7.2.0", "utils.premultiplyTint has moved to Color.toPremultiplied"), color.Color.shared.setValue(tint).toPremultiplied(alpha);
}
function premultiplyTintToRgba(tint, alpha, out, premultiply = !0) {
  return deprecation.deprecation("7.2.0", "utils.premultiplyTintToRgba has moved to Color.premultiply"), color.Color.shared.setValue(tint).premultiply(alpha, premultiply).toArray(out ?? new Float32Array(4));
}
exports.correctBlendMode = correctBlendMode;
exports.premultiplyBlendMode = premultiplyBlendMode;
exports.premultiplyRgba = premultiplyRgba;
exports.premultiplyTint = premultiplyTint;
exports.premultiplyTintToRgba = premultiplyTintToRgba;


},{"../logging/deprecation.js":203,"@pixi/color":28,"@pixi/constants":31}],194:[function(require,module,exports){
"use strict";
const DATA_URI = /^\s*data:(?:([\w-]+)\/([\w+.-]+))?(?:;charset=([\w-]+))?(?:;(base64))?,(.*)/i;
exports.DATA_URI = DATA_URI;


},{}],195:[function(require,module,exports){
"use strict";
function createIndicesForQuads(size, outBuffer = null) {
  const totalIndices = size * 6;
  if (outBuffer = outBuffer || new Uint16Array(totalIndices), outBuffer.length !== totalIndices)
    throw new Error(`Out buffer length is incorrect, got ${outBuffer.length} and expected ${totalIndices}`);
  for (let i = 0, j = 0; i < totalIndices; i += 6, j += 4)
    outBuffer[i + 0] = j + 0, outBuffer[i + 1] = j + 1, outBuffer[i + 2] = j + 2, outBuffer[i + 3] = j + 0, outBuffer[i + 4] = j + 2, outBuffer[i + 5] = j + 3;
  return outBuffer;
}
exports.createIndicesForQuads = createIndicesForQuads;


},{}],196:[function(require,module,exports){
"use strict";
function getBufferType(array) {
  if (array.BYTES_PER_ELEMENT === 4)
    return array instanceof Float32Array ? "Float32Array" : array instanceof Uint32Array ? "Uint32Array" : "Int32Array";
  if (array.BYTES_PER_ELEMENT === 2) {
    if (array instanceof Uint16Array)
      return "Uint16Array";
  } else if (array.BYTES_PER_ELEMENT === 1 && array instanceof Uint8Array)
    return "Uint8Array";
  return null;
}
exports.getBufferType = getBufferType;


},{}],197:[function(require,module,exports){
"use strict";
var getBufferType = require("./getBufferType.js");
const map = { Float32Array, Uint32Array, Int32Array, Uint8Array };
function interleaveTypedArrays(arrays, sizes) {
  let outSize = 0, stride = 0;
  const views = {};
  for (let i = 0; i < arrays.length; i++)
    stride += sizes[i], outSize += arrays[i].length;
  const buffer = new ArrayBuffer(outSize * 4);
  let out = null, littleOffset = 0;
  for (let i = 0; i < arrays.length; i++) {
    const size = sizes[i], array = arrays[i], type = getBufferType.getBufferType(array);
    views[type] || (views[type] = new map[type](buffer)), out = views[type];
    for (let j = 0; j < array.length; j++) {
      const indexStart = (j / size | 0) * stride + littleOffset, index = j % size;
      out[indexStart + index] = array[j];
    }
    littleOffset += size;
  }
  return new Float32Array(buffer);
}
exports.interleaveTypedArrays = interleaveTypedArrays;


},{"./getBufferType.js":196}],198:[function(require,module,exports){
"use strict";
function nextPow2(v) {
  return v += v === 0 ? 1 : 0, --v, v |= v >>> 1, v |= v >>> 2, v |= v >>> 4, v |= v >>> 8, v |= v >>> 16, v + 1;
}
function isPow2(v) {
  return !(v & v - 1) && !!v;
}
function log2(v) {
  let r = (v > 65535 ? 1 : 0) << 4;
  v >>>= r;
  let shift = (v > 255 ? 1 : 0) << 3;
  return v >>>= shift, r |= shift, shift = (v > 15 ? 1 : 0) << 2, v >>>= shift, r |= shift, shift = (v > 3 ? 1 : 0) << 1, v >>>= shift, r |= shift, r | v >> 1;
}
exports.isPow2 = isPow2;
exports.log2 = log2;
exports.nextPow2 = nextPow2;


},{}],199:[function(require,module,exports){
"use strict";
function removeItems(arr, startIdx, removeCount) {
  const length = arr.length;
  let i;
  if (startIdx >= length || removeCount === 0)
    return;
  removeCount = startIdx + removeCount > length ? length - startIdx : removeCount;
  const len = length - removeCount;
  for (i = startIdx; i < len; ++i)
    arr[i] = arr[i + removeCount];
  arr.length = len;
}
exports.removeItems = removeItems;


},{}],200:[function(require,module,exports){
"use strict";
function sign(n) {
  return n === 0 ? 0 : n < 0 ? -1 : 1;
}
exports.sign = sign;


},{}],201:[function(require,module,exports){
"use strict";
let nextUid = 0;
function uid() {
  return ++nextUid;
}
exports.uid = uid;


},{}],202:[function(require,module,exports){
"use strict";
require("./settings.js");
var settings = require("@pixi/settings"), eventemitter3 = require("eventemitter3"), earcut = require("earcut"), url = require("./url.js"), path = require("./path.js"), detectVideoAlphaMode = require("./browser/detectVideoAlphaMode.js"), hello = require("./browser/hello.js"), isWebGLSupported = require("./browser/isWebGLSupported.js"), hex = require("./color/hex.js"), premultiply = require("./color/premultiply.js"), _const = require("./const.js"), createIndicesForQuads = require("./data/createIndicesForQuads.js"), getBufferType = require("./data/getBufferType.js"), interleaveTypedArrays = require("./data/interleaveTypedArrays.js"), pow2 = require("./data/pow2.js"), removeItems = require("./data/removeItems.js"), sign = require("./data/sign.js"), uid = require("./data/uid.js"), deprecation = require("./logging/deprecation.js"), BoundingBox = require("./media/BoundingBox.js"), caches = require("./media/caches.js"), CanvasRenderTarget = require("./media/CanvasRenderTarget.js"), getCanvasBoundingBox = require("./media/getCanvasBoundingBox.js"), trimCanvas = require("./media/trimCanvas.js"), decomposeDataUri = require("./network/decomposeDataUri.js"), determineCrossOrigin = require("./network/determineCrossOrigin.js"), getResolutionOfUrl = require("./network/getResolutionOfUrl.js");
require("./types/index.js");
Object.defineProperty(exports, "isMobile", {
  enumerable: !0,
  get: function() {
    return settings.isMobile;
  }
});
exports.EventEmitter = eventemitter3;
exports.earcut = earcut;
exports.url = url.url;
exports.path = path.path;
exports.detectVideoAlphaMode = detectVideoAlphaMode.detectVideoAlphaMode;
exports.sayHello = hello.sayHello;
exports.skipHello = hello.skipHello;
exports.isWebGLSupported = isWebGLSupported.isWebGLSupported;
exports.hex2rgb = hex.hex2rgb;
exports.hex2string = hex.hex2string;
exports.rgb2hex = hex.rgb2hex;
exports.string2hex = hex.string2hex;
exports.correctBlendMode = premultiply.correctBlendMode;
exports.premultiplyBlendMode = premultiply.premultiplyBlendMode;
exports.premultiplyRgba = premultiply.premultiplyRgba;
exports.premultiplyTint = premultiply.premultiplyTint;
exports.premultiplyTintToRgba = premultiply.premultiplyTintToRgba;
exports.DATA_URI = _const.DATA_URI;
exports.createIndicesForQuads = createIndicesForQuads.createIndicesForQuads;
exports.getBufferType = getBufferType.getBufferType;
exports.interleaveTypedArrays = interleaveTypedArrays.interleaveTypedArrays;
exports.isPow2 = pow2.isPow2;
exports.log2 = pow2.log2;
exports.nextPow2 = pow2.nextPow2;
exports.removeItems = removeItems.removeItems;
exports.sign = sign.sign;
exports.uid = uid.uid;
exports.deprecation = deprecation.deprecation;
exports.BoundingBox = BoundingBox.BoundingBox;
exports.BaseTextureCache = caches.BaseTextureCache;
exports.ProgramCache = caches.ProgramCache;
exports.TextureCache = caches.TextureCache;
exports.clearTextureCache = caches.clearTextureCache;
exports.destroyTextureCache = caches.destroyTextureCache;
exports.CanvasRenderTarget = CanvasRenderTarget.CanvasRenderTarget;
exports.getCanvasBoundingBox = getCanvasBoundingBox.getCanvasBoundingBox;
exports.trimCanvas = trimCanvas.trimCanvas;
exports.decomposeDataUri = decomposeDataUri.decomposeDataUri;
exports.determineCrossOrigin = determineCrossOrigin.determineCrossOrigin;
exports.getResolutionOfUrl = getResolutionOfUrl.getResolutionOfUrl;


},{"./browser/detectVideoAlphaMode.js":189,"./browser/hello.js":190,"./browser/isWebGLSupported.js":191,"./color/hex.js":192,"./color/premultiply.js":193,"./const.js":194,"./data/createIndicesForQuads.js":195,"./data/getBufferType.js":196,"./data/interleaveTypedArrays.js":197,"./data/pow2.js":198,"./data/removeItems.js":199,"./data/sign.js":200,"./data/uid.js":201,"./logging/deprecation.js":203,"./media/BoundingBox.js":204,"./media/CanvasRenderTarget.js":205,"./media/caches.js":206,"./media/getCanvasBoundingBox.js":207,"./media/trimCanvas.js":208,"./network/decomposeDataUri.js":209,"./network/determineCrossOrigin.js":210,"./network/getResolutionOfUrl.js":211,"./path.js":212,"./settings.js":213,"./types/index.js":214,"./url.js":215,"@pixi/settings":180,"earcut":216,"eventemitter3":217}],203:[function(require,module,exports){
"use strict";
const warnings = {};
function deprecation(version, message, ignoreDepth = 3) {
  if (warnings[message])
    return;
  let stack = new Error().stack;
  typeof stack > "u" ? console.warn("PixiJS Deprecation Warning: ", `${message}
Deprecated since v${version}`) : (stack = stack.split(`
`).splice(ignoreDepth).join(`
`), console.groupCollapsed ? (console.groupCollapsed(
    "%cPixiJS Deprecation Warning: %c%s",
    "color:#614108;background:#fffbe6",
    "font-weight:normal;color:#614108;background:#fffbe6",
    `${message}
Deprecated since v${version}`
  ), console.warn(stack), console.groupEnd()) : (console.warn("PixiJS Deprecation Warning: ", `${message}
Deprecated since v${version}`), console.warn(stack))), warnings[message] = !0;
}
exports.deprecation = deprecation;


},{}],204:[function(require,module,exports){
"use strict";
const _BoundingBox = class {
  /**
   * @param left - The left coordinate value of the bounding box.
   * @param top - The top coordinate value of the bounding box.
   * @param right - The right coordinate value of the bounding box.
   * @param bottom - The bottom coordinate value of the bounding box.
   */
  constructor(left, top, right, bottom) {
    this.left = left, this.top = top, this.right = right, this.bottom = bottom;
  }
  /** The width of the bounding box. */
  get width() {
    return this.right - this.left;
  }
  /** The height of the bounding box. */
  get height() {
    return this.bottom - this.top;
  }
  /** Determines whether the BoundingBox is empty. */
  isEmpty() {
    return this.left === this.right || this.top === this.bottom;
  }
};
_BoundingBox.EMPTY = new _BoundingBox(0, 0, 0, 0);
let BoundingBox = _BoundingBox;
exports.BoundingBox = BoundingBox;


},{}],205:[function(require,module,exports){
"use strict";
var settings = require("@pixi/settings");
class CanvasRenderTarget {
  /**
   * @param width - the width for the newly created canvas
   * @param height - the height for the newly created canvas
   * @param {number} [resolution=PIXI.settings.RESOLUTION] - The resolution / device pixel ratio of the canvas
   */
  constructor(width, height, resolution) {
    this._canvas = settings.settings.ADAPTER.createCanvas(), this._context = this._canvas.getContext("2d"), this.resolution = resolution || settings.settings.RESOLUTION, this.resize(width, height);
  }
  /**
   * Clears the canvas that was created by the CanvasRenderTarget class.
   * @private
   */
  clear() {
    this._checkDestroyed(), this._context.setTransform(1, 0, 0, 1, 0, 0), this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
  }
  /**
   * Resizes the canvas to the specified width and height.
   * @param desiredWidth - the desired width of the canvas
   * @param desiredHeight - the desired height of the canvas
   */
  resize(desiredWidth, desiredHeight) {
    this._checkDestroyed(), this._canvas.width = Math.round(desiredWidth * this.resolution), this._canvas.height = Math.round(desiredHeight * this.resolution);
  }
  /** Destroys this canvas. */
  destroy() {
    this._context = null, this._canvas = null;
  }
  /**
   * The width of the canvas buffer in pixels.
   * @member {number}
   */
  get width() {
    return this._checkDestroyed(), this._canvas.width;
  }
  set width(val) {
    this._checkDestroyed(), this._canvas.width = Math.round(val);
  }
  /**
   * The height of the canvas buffer in pixels.
   * @member {number}
   */
  get height() {
    return this._checkDestroyed(), this._canvas.height;
  }
  set height(val) {
    this._checkDestroyed(), this._canvas.height = Math.round(val);
  }
  /** The Canvas object that belongs to this CanvasRenderTarget. */
  get canvas() {
    return this._checkDestroyed(), this._canvas;
  }
  /** A CanvasRenderingContext2D object representing a two-dimensional rendering context. */
  get context() {
    return this._checkDestroyed(), this._context;
  }
  _checkDestroyed() {
    if (this._canvas === null)
      throw new TypeError("The CanvasRenderTarget has already been destroyed");
  }
}
exports.CanvasRenderTarget = CanvasRenderTarget;


},{"@pixi/settings":180}],206:[function(require,module,exports){
"use strict";
const ProgramCache = {}, TextureCache = /* @__PURE__ */ Object.create(null), BaseTextureCache = /* @__PURE__ */ Object.create(null);
function destroyTextureCache() {
  let key;
  for (key in TextureCache)
    TextureCache[key].destroy();
  for (key in BaseTextureCache)
    BaseTextureCache[key].destroy();
}
function clearTextureCache() {
  let key;
  for (key in TextureCache)
    delete TextureCache[key];
  for (key in BaseTextureCache)
    delete BaseTextureCache[key];
}
exports.BaseTextureCache = BaseTextureCache;
exports.ProgramCache = ProgramCache;
exports.TextureCache = TextureCache;
exports.clearTextureCache = clearTextureCache;
exports.destroyTextureCache = destroyTextureCache;


},{}],207:[function(require,module,exports){
"use strict";
var BoundingBox = require("./BoundingBox.js");
function checkRow(data, width, y) {
  for (let x = 0, index = 4 * y * width; x < width; ++x, index += 4)
    if (data[index + 3] !== 0)
      return !1;
  return !0;
}
function checkColumn(data, width, x, top, bottom) {
  const stride = 4 * width;
  for (let y = top, index = top * stride + 4 * x; y <= bottom; ++y, index += stride)
    if (data[index + 3] !== 0)
      return !1;
  return !0;
}
function getCanvasBoundingBox(canvas) {
  const { width, height } = canvas, context = canvas.getContext("2d", {
    willReadFrequently: !0
  });
  if (context === null)
    throw new TypeError("Failed to get canvas 2D context");
  const data = context.getImageData(0, 0, width, height).data;
  let left = 0, top = 0, right = width - 1, bottom = height - 1;
  for (; top < height && checkRow(data, width, top); )
    ++top;
  if (top === height)
    return BoundingBox.BoundingBox.EMPTY;
  for (; checkRow(data, width, bottom); )
    --bottom;
  for (; checkColumn(data, width, left, top, bottom); )
    ++left;
  for (; checkColumn(data, width, right, top, bottom); )
    --right;
  return ++right, ++bottom, new BoundingBox.BoundingBox(left, top, right, bottom);
}
exports.getCanvasBoundingBox = getCanvasBoundingBox;


},{"./BoundingBox.js":204}],208:[function(require,module,exports){
"use strict";
var getCanvasBoundingBox = require("./getCanvasBoundingBox.js");
function trimCanvas(canvas) {
  const boundingBox = getCanvasBoundingBox.getCanvasBoundingBox(canvas), { width, height } = boundingBox;
  let data = null;
  if (!boundingBox.isEmpty()) {
    const context = canvas.getContext("2d");
    if (context === null)
      throw new TypeError("Failed to get canvas 2D context");
    data = context.getImageData(
      boundingBox.left,
      boundingBox.top,
      width,
      height
    );
  }
  return { width, height, data };
}
exports.trimCanvas = trimCanvas;


},{"./getCanvasBoundingBox.js":207}],209:[function(require,module,exports){
"use strict";
var _const = require("../const.js");
function decomposeDataUri(dataUri) {
  const dataUriMatch = _const.DATA_URI.exec(dataUri);
  if (dataUriMatch)
    return {
      mediaType: dataUriMatch[1] ? dataUriMatch[1].toLowerCase() : void 0,
      subType: dataUriMatch[2] ? dataUriMatch[2].toLowerCase() : void 0,
      charset: dataUriMatch[3] ? dataUriMatch[3].toLowerCase() : void 0,
      encoding: dataUriMatch[4] ? dataUriMatch[4].toLowerCase() : void 0,
      data: dataUriMatch[5]
    };
}
exports.decomposeDataUri = decomposeDataUri;


},{"../const.js":194}],210:[function(require,module,exports){
"use strict";
function determineCrossOrigin(url, loc = globalThis.location) {
  if (url.startsWith("data:"))
    return "";
  loc = loc || globalThis.location;
  const parsedUrl = new URL(url, document.baseURI);
  return parsedUrl.hostname !== loc.hostname || parsedUrl.port !== loc.port || parsedUrl.protocol !== loc.protocol ? "anonymous" : "";
}
exports.determineCrossOrigin = determineCrossOrigin;


},{}],211:[function(require,module,exports){
"use strict";
require("../settings.js");
var settings = require("@pixi/settings");
function getResolutionOfUrl(url, defaultValue = 1) {
  const resolution = settings.settings.RETINA_PREFIX?.exec(url);
  return resolution ? parseFloat(resolution[1]) : defaultValue;
}
exports.getResolutionOfUrl = getResolutionOfUrl;


},{"../settings.js":213,"@pixi/settings":180}],212:[function(require,module,exports){
"use strict";
var settings = require("@pixi/settings");
function assertPath(path2) {
  if (typeof path2 != "string")
    throw new TypeError(`Path must be a string. Received ${JSON.stringify(path2)}`);
}
function removeUrlParams(url) {
  return url.split("?")[0].split("#")[0];
}
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
}
function normalizeStringPosix(path2, allowAboveRoot) {
  let res = "", lastSegmentLength = 0, lastSlash = -1, dots = 0, code = -1;
  for (let i = 0; i <= path2.length; ++i) {
    if (i < path2.length)
      code = path2.charCodeAt(i);
    else {
      if (code === 47)
        break;
      code = 47;
    }
    if (code === 47) {
      if (!(lastSlash === i - 1 || dots === 1))
        if (lastSlash !== i - 1 && dots === 2) {
          if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
            if (res.length > 2) {
              const lastSlashIndex = res.lastIndexOf("/");
              if (lastSlashIndex !== res.length - 1) {
                lastSlashIndex === -1 ? (res = "", lastSegmentLength = 0) : (res = res.slice(0, lastSlashIndex), lastSegmentLength = res.length - 1 - res.lastIndexOf("/")), lastSlash = i, dots = 0;
                continue;
              }
            } else if (res.length === 2 || res.length === 1) {
              res = "", lastSegmentLength = 0, lastSlash = i, dots = 0;
              continue;
            }
          }
          allowAboveRoot && (res.length > 0 ? res += "/.." : res = "..", lastSegmentLength = 2);
        } else
          res.length > 0 ? res += `/${path2.slice(lastSlash + 1, i)}` : res = path2.slice(lastSlash + 1, i), lastSegmentLength = i - lastSlash - 1;
      lastSlash = i, dots = 0;
    } else
      code === 46 && dots !== -1 ? ++dots : dots = -1;
  }
  return res;
}
const path = {
  /**
   * Converts a path to posix format.
   * @param path - The path to convert to posix
   */
  toPosix(path2) {
    return replaceAll(path2, "\\", "/");
  },
  /**
   * Checks if the path is a URL e.g. http://, https://
   * @param path - The path to check
   */
  isUrl(path2) {
    return /^https?:/.test(this.toPosix(path2));
  },
  /**
   * Checks if the path is a data URL
   * @param path - The path to check
   */
  isDataUrl(path2) {
    return /^data:([a-z]+\/[a-z0-9-+.]+(;[a-z0-9-.!#$%*+.{}|~`]+=[a-z0-9-.!#$%*+.{}()_|~`]+)*)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s<>]*?)$/i.test(path2);
  },
  /**
   * Checks if the path is a blob URL
   * @param path - The path to check
   */
  isBlobUrl(path2) {
    return path2.startsWith("blob:");
  },
  /**
   * Checks if the path has a protocol e.g. http://, https://, file:///, data:, blob:, C:/
   * This will return true for windows file paths
   * @param path - The path to check
   */
  hasProtocol(path2) {
    return /^[^/:]+:/.test(this.toPosix(path2));
  },
  /**
   * Returns the protocol of the path e.g. http://, https://, file:///, data:, blob:, C:/
   * @param path - The path to get the protocol from
   */
  getProtocol(path2) {
    assertPath(path2), path2 = this.toPosix(path2);
    const matchFile = /^file:\/\/\//.exec(path2);
    if (matchFile)
      return matchFile[0];
    const matchProtocol = /^[^/:]+:\/{0,2}/.exec(path2);
    return matchProtocol ? matchProtocol[0] : "";
  },
  /**
   * Converts URL to an absolute path.
   * When loading from a Web Worker, we must use absolute paths.
   * If the URL is already absolute we return it as is
   * If it's not, we convert it
   * @param url - The URL to test
   * @param customBaseUrl - The base URL to use
   * @param customRootUrl - The root URL to use
   */
  toAbsolute(url, customBaseUrl, customRootUrl) {
    if (assertPath(url), this.isDataUrl(url) || this.isBlobUrl(url))
      return url;
    const baseUrl = removeUrlParams(this.toPosix(customBaseUrl ?? settings.settings.ADAPTER.getBaseUrl())), rootUrl = removeUrlParams(this.toPosix(customRootUrl ?? this.rootname(baseUrl)));
    return url = this.toPosix(url), url.startsWith("/") ? path.join(rootUrl, url.slice(1)) : this.isAbsolute(url) ? url : this.join(baseUrl, url);
  },
  /**
   * Normalizes the given path, resolving '..' and '.' segments
   * @param path - The path to normalize
   */
  normalize(path2) {
    if (assertPath(path2), path2.length === 0)
      return ".";
    if (this.isDataUrl(path2) || this.isBlobUrl(path2))
      return path2;
    path2 = this.toPosix(path2);
    let protocol = "";
    const isAbsolute = path2.startsWith("/");
    this.hasProtocol(path2) && (protocol = this.rootname(path2), path2 = path2.slice(protocol.length));
    const trailingSeparator = path2.endsWith("/");
    return path2 = normalizeStringPosix(path2, !1), path2.length > 0 && trailingSeparator && (path2 += "/"), isAbsolute ? `/${path2}` : protocol + path2;
  },
  /**
   * Determines if path is an absolute path.
   * Absolute paths can be urls, data urls, or paths on disk
   * @param path - The path to test
   */
  isAbsolute(path2) {
    return assertPath(path2), path2 = this.toPosix(path2), this.hasProtocol(path2) ? !0 : path2.startsWith("/");
  },
  /**
   * Joins all given path segments together using the platform-specific separator as a delimiter,
   * then normalizes the resulting path
   * @param segments - The segments of the path to join
   */
  join(...segments) {
    if (segments.length === 0)
      return ".";
    let joined;
    for (let i = 0; i < segments.length; ++i) {
      const arg = segments[i];
      if (assertPath(arg), arg.length > 0)
        if (joined === void 0)
          joined = arg;
        else {
          const prevArg = segments[i - 1] ?? "";
          this.extname(prevArg) ? joined += `/../${arg}` : joined += `/${arg}`;
        }
    }
    return joined === void 0 ? "." : this.normalize(joined);
  },
  /**
   * Returns the directory name of a path
   * @param path - The path to parse
   */
  dirname(path2) {
    if (assertPath(path2), path2.length === 0)
      return ".";
    path2 = this.toPosix(path2);
    let code = path2.charCodeAt(0);
    const hasRoot = code === 47;
    let end = -1, matchedSlash = !0;
    const proto = this.getProtocol(path2), origpath = path2;
    path2 = path2.slice(proto.length);
    for (let i = path2.length - 1; i >= 1; --i)
      if (code = path2.charCodeAt(i), code === 47) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else
        matchedSlash = !1;
    return end === -1 ? hasRoot ? "/" : this.isUrl(origpath) ? proto + path2 : proto : hasRoot && end === 1 ? "//" : proto + path2.slice(0, end);
  },
  /**
   * Returns the root of the path e.g. /, C:/, file:///, http://domain.com/
   * @param path - The path to parse
   */
  rootname(path2) {
    assertPath(path2), path2 = this.toPosix(path2);
    let root = "";
    if (path2.startsWith("/") ? root = "/" : root = this.getProtocol(path2), this.isUrl(path2)) {
      const index = path2.indexOf("/", root.length);
      index !== -1 ? root = path2.slice(0, index) : root = path2, root.endsWith("/") || (root += "/");
    }
    return root;
  },
  /**
   * Returns the last portion of a path
   * @param path - The path to test
   * @param ext - Optional extension to remove
   */
  basename(path2, ext) {
    assertPath(path2), ext && assertPath(ext), path2 = removeUrlParams(this.toPosix(path2));
    let start = 0, end = -1, matchedSlash = !0, i;
    if (ext !== void 0 && ext.length > 0 && ext.length <= path2.length) {
      if (ext.length === path2.length && ext === path2)
        return "";
      let extIdx = ext.length - 1, firstNonSlashEnd = -1;
      for (i = path2.length - 1; i >= 0; --i) {
        const code = path2.charCodeAt(i);
        if (code === 47) {
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else
          firstNonSlashEnd === -1 && (matchedSlash = !1, firstNonSlashEnd = i + 1), extIdx >= 0 && (code === ext.charCodeAt(extIdx) ? --extIdx === -1 && (end = i) : (extIdx = -1, end = firstNonSlashEnd));
      }
      return start === end ? end = firstNonSlashEnd : end === -1 && (end = path2.length), path2.slice(start, end);
    }
    for (i = path2.length - 1; i >= 0; --i)
      if (path2.charCodeAt(i) === 47) {
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else
        end === -1 && (matchedSlash = !1, end = i + 1);
    return end === -1 ? "" : path2.slice(start, end);
  },
  /**
   * Returns the extension of the path, from the last occurrence of the . (period) character to end of string in the last
   * portion of the path. If there is no . in the last portion of the path, or if there are no . characters other than
   * the first character of the basename of path, an empty string is returned.
   * @param path - The path to parse
   */
  extname(path2) {
    assertPath(path2), path2 = removeUrlParams(this.toPosix(path2));
    let startDot = -1, startPart = 0, end = -1, matchedSlash = !0, preDotState = 0;
    for (let i = path2.length - 1; i >= 0; --i) {
      const code = path2.charCodeAt(i);
      if (code === 47) {
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      end === -1 && (matchedSlash = !1, end = i + 1), code === 46 ? startDot === -1 ? startDot = i : preDotState !== 1 && (preDotState = 1) : startDot !== -1 && (preDotState = -1);
    }
    return startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1 ? "" : path2.slice(startDot, end);
  },
  /**
   * Parses a path into an object containing the 'root', `dir`, `base`, `ext`, and `name` properties.
   * @param path - The path to parse
   */
  parse(path2) {
    assertPath(path2);
    const ret = { root: "", dir: "", base: "", ext: "", name: "" };
    if (path2.length === 0)
      return ret;
    path2 = removeUrlParams(this.toPosix(path2));
    let code = path2.charCodeAt(0);
    const isAbsolute = this.isAbsolute(path2);
    let start;
    const protocol = "";
    ret.root = this.rootname(path2), isAbsolute || this.hasProtocol(path2) ? start = 1 : start = 0;
    let startDot = -1, startPart = 0, end = -1, matchedSlash = !0, i = path2.length - 1, preDotState = 0;
    for (; i >= start; --i) {
      if (code = path2.charCodeAt(i), code === 47) {
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      end === -1 && (matchedSlash = !1, end = i + 1), code === 46 ? startDot === -1 ? startDot = i : preDotState !== 1 && (preDotState = 1) : startDot !== -1 && (preDotState = -1);
    }
    return startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1 ? end !== -1 && (startPart === 0 && isAbsolute ? ret.base = ret.name = path2.slice(1, end) : ret.base = ret.name = path2.slice(startPart, end)) : (startPart === 0 && isAbsolute ? (ret.name = path2.slice(1, startDot), ret.base = path2.slice(1, end)) : (ret.name = path2.slice(startPart, startDot), ret.base = path2.slice(startPart, end)), ret.ext = path2.slice(startDot, end)), ret.dir = this.dirname(path2), protocol && (ret.dir = protocol + ret.dir), ret;
  },
  sep: "/",
  delimiter: ":"
};
exports.path = path;


},{"@pixi/settings":180}],213:[function(require,module,exports){
"use strict";
var settings = require("@pixi/settings");
settings.settings.RETINA_PREFIX = /@([0-9\.]+)x/;
settings.settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = !1;
Object.defineProperty(exports, "settings", {
  enumerable: !0,
  get: function() {
    return settings.settings;
  }
});


},{"@pixi/settings":180}],214:[function(require,module,exports){
"use strict";


},{}],215:[function(require,module,exports){
"use strict";
var url$1 = require("url"), deprecation = require("./logging/deprecation.js");
const url = {
  /**
   * @deprecated since 7.3.0
   */
  get parse() {
    return deprecation.deprecation("7.3.0", "utils.url.parse is deprecated, use native URL API instead."), url$1.parse;
  },
  /**
   * @deprecated since 7.3.0
   */
  get format() {
    return deprecation.deprecation("7.3.0", "utils.url.format is deprecated, use native URL API instead."), url$1.format;
  },
  /**
   * @deprecated since 7.3.0
   */
  get resolve() {
    return deprecation.deprecation("7.3.0", "utils.url.resolve is deprecated, use native URL API instead."), url$1.resolve;
  }
};
exports.url = url;


},{"./logging/deprecation.js":203,"url":23}],216:[function(require,module,exports){
'use strict';

module.exports = earcut;
module.exports.default = earcut;

function earcut(data, holeIndices, dim) {

    dim = dim || 2;

    var hasHoles = holeIndices && holeIndices.length,
        outerLen = hasHoles ? holeIndices[0] * dim : data.length,
        outerNode = linkedList(data, 0, outerLen, dim, true),
        triangles = [];

    if (!outerNode || outerNode.next === outerNode.prev) return triangles;

    var minX, minY, maxX, maxY, x, y, invSize;

    if (hasHoles) outerNode = eliminateHoles(data, holeIndices, outerNode, dim);

    // if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
    if (data.length > 80 * dim) {
        minX = maxX = data[0];
        minY = maxY = data[1];

        for (var i = dim; i < outerLen; i += dim) {
            x = data[i];
            y = data[i + 1];
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        }

        // minX, minY and invSize are later used to transform coords into integers for z-order calculation
        invSize = Math.max(maxX - minX, maxY - minY);
        invSize = invSize !== 0 ? 32767 / invSize : 0;
    }

    earcutLinked(outerNode, triangles, dim, minX, minY, invSize, 0);

    return triangles;
}

// create a circular doubly linked list from polygon points in the specified winding order
function linkedList(data, start, end, dim, clockwise) {
    var i, last;

    if (clockwise === (signedArea(data, start, end, dim) > 0)) {
        for (i = start; i < end; i += dim) last = insertNode(i, data[i], data[i + 1], last);
    } else {
        for (i = end - dim; i >= start; i -= dim) last = insertNode(i, data[i], data[i + 1], last);
    }

    if (last && equals(last, last.next)) {
        removeNode(last);
        last = last.next;
    }

    return last;
}

// eliminate colinear or duplicate points
function filterPoints(start, end) {
    if (!start) return start;
    if (!end) end = start;

    var p = start,
        again;
    do {
        again = false;

        if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
            removeNode(p);
            p = end = p.prev;
            if (p === p.next) break;
            again = true;

        } else {
            p = p.next;
        }
    } while (again || p !== end);

    return end;
}

// main ear slicing loop which triangulates a polygon (given as a linked list)
function earcutLinked(ear, triangles, dim, minX, minY, invSize, pass) {
    if (!ear) return;

    // interlink polygon nodes in z-order
    if (!pass && invSize) indexCurve(ear, minX, minY, invSize);

    var stop = ear,
        prev, next;

    // iterate through ears, slicing them one by one
    while (ear.prev !== ear.next) {
        prev = ear.prev;
        next = ear.next;

        if (invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear)) {
            // cut off the triangle
            triangles.push(prev.i / dim | 0);
            triangles.push(ear.i / dim | 0);
            triangles.push(next.i / dim | 0);

            removeNode(ear);

            // skipping the next vertex leads to less sliver triangles
            ear = next.next;
            stop = next.next;

            continue;
        }

        ear = next;

        // if we looped through the whole remaining polygon and can't find any more ears
        if (ear === stop) {
            // try filtering points and slicing again
            if (!pass) {
                earcutLinked(filterPoints(ear), triangles, dim, minX, minY, invSize, 1);

            // if this didn't work, try curing all small self-intersections locally
            } else if (pass === 1) {
                ear = cureLocalIntersections(filterPoints(ear), triangles, dim);
                earcutLinked(ear, triangles, dim, minX, minY, invSize, 2);

            // as a last resort, try splitting the remaining polygon into two
            } else if (pass === 2) {
                splitEarcut(ear, triangles, dim, minX, minY, invSize);
            }

            break;
        }
    }
}

// check whether a polygon node forms a valid ear with adjacent nodes
function isEar(ear) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

    // now make sure we don't have other points inside the potential ear
    var ax = a.x, bx = b.x, cx = c.x, ay = a.y, by = b.y, cy = c.y;

    // triangle bbox; min & max are calculated like this for speed
    var x0 = ax < bx ? (ax < cx ? ax : cx) : (bx < cx ? bx : cx),
        y0 = ay < by ? (ay < cy ? ay : cy) : (by < cy ? by : cy),
        x1 = ax > bx ? (ax > cx ? ax : cx) : (bx > cx ? bx : cx),
        y1 = ay > by ? (ay > cy ? ay : cy) : (by > cy ? by : cy);

    var p = c.next;
    while (p !== a) {
        if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 &&
            pointInTriangle(ax, ay, bx, by, cx, cy, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.next;
    }

    return true;
}

function isEarHashed(ear, minX, minY, invSize) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

    var ax = a.x, bx = b.x, cx = c.x, ay = a.y, by = b.y, cy = c.y;

    // triangle bbox; min & max are calculated like this for speed
    var x0 = ax < bx ? (ax < cx ? ax : cx) : (bx < cx ? bx : cx),
        y0 = ay < by ? (ay < cy ? ay : cy) : (by < cy ? by : cy),
        x1 = ax > bx ? (ax > cx ? ax : cx) : (bx > cx ? bx : cx),
        y1 = ay > by ? (ay > cy ? ay : cy) : (by > cy ? by : cy);

    // z-order range for the current triangle bbox;
    var minZ = zOrder(x0, y0, minX, minY, invSize),
        maxZ = zOrder(x1, y1, minX, minY, invSize);

    var p = ear.prevZ,
        n = ear.nextZ;

    // look for points inside the triangle in both directions
    while (p && p.z >= minZ && n && n.z <= maxZ) {
        if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && p !== a && p !== c &&
            pointInTriangle(ax, ay, bx, by, cx, cy, p.x, p.y) && area(p.prev, p, p.next) >= 0) return false;
        p = p.prevZ;

        if (n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1 && n !== a && n !== c &&
            pointInTriangle(ax, ay, bx, by, cx, cy, n.x, n.y) && area(n.prev, n, n.next) >= 0) return false;
        n = n.nextZ;
    }

    // look for remaining points in decreasing z-order
    while (p && p.z >= minZ) {
        if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && p !== a && p !== c &&
            pointInTriangle(ax, ay, bx, by, cx, cy, p.x, p.y) && area(p.prev, p, p.next) >= 0) return false;
        p = p.prevZ;
    }

    // look for remaining points in increasing z-order
    while (n && n.z <= maxZ) {
        if (n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1 && n !== a && n !== c &&
            pointInTriangle(ax, ay, bx, by, cx, cy, n.x, n.y) && area(n.prev, n, n.next) >= 0) return false;
        n = n.nextZ;
    }

    return true;
}

// go through all polygon nodes and cure small local self-intersections
function cureLocalIntersections(start, triangles, dim) {
    var p = start;
    do {
        var a = p.prev,
            b = p.next.next;

        if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {

            triangles.push(a.i / dim | 0);
            triangles.push(p.i / dim | 0);
            triangles.push(b.i / dim | 0);

            // remove two nodes involved
            removeNode(p);
            removeNode(p.next);

            p = start = b;
        }
        p = p.next;
    } while (p !== start);

    return filterPoints(p);
}

// try splitting polygon into two and triangulate them independently
function splitEarcut(start, triangles, dim, minX, minY, invSize) {
    // look for a valid diagonal that divides the polygon into two
    var a = start;
    do {
        var b = a.next.next;
        while (b !== a.prev) {
            if (a.i !== b.i && isValidDiagonal(a, b)) {
                // split the polygon in two by the diagonal
                var c = splitPolygon(a, b);

                // filter colinear points around the cuts
                a = filterPoints(a, a.next);
                c = filterPoints(c, c.next);

                // run earcut on each half
                earcutLinked(a, triangles, dim, minX, minY, invSize, 0);
                earcutLinked(c, triangles, dim, minX, minY, invSize, 0);
                return;
            }
            b = b.next;
        }
        a = a.next;
    } while (a !== start);
}

// link every hole into the outer loop, producing a single-ring polygon without holes
function eliminateHoles(data, holeIndices, outerNode, dim) {
    var queue = [],
        i, len, start, end, list;

    for (i = 0, len = holeIndices.length; i < len; i++) {
        start = holeIndices[i] * dim;
        end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
        list = linkedList(data, start, end, dim, false);
        if (list === list.next) list.steiner = true;
        queue.push(getLeftmost(list));
    }

    queue.sort(compareX);

    // process holes from left to right
    for (i = 0; i < queue.length; i++) {
        outerNode = eliminateHole(queue[i], outerNode);
    }

    return outerNode;
}

function compareX(a, b) {
    return a.x - b.x;
}

// find a bridge between vertices that connects hole with an outer ring and and link it
function eliminateHole(hole, outerNode) {
    var bridge = findHoleBridge(hole, outerNode);
    if (!bridge) {
        return outerNode;
    }

    var bridgeReverse = splitPolygon(bridge, hole);

    // filter collinear points around the cuts
    filterPoints(bridgeReverse, bridgeReverse.next);
    return filterPoints(bridge, bridge.next);
}

// David Eberly's algorithm for finding a bridge between hole and outer polygon
function findHoleBridge(hole, outerNode) {
    var p = outerNode,
        hx = hole.x,
        hy = hole.y,
        qx = -Infinity,
        m;

    // find a segment intersected by a ray from the hole's leftmost point to the left;
    // segment's endpoint with lesser x will be potential connection point
    do {
        if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
            var x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
            if (x <= hx && x > qx) {
                qx = x;
                m = p.x < p.next.x ? p : p.next;
                if (x === hx) return m; // hole touches outer segment; pick leftmost endpoint
            }
        }
        p = p.next;
    } while (p !== outerNode);

    if (!m) return null;

    // look for points inside the triangle of hole point, segment intersection and endpoint;
    // if there are no points found, we have a valid connection;
    // otherwise choose the point of the minimum angle with the ray as connection point

    var stop = m,
        mx = m.x,
        my = m.y,
        tanMin = Infinity,
        tan;

    p = m;

    do {
        if (hx >= p.x && p.x >= mx && hx !== p.x &&
                pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {

            tan = Math.abs(hy - p.y) / (hx - p.x); // tangential

            if (locallyInside(p, hole) &&
                (tan < tanMin || (tan === tanMin && (p.x > m.x || (p.x === m.x && sectorContainsSector(m, p)))))) {
                m = p;
                tanMin = tan;
            }
        }

        p = p.next;
    } while (p !== stop);

    return m;
}

// whether sector in vertex m contains sector in vertex p in the same coordinates
function sectorContainsSector(m, p) {
    return area(m.prev, m, p.prev) < 0 && area(p.next, m, m.next) < 0;
}

// interlink polygon nodes in z-order
function indexCurve(start, minX, minY, invSize) {
    var p = start;
    do {
        if (p.z === 0) p.z = zOrder(p.x, p.y, minX, minY, invSize);
        p.prevZ = p.prev;
        p.nextZ = p.next;
        p = p.next;
    } while (p !== start);

    p.prevZ.nextZ = null;
    p.prevZ = null;

    sortLinked(p);
}

// Simon Tatham's linked list merge sort algorithm
// http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
function sortLinked(list) {
    var i, p, q, e, tail, numMerges, pSize, qSize,
        inSize = 1;

    do {
        p = list;
        list = null;
        tail = null;
        numMerges = 0;

        while (p) {
            numMerges++;
            q = p;
            pSize = 0;
            for (i = 0; i < inSize; i++) {
                pSize++;
                q = q.nextZ;
                if (!q) break;
            }
            qSize = inSize;

            while (pSize > 0 || (qSize > 0 && q)) {

                if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
                    e = p;
                    p = p.nextZ;
                    pSize--;
                } else {
                    e = q;
                    q = q.nextZ;
                    qSize--;
                }

                if (tail) tail.nextZ = e;
                else list = e;

                e.prevZ = tail;
                tail = e;
            }

            p = q;
        }

        tail.nextZ = null;
        inSize *= 2;

    } while (numMerges > 1);

    return list;
}

// z-order of a point given coords and inverse of the longer side of data bbox
function zOrder(x, y, minX, minY, invSize) {
    // coords are transformed into non-negative 15-bit integer range
    x = (x - minX) * invSize | 0;
    y = (y - minY) * invSize | 0;

    x = (x | (x << 8)) & 0x00FF00FF;
    x = (x | (x << 4)) & 0x0F0F0F0F;
    x = (x | (x << 2)) & 0x33333333;
    x = (x | (x << 1)) & 0x55555555;

    y = (y | (y << 8)) & 0x00FF00FF;
    y = (y | (y << 4)) & 0x0F0F0F0F;
    y = (y | (y << 2)) & 0x33333333;
    y = (y | (y << 1)) & 0x55555555;

    return x | (y << 1);
}

// find the leftmost node of a polygon ring
function getLeftmost(start) {
    var p = start,
        leftmost = start;
    do {
        if (p.x < leftmost.x || (p.x === leftmost.x && p.y < leftmost.y)) leftmost = p;
        p = p.next;
    } while (p !== start);

    return leftmost;
}

// check if a point lies within a convex triangle
function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
    return (cx - px) * (ay - py) >= (ax - px) * (cy - py) &&
           (ax - px) * (by - py) >= (bx - px) * (ay - py) &&
           (bx - px) * (cy - py) >= (cx - px) * (by - py);
}

// check if a diagonal between two polygon nodes is valid (lies in polygon interior)
function isValidDiagonal(a, b) {
    return a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) && // dones't intersect other edges
           (locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b) && // locally visible
            (area(a.prev, a, b.prev) || area(a, b.prev, b)) || // does not create opposite-facing sectors
            equals(a, b) && area(a.prev, a, a.next) > 0 && area(b.prev, b, b.next) > 0); // special zero-length case
}

// signed area of a triangle
function area(p, q, r) {
    return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
}

// check if two points are equal
function equals(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}

// check if two segments intersect
function intersects(p1, q1, p2, q2) {
    var o1 = sign(area(p1, q1, p2));
    var o2 = sign(area(p1, q1, q2));
    var o3 = sign(area(p2, q2, p1));
    var o4 = sign(area(p2, q2, q1));

    if (o1 !== o2 && o3 !== o4) return true; // general case

    if (o1 === 0 && onSegment(p1, p2, q1)) return true; // p1, q1 and p2 are collinear and p2 lies on p1q1
    if (o2 === 0 && onSegment(p1, q2, q1)) return true; // p1, q1 and q2 are collinear and q2 lies on p1q1
    if (o3 === 0 && onSegment(p2, p1, q2)) return true; // p2, q2 and p1 are collinear and p1 lies on p2q2
    if (o4 === 0 && onSegment(p2, q1, q2)) return true; // p2, q2 and q1 are collinear and q1 lies on p2q2

    return false;
}

// for collinear points p, q, r, check if point q lies on segment pr
function onSegment(p, q, r) {
    return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
}

function sign(num) {
    return num > 0 ? 1 : num < 0 ? -1 : 0;
}

// check if a polygon diagonal intersects any polygon segments
function intersectsPolygon(a, b) {
    var p = a;
    do {
        if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i &&
                intersects(p, p.next, a, b)) return true;
        p = p.next;
    } while (p !== a);

    return false;
}

// check if a polygon diagonal is locally inside the polygon
function locallyInside(a, b) {
    return area(a.prev, a, a.next) < 0 ?
        area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 :
        area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
}

// check if the middle point of a polygon diagonal is inside the polygon
function middleInside(a, b) {
    var p = a,
        inside = false,
        px = (a.x + b.x) / 2,
        py = (a.y + b.y) / 2;
    do {
        if (((p.y > py) !== (p.next.y > py)) && p.next.y !== p.y &&
                (px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x))
            inside = !inside;
        p = p.next;
    } while (p !== a);

    return inside;
}

// link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
// if one belongs to the outer ring and another to a hole, it merges it into a single ring
function splitPolygon(a, b) {
    var a2 = new Node(a.i, a.x, a.y),
        b2 = new Node(b.i, b.x, b.y),
        an = a.next,
        bp = b.prev;

    a.next = b;
    b.prev = a;

    a2.next = an;
    an.prev = a2;

    b2.next = a2;
    a2.prev = b2;

    bp.next = b2;
    b2.prev = bp;

    return b2;
}

// create a node and optionally link it with previous one (in a circular doubly linked list)
function insertNode(i, x, y, last) {
    var p = new Node(i, x, y);

    if (!last) {
        p.prev = p;
        p.next = p;

    } else {
        p.next = last.next;
        p.prev = last;
        last.next.prev = p;
        last.next = p;
    }
    return p;
}

function removeNode(p) {
    p.next.prev = p.prev;
    p.prev.next = p.next;

    if (p.prevZ) p.prevZ.nextZ = p.nextZ;
    if (p.nextZ) p.nextZ.prevZ = p.prevZ;
}

function Node(i, x, y) {
    // vertex index in coordinates array
    this.i = i;

    // vertex coordinates
    this.x = x;
    this.y = y;

    // previous and next vertex nodes in a polygon ring
    this.prev = null;
    this.next = null;

    // z-order curve value
    this.z = 0;

    // previous and next nodes in z-order
    this.prevZ = null;
    this.nextZ = null;

    // indicates whether this is a steiner point
    this.steiner = false;
}

// return a percentage difference between the polygon area and its triangulation area;
// used to verify correctness of triangulation
earcut.deviation = function (data, holeIndices, dim, triangles) {
    var hasHoles = holeIndices && holeIndices.length;
    var outerLen = hasHoles ? holeIndices[0] * dim : data.length;

    var polygonArea = Math.abs(signedArea(data, 0, outerLen, dim));
    if (hasHoles) {
        for (var i = 0, len = holeIndices.length; i < len; i++) {
            var start = holeIndices[i] * dim;
            var end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
            polygonArea -= Math.abs(signedArea(data, start, end, dim));
        }
    }

    var trianglesArea = 0;
    for (i = 0; i < triangles.length; i += 3) {
        var a = triangles[i] * dim;
        var b = triangles[i + 1] * dim;
        var c = triangles[i + 2] * dim;
        trianglesArea += Math.abs(
            (data[a] - data[c]) * (data[b + 1] - data[a + 1]) -
            (data[a] - data[b]) * (data[c + 1] - data[a + 1]));
    }

    return polygonArea === 0 && trianglesArea === 0 ? 0 :
        Math.abs((trianglesArea - polygonArea) / polygonArea);
};

function signedArea(data, start, end, dim) {
    var sum = 0;
    for (var i = start, j = end - dim; i < end; i += dim) {
        sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
        j = i;
    }
    return sum;
}

// turn a polygon in a multi-dimensional array form (e.g. as in GeoJSON) into a form Earcut accepts
earcut.flatten = function (data) {
    var dim = data[0][0].length,
        result = {vertices: [], holes: [], dimensions: dim},
        holeIndex = 0;

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
            for (var d = 0; d < dim; d++) result.vertices.push(data[i][j][d]);
        }
        if (i > 0) {
            holeIndex += data[i - 1].length;
            result.holes.push(holeIndex);
        }
    }
    return result;
};

},{}],217:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty
  , prefix = '~';

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @private
 */
function Events() {}

//
// We try to not inherit from `Object.prototype`. In some engines creating an
// instance in this way is faster than calling `Object.create(null)` directly.
// If `Object.create(null)` is not supported we prefix the event names with a
// character to make sure that the built-in object properties are not
// overridden or used as an attack vector.
//
if (Object.create) {
  Events.prototype = Object.create(null);

  //
  // This hack is needed because the `__proto__` property is still inherited in
  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
  //
  if (!new Events().__proto__) prefix = false;
}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Add a listener for a given event.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} once Specify if the listener is a one-time listener.
 * @returns {EventEmitter}
 * @private
 */
function addListener(emitter, event, fn, context, once) {
  if (typeof fn !== 'function') {
    throw new TypeError('The listener must be a function');
  }

  var listener = new EE(fn, context || emitter, once)
    , evt = prefix ? prefix + event : event;

  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
  else emitter._events[evt] = [emitter._events[evt], listener];

  return emitter;
}

/**
 * Clear event by name.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} evt The Event name.
 * @private
 */
function clearEvent(emitter, evt) {
  if (--emitter._eventsCount === 0) emitter._events = new Events();
  else delete emitter._events[evt];
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @public
 */
function EventEmitter() {
  this._events = new Events();
  this._eventsCount = 0;
}

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var names = []
    , events
    , name;

  if (this._eventsCount === 0) return names;

  for (name in (events = this._events)) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Array} The registered listeners.
 * @public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  var evt = prefix ? prefix + event : event
    , handlers = this._events[evt];

  if (!handlers) return [];
  if (handlers.fn) return [handlers.fn];

  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
    ee[i] = handlers[i].fn;
  }

  return ee;
};

/**
 * Return the number of listeners listening to a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Number} The number of listeners.
 * @public
 */
EventEmitter.prototype.listenerCount = function listenerCount(event) {
  var evt = prefix ? prefix + event : event
    , listeners = this._events[evt];

  if (!listeners) return 0;
  if (listeners.fn) return 1;
  return listeners.length;
};

/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if (listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Add a listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  return addListener(this, event, fn, context, false);
};

/**
 * Add a one-time listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  return addListener(this, event, fn, context, true);
};

/**
 * Remove the listeners of a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {*} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return this;
  if (!fn) {
    clearEvent(this, evt);
    return this;
  }

  var listeners = this._events[evt];

  if (listeners.fn) {
    if (
      listeners.fn === fn &&
      (!once || listeners.once) &&
      (!context || listeners.context === context)
    ) {
      clearEvent(this, evt);
    }
  } else {
    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
      if (
        listeners[i].fn !== fn ||
        (once && !listeners[i].once) ||
        (context && listeners[i].context !== context)
      ) {
        events.push(listeners[i]);
      }
    }

    //
    // Reset the array, or remove it completely if we have no more listeners.
    //
    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
    else clearEvent(this, evt);
  }

  return this;
};

/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {(String|Symbol)} [event] The event name.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;

  if (event) {
    evt = prefix ? prefix + event : event;
    if (this._events[evt]) clearEvent(this, evt);
  } else {
    this._events = new Events();
    this._eventsCount = 0;
  }

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Allow `EventEmitter` to be imported as module namespace.
//
EventEmitter.EventEmitter = EventEmitter;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],218:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
exports.__esModule = true;
__export(require("./isMobile"));
var isMobile_1 = require("./isMobile");
exports["default"] = isMobile_1["default"];

},{"./isMobile":219}],219:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var appleIphone = /iPhone/i;
var appleIpod = /iPod/i;
var appleTablet = /iPad/i;
var appleUniversal = /\biOS-universal(?:.+)Mac\b/i;
var androidPhone = /\bAndroid(?:.+)Mobile\b/i;
var androidTablet = /Android/i;
var amazonPhone = /(?:SD4930UR|\bSilk(?:.+)Mobile\b)/i;
var amazonTablet = /Silk/i;
var windowsPhone = /Windows Phone/i;
var windowsTablet = /\bWindows(?:.+)ARM\b/i;
var otherBlackBerry = /BlackBerry/i;
var otherBlackBerry10 = /BB10/i;
var otherOpera = /Opera Mini/i;
var otherChrome = /\b(CriOS|Chrome)(?:.+)Mobile/i;
var otherFirefox = /Mobile(?:.+)Firefox\b/i;
var isAppleTabletOnIos13 = function (navigator) {
    return (typeof navigator !== 'undefined' &&
        navigator.platform === 'MacIntel' &&
        typeof navigator.maxTouchPoints === 'number' &&
        navigator.maxTouchPoints > 1 &&
        typeof MSStream === 'undefined');
};
function createMatch(userAgent) {
    return function (regex) { return regex.test(userAgent); };
}
function isMobile(param) {
    var nav = {
        userAgent: '',
        platform: '',
        maxTouchPoints: 0
    };
    if (!param && typeof navigator !== 'undefined') {
        nav = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            maxTouchPoints: navigator.maxTouchPoints || 0
        };
    }
    else if (typeof param === 'string') {
        nav.userAgent = param;
    }
    else if (param && param.userAgent) {
        nav = {
            userAgent: param.userAgent,
            platform: param.platform,
            maxTouchPoints: param.maxTouchPoints || 0
        };
    }
    var userAgent = nav.userAgent;
    var tmp = userAgent.split('[FBAN');
    if (typeof tmp[1] !== 'undefined') {
        userAgent = tmp[0];
    }
    tmp = userAgent.split('Twitter');
    if (typeof tmp[1] !== 'undefined') {
        userAgent = tmp[0];
    }
    var match = createMatch(userAgent);
    var result = {
        apple: {
            phone: match(appleIphone) && !match(windowsPhone),
            ipod: match(appleIpod),
            tablet: !match(appleIphone) &&
                (match(appleTablet) || isAppleTabletOnIos13(nav)) &&
                !match(windowsPhone),
            universal: match(appleUniversal),
            device: (match(appleIphone) ||
                match(appleIpod) ||
                match(appleTablet) ||
                match(appleUniversal) ||
                isAppleTabletOnIos13(nav)) &&
                !match(windowsPhone)
        },
        amazon: {
            phone: match(amazonPhone),
            tablet: !match(amazonPhone) && match(amazonTablet),
            device: match(amazonPhone) || match(amazonTablet)
        },
        android: {
            phone: (!match(windowsPhone) && match(amazonPhone)) ||
                (!match(windowsPhone) && match(androidPhone)),
            tablet: !match(windowsPhone) &&
                !match(amazonPhone) &&
                !match(androidPhone) &&
                (match(amazonTablet) || match(androidTablet)),
            device: (!match(windowsPhone) &&
                (match(amazonPhone) ||
                    match(amazonTablet) ||
                    match(androidPhone) ||
                    match(androidTablet))) ||
                match(/\bokhttp\b/i)
        },
        windows: {
            phone: match(windowsPhone),
            tablet: match(windowsTablet),
            device: match(windowsPhone) || match(windowsTablet)
        },
        other: {
            blackberry: match(otherBlackBerry),
            blackberry10: match(otherBlackBerry10),
            opera: match(otherOpera),
            firefox: match(otherFirefox),
            chrome: match(otherChrome),
            device: match(otherBlackBerry) ||
                match(otherBlackBerry10) ||
                match(otherOpera) ||
                match(otherFirefox) ||
                match(otherChrome)
        },
        any: false,
        phone: false,
        tablet: false
    };
    result.any =
        result.apple.device ||
            result.android.device ||
            result.windows.device ||
            result.other.device;
    result.phone =
        result.apple.phone || result.android.phone || result.windows.phone;
    result.tablet =
        result.apple.tablet || result.android.tablet || result.windows.tablet;
    return result;
}
exports["default"] = isMobile;

},{}]},{},[26]);
