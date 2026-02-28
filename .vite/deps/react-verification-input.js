import {
  require_react
} from "./chunk-YLDSBLSF.js";
import {
  __commonJS
} from "./chunk-DC5AMYBS.js";

// node_modules/react-verification-input/lib/index.js
var require_lib = __commonJS({
  "node_modules/react-verification-input/lib/index.js"(exports) {
    (() => {
      var n = { 365: (n2, e2, r2) => {
        "use strict";
        r2.d(e2, { A: () => c });
        var t2 = r2(601), o2 = r2.n(t2), a2 = r2(314), i = r2.n(a2)()(o2());
        i.push([n2.id, ".vi {\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  box-sizing: border-box;\n  position: absolute;\n  color: transparent;\n  background: transparent;\n  caret-color: transparent;\n  outline: none;\n  border: 0 none transparent;\n}\n\n.vi:-webkit-autofill {\n  opacity: 0;\n}\n\n.vi::-ms-reveal,\n.vi::-ms-clear {\n  display: none;\n}\n\n.vi::selection {\n  background: transparent;\n}\n\n/* :where() gives the styles specificity 0, which makes them overridable */\n:where(.vi__container) {\n  position: relative;\n  display: flex;\n  gap: 8px;\n  height: 50px;\n  width: 300px;\n}\n\n:where(.vi__character) {\n  height: 100%;\n  flex-grow: 1;\n  flex-basis: 0;\n  text-align: center;\n  font-size: 36px;\n  line-height: 50px;\n  color: black;\n  background-color: white;\n  border: 1px solid black;\n  cursor: default;\n  user-select: none;\n  box-sizing: border-box;\n}\n\n:where(.vi__character--inactive) {\n  color: dimgray;\n  background-color: lightgray;\n}\n\n:where(.vi__character--selected) {\n  outline: 2px solid cornflowerblue;\n  color: cornflowerblue;\n}\n", ""]);
        const c = i;
      }, 314: (n2) => {
        "use strict";
        n2.exports = function(n3) {
          var e2 = [];
          return e2.toString = function() {
            return this.map(function(e3) {
              var r2 = "", t2 = void 0 !== e3[5];
              return e3[4] && (r2 += "@supports (".concat(e3[4], ") {")), e3[2] && (r2 += "@media ".concat(e3[2], " {")), t2 && (r2 += "@layer".concat(e3[5].length > 0 ? " ".concat(e3[5]) : "", " {")), r2 += n3(e3), t2 && (r2 += "}"), e3[2] && (r2 += "}"), e3[4] && (r2 += "}"), r2;
            }).join("");
          }, e2.i = function(n4, r2, t2, o2, a2) {
            "string" == typeof n4 && (n4 = [[null, n4, void 0]]);
            var i = {};
            if (t2) for (var c = 0; c < this.length; c++) {
              var l = this[c][0];
              null != l && (i[l] = true);
            }
            for (var u = 0; u < n4.length; u++) {
              var s = [].concat(n4[u]);
              t2 && i[s[0]] || (void 0 !== a2 && (void 0 === s[5] || (s[1] = "@layer".concat(s[5].length > 0 ? " ".concat(s[5]) : "", " {").concat(s[1], "}")), s[5] = a2), r2 && (s[2] ? (s[1] = "@media ".concat(s[2], " {").concat(s[1], "}"), s[2] = r2) : s[2] = r2), o2 && (s[4] ? (s[1] = "@supports (".concat(s[4], ") {").concat(s[1], "}"), s[4] = o2) : s[4] = "".concat(o2)), e2.push(s));
            }
          }, e2;
        };
      }, 601: (n2) => {
        "use strict";
        n2.exports = function(n3) {
          return n3[1];
        };
      }, 942: (n2, e2) => {
        var r2;
        !function() {
          "use strict";
          var t2 = {}.hasOwnProperty;
          function o2() {
            for (var n3 = "", e3 = 0; e3 < arguments.length; e3++) {
              var r3 = arguments[e3];
              r3 && (n3 = i(n3, a2(r3)));
            }
            return n3;
          }
          function a2(n3) {
            if ("string" == typeof n3 || "number" == typeof n3) return n3;
            if ("object" != typeof n3) return "";
            if (Array.isArray(n3)) return o2.apply(null, n3);
            if (n3.toString !== Object.prototype.toString && !n3.toString.toString().includes("[native code]")) return n3.toString();
            var e3 = "";
            for (var r3 in n3) t2.call(n3, r3) && n3[r3] && (e3 = i(e3, r3));
            return e3;
          }
          function i(n3, e3) {
            return e3 ? n3 ? n3 + " " + e3 : n3 + e3 : n3;
          }
          n2.exports ? (o2.default = o2, n2.exports = o2) : void 0 === (r2 = (function() {
            return o2;
          }).apply(e2, [])) || (n2.exports = r2);
        }();
      } }, e = {};
      function r(t2) {
        var o2 = e[t2];
        if (void 0 !== o2) return o2.exports;
        var a2 = e[t2] = { id: t2, exports: {} };
        return n[t2](a2, a2.exports, r), a2.exports;
      }
      r.n = (n2) => {
        var e2 = n2 && n2.__esModule ? () => n2.default : () => n2;
        return r.d(e2, { a: e2 }), e2;
      }, r.d = (n2, e2) => {
        for (var t2 in e2) r.o(e2, t2) && !r.o(n2, t2) && Object.defineProperty(n2, t2, { enumerable: true, get: e2[t2] });
      }, r.o = (n2, e2) => Object.prototype.hasOwnProperty.call(n2, e2), r.r = (n2) => {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(n2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(n2, "__esModule", { value: true });
      };
      var t = {};
      (() => {
        "use strict";
        r.r(t), r.d(t, { default: () => h });
        const n2 = require_react();
        var e2 = r.n(n2), o2 = r(942), a2 = r.n(o2), i = r(365), c = ["className", "type"], l = ["className"];
        function u() {
          return u = Object.assign ? Object.assign.bind() : function(n3) {
            for (var e3 = 1; e3 < arguments.length; e3++) {
              var r2 = arguments[e3];
              for (var t2 in r2) ({}).hasOwnProperty.call(r2, t2) && (n3[t2] = r2[t2]);
            }
            return n3;
          }, u.apply(null, arguments);
        }
        function s(n3, e3) {
          if (null == n3) return {};
          var r2, t2, o3 = function(n4, e4) {
            if (null == n4) return {};
            var r3 = {};
            for (var t3 in n4) if ({}.hasOwnProperty.call(n4, t3)) {
              if (e4.includes(t3)) continue;
              r3[t3] = n4[t3];
            }
            return r3;
          }(n3, e3);
          if (Object.getOwnPropertySymbols) {
            var a3 = Object.getOwnPropertySymbols(n3);
            for (t2 = 0; t2 < a3.length; t2++) r2 = a3[t2], e3.includes(r2) || {}.propertyIsEnumerable.call(n3, r2) && (o3[r2] = n3[r2]);
          }
          return o3;
        }
        function f(n3, e3) {
          return function(n4) {
            if (Array.isArray(n4)) return n4;
          }(n3) || function(n4, e4) {
            var r2 = null == n4 ? null : "undefined" != typeof Symbol && n4[Symbol.iterator] || n4["@@iterator"];
            if (null != r2) {
              var t2, o3, a3, i2, c2 = [], l2 = true, u2 = false;
              try {
                if (a3 = (r2 = r2.call(n4)).next, 0 === e4) {
                  if (Object(r2) !== r2) return;
                  l2 = false;
                } else for (; !(l2 = (t2 = a3.call(r2)).done) && (c2.push(t2.value), c2.length !== e4); l2 = true) ;
              } catch (n5) {
                u2 = true, o3 = n5;
              } finally {
                try {
                  if (!l2 && null != r2.return && (i2 = r2.return(), Object(i2) !== i2)) return;
                } finally {
                  if (u2) throw o3;
                }
              }
              return c2;
            }
          }(n3, e3) || d(n3, e3) || function() {
            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
          }();
        }
        function d(n3, e3) {
          if (n3) {
            if ("string" == typeof n3) return p(n3, e3);
            var r2 = {}.toString.call(n3).slice(8, -1);
            return "Object" === r2 && n3.constructor && (r2 = n3.constructor.name), "Map" === r2 || "Set" === r2 ? Array.from(n3) : "Arguments" === r2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r2) ? p(n3, e3) : void 0;
          }
        }
        function p(n3, e3) {
          (null == e3 || e3 > n3.length) && (e3 = n3.length);
          for (var r2 = 0, t2 = Array(e3); r2 < e3; r2++) t2[r2] = n3[r2];
          return t2;
        }
        var v = (0, n2.forwardRef)(function(r2, t2) {
          var o3 = r2.value, v2 = r2.length, h2 = void 0 === v2 ? 6 : v2, y = r2.validChars, g = void 0 === y ? "A-Za-z0-9" : y, b = r2.placeholder, m = void 0 === b ? "·" : b, w = r2.autoFocus, _ = void 0 !== w && w, x = r2.passwordMode, S = void 0 !== x && x, A = r2.passwordChar, O = void 0 === A ? "*" : A, j = r2.inputProps, k = void 0 === j ? {} : j, P = r2.containerProps, E = void 0 === P ? {} : P, C = r2.classNames, I = void 0 === C ? {} : C, N = r2.onChange, M = r2.onFocus, F = r2.onBlur, R = r2.onComplete, T = f((0, n2.useState)(""), 2), z = T[0], D = T[1], B = f((0, n2.useState)(false), 2), L = B[0], U = B[1], $ = (0, n2.useRef)(null);
          (0, n2.useEffect)(function() {
            _ && $.current.focus();
          }, [_]), (0, n2.useEffect)(function() {
            k.disabled && U(false);
          }, [k.disabled]);
          var q, H = function() {
            $.current.focus();
          }, K = function() {
            return null != o3 ? o3 : z;
          }, V = function(n3) {
            var e3 = K();
            return (e3.length === n3 || e3.length === n3 + 1 && h2 === n3 + 1) && L;
          }, Z = function(n3) {
            return K().length < n3;
          }, G = function(n3) {
            return K().length > n3;
          }, J = k.className, Q = k.type, W = s(k, c), X = E.className, Y = s(E, l);
          return e2().createElement(e2().Fragment, null, e2().createElement("div", u({ "data-testid": "container", className: a2()("vi__container", I.container, X), onClick: function() {
            return $.current.focus();
          } }, Y), e2().createElement("input", u({ "aria-label": "verification input", spellCheck: false, value: K(), onChange: function(n3) {
            var e3 = n3.target.value.replace(/\s/g, "");
            RegExp("^[".concat(g, "]{0,").concat(h2, "}$")).test(e3) && (null == N || N(e3), D(e3), e3.length === h2 && (null == R || R(e3)));
          }, ref: function(n3) {
            $.current = n3, "function" == typeof t2 ? t2(n3) : t2 && (t2.current = n3);
          }, className: a2()("vi", J), onKeyDown: function(n3) {
            ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(n3.key) && n3.preventDefault();
          }, onFocus: function() {
            U(true), null == M || M();
          }, onBlur: function() {
            U(false), null == F || F();
          }, onSelect: function(n3) {
            var e3 = n3.target.value;
            n3.target.setSelectionRange(e3.length, e3.length);
          }, type: S ? "password" : Q }, W)), (q = Array(h2), function(n3) {
            if (Array.isArray(n3)) return p(n3);
          }(q) || function(n3) {
            if ("undefined" != typeof Symbol && null != n3[Symbol.iterator] || null != n3["@@iterator"]) return Array.from(n3);
          }(q) || d(q) || function() {
            throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
          }()).map(function(n3, r3) {
            return e2().createElement("div", { className: a2()("vi__character", I.character, { "vi__character--selected": V(r3), "vi__character--inactive": Z(r3), "vi__character--filled": G(r3) }, V(r3) && I.characterSelected, Z(r3) && I.characterInactive, G(r3) && I.characterFilled), onClick: H, id: "field-".concat(r3), "data-testid": "character-".concat(r3), key: r3 }, S && K()[r3] ? O : K()[r3] || m);
          })), e2().createElement("style", { dangerouslySetInnerHTML: { __html: i.A } }));
        });
        v.displayName = "VerificationInput";
        const h = v;
      })();
      var o = exports;
      for (var a in t) o[a] = t[a];
      t.__esModule && Object.defineProperty(o, "__esModule", { value: true });
    })();
  }
});
export default require_lib();
/*! Bundled license information:

react-verification-input/lib/index.js:
  (*! For license information please see index.js.LICENSE.txt *)
*/
//# sourceMappingURL=react-verification-input.js.map
