(function() {

    if (typeof console == "undefined") console = {};
    if (!console.log) console.log = function() {
        var out = java.lang.System.out;
        for (var i = 0; i < arguments.length; i++)
        out.print(arguments[i]);
        out.println();
    };

    if (!this.qxloadPrefixUrl) qxloadPrefixUrl = "";

    if (!this.window) window = this;

    if (!window.navigator) window.navigator = {
        userAgent: "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_4; de-de) AppleWebKit/533.17.8 (KHTML, like Gecko) Version/5.0.1 Safari/533.17.8",
        product: "",
        cpuClass: "",
        language: "en-US"
    };

    if (typeof environment !== "undefined") { // Rhino runtime
      if (!navigator.platform) navigator.platform = environment["os.name"];
    } else if (typeof process !== "undefined") { // Node runtime
      var os = require('os');
      var fs = require('fs');
      if (!navigator.platform) navigator.platform = os.type();
    }

    if (!window.setTimeout && environment && environment["java.version"]) {
      // Emulate setTimeout/setInterval features in Rhino
      // http://stackoverflow.com/questions/2261705/how-to-run-a-javascript-function-asynchronously-without-using-settimeout
      var timer = new java.util.Timer();
      var counter = 1; 
      var ids = {};

      window.setTimeout = function (fn,delay) 
      {
        if (delay === 0) {
          delay = 1;
        }
        var id = counter++;
        ids[id] = new JavaAdapter(java.util.TimerTask,{run: fn});
        timer.schedule(ids[id],delay);
        return id;
      };

      window.clearTimeout = function (id) 
      {
        if (ids[id])
        {
          ids[id].cancel();
          timer.purge();
          delete ids[id];
        }
      };

      window.setInterval = function (fn,delay) 
      {
        if (delay === 0) {
          delay = 1;
        }
        var id = counter++; 
        ids[id] = new JavaAdapter(java.util.TimerTask,{run: fn});
        timer.schedule(ids[id],delay,delay);
        return id;
      };

      window.clearInterval = window.clearTimeout;
    }

    if (!window.qx) window.qx = {};

    if (!qx.$$environment) qx.$$environment = {};
    var envinfo = {"qx.application":"simulator.Application","qx.aspects":false,"qx.debug":false,"qx.globalErrorHandling":false,"qx.optimization.basecalls":true,"qx.optimization.privates":true,"qx.revision":"","qx.testNameSpace":"skel.simulation","qx.version":"3.5","testrunner.testOrigin":"internal","testrunner.view":"testrunner.view.Basic"};
    for (var k in envinfo) qx.$$environment[k] = envinfo[k];

    if (!qx.$$libraries) qx.$$libraries = {};
    var libinfo = {"__out__":{"sourceUri":"script"},"qx":{"resourceUri":"resource","sourceUri":"script","sourceViewUri":"https://github.com/qooxdoo/qooxdoo/blob/%{qxGitBranch}/framework/source/class/%{classFilePath}#L%{lineNumber}"},"simulator":{"resourceUri":"resource","sourceUri":"script"},"skel":{"resourceUri":"resource","sourceUri":"script"},"testrunner":{"resourceUri":"resource","sourceUri":"script"}};
    for (var k in libinfo) qx.$$libraries[k] = libinfo[k];

    var isDebug = qx.$$environment["qx.debug"],
        log = isDebug ? console.log : function() {},
        load = qx.$$environment["qx.load"] ? this[qx.$$environment["load"]] : this.load;

    qx.$$resources = {};
    qx.$$translations = {"C":null};
    qx.$$locales = {"C":null};
    qx.$$packageData = {};
    qx.$$loader = {
        parts: {"boot":[0]},
        packages: {"0":{"uris":["__out__:simulator.d8fb4c8dffb4.js"]}},
        urisBefore: [],
        boot: "boot",
        closureParts: {},
        bootIsInline: true,

        decodeUris: function(compressedUris) {
            var libs = qx.$$libraries;
            var uris = [];
            for (var i = 0; i < compressedUris.length; i++) {
                var uri = compressedUris[i].split(":");
                var euri;
                if (uri.length == 2 && uri[0] in libs) {
                    var prefix = libs[uri[0]].sourceUri;
                    euri = prefix + "/" + uri[1];
                } else {
                    euri = compressedUris[i];
                }
                uris.push(qxloadPrefixUrl + euri);
            }
            return uris;
        },

        init: function() {
            var l = qx.$$loader;
            if (l.urisBefore.length > 0) this.loadScriptList(l.urisBefore);

            var bootPackageHash = l.parts[l.boot][0];
            if (!l.bootIsInline) this.loadScriptList(l.decodeUris(l.packages[l.parts[l.boot][0]].uris));
            l.importPackageData(qx.$$packageData[bootPackageHash] || {});
            l.signalStartup();
        },

        loadScriptList: function(uris) {
            var i, p, s;
            for (i = 0; i < uris.length; i++) {
                if (typeof process !== "undefined") { // Node
                  p = uris[i];
                  try {
                    require(p);
                  } catch (e) {
                    console.error("Unable to load uri: "+p);
                    throw e;
                  }
                } else if (typeof environment !== "undefined") { // Rhino
                  p = uris[i];
                  try {
                    load(p);
                  } catch (e) {
                    java.lang.System.err.println("Unable to load uri: "+p);
                    throw e;
                  }
                }
                //log("loaded uri " + p);
            }
        },

        signalStartup: function() {
            qx.$$loader.scriptLoaded = true;
            qx.core.BaseInit.ready();
            qx.$$loader.applicationHandlerReady = true;
        },

        importPackageData: function(dataMap, callback) {
            if (dataMap["resources"]) {
                var resMap = dataMap["resources"];
                for (var k in resMap)
                qx.$$resources[k] = resMap[k];
            }
            if (dataMap["locales"]) {
                var locMap = dataMap["locales"];
                var qxlocs = qx.$$locales;
                for (var lang in locMap) {
                    if (!qxlocs[lang]) qxlocs[lang] = locMap[lang];
                    else for (var k in locMap[lang])
                    qxlocs[lang][k] = locMap[lang][k];
                }
            }
            if (dataMap["translations"]) {
                var trMap = dataMap["translations"];
                var qxtrans = qx.$$translations;
                for (var lang in trMap) {
                    if (!qxtrans[lang]) qxtrans[lang] = trMap[lang];
                    else for (var k in trMap[lang])
                    qxtrans[lang][k] = trMap[lang][k];
                }
            }
            if (callback) {
                callback(dataMap);
            }
        }
    };

})();


qx.$$packageData['0']={"locales":{},"resources":{},"translations":{"C":{}}};

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Create namespace
 *
 * @ignore(qx.data)
 * @ignore(qx.data.IListData)
 * @ignore(qx.util.OOUtil)
 */
if(!window.qx){

  window.qx = {
  };
};
/**
 * Bootstrap qx.Bootstrap to create myself later
 * This is needed for the API browser etc. to let them detect me
 */
qx.Bootstrap = {
  genericToString : function(){

    return "[Class " + this.classname + "]";
  },
  createNamespace : function(name, object){

    var splits = name.split(".");
    var part = splits[0];
    var parent = this.__a && this.__a[part] ? this.__a : window;
    for(var i = 0,len = splits.length - 1;i < len;i++,part = splits[i]){

      if(!parent[part]){

        parent = parent[part] = {
        };
      } else {

        parent = parent[part];
      };
    };
    // store object
    parent[part] = object;
    // return last part name (e.g. classname)
    return part;
  },
  setDisplayName : function(fcn, classname, name){

    fcn.displayName = classname + "." + name + "()";
  },
  setDisplayNames : function(functionMap, classname){

    for(var name in functionMap){

      var value = functionMap[name];
      if(value instanceof Function){

        value.displayName = classname + "." + name + "()";
      };
    };
  },
  base : function(args, varargs){

    if(qx.Bootstrap.DEBUG){

      if(!qx.Bootstrap.isFunction(args.callee.base)){

        throw new Error("Cannot call super class. Method is not derived: " + args.callee.displayName);
      };
    };
    if(arguments.length === 1){

      return args.callee.base.call(this);
    } else {

      return args.callee.base.apply(this, Array.prototype.slice.call(arguments, 1));
    };
  },
  define : function(name, config){

    if(!config){

      config = {
        statics : {
        }
      };
    };
    var clazz;
    var proto = null;
    qx.Bootstrap.setDisplayNames(config.statics, name);
    if(config.members || config.extend){

      qx.Bootstrap.setDisplayNames(config.members, name + ".prototype");
      clazz = config.construct || new Function;
      if(config.extend){

        this.extendClass(clazz, clazz, config.extend, name, basename);
      };
      var statics = config.statics || {
      };
      // use keys to include the shadowed in IE
      for(var i = 0,keys = qx.Bootstrap.keys(statics),l = keys.length;i < l;i++){

        var key = keys[i];
        clazz[key] = statics[key];
      };
      proto = clazz.prototype;
      // Enable basecalls within constructor
      proto.base = qx.Bootstrap.base;
      var members = config.members || {
      };
      var key,member;
      // use keys to include the shadowed in IE
      for(var i = 0,keys = qx.Bootstrap.keys(members),l = keys.length;i < l;i++){

        key = keys[i];
        member = members[key];
        // Enable basecalls for methods
        // Hint: proto[key] is not yet overwritten here
        if(member instanceof Function && proto[key]){

          member.base = proto[key];
        };
        proto[key] = member;
      };
    } else {

      clazz = config.statics || {
      };
      // Merge class into former class (needed for 'optimize: ["statics"]')
      if(qx.Bootstrap.$$registry && qx.Bootstrap.$$registry[name]){

        var formerClass = qx.Bootstrap.$$registry[name];
        // Add/overwrite properties and return early if necessary
        if(this.keys(clazz).length !== 0){

          // Execute defer to prevent too early overrides
          if(config.defer){

            config.defer(clazz, proto);
          };
          for(var curProp in clazz){

            formerClass[curProp] = clazz[curProp];
          };
          return formerClass;
        };
      };
    };
    // Store type info
    clazz.$$type = "Class";
    // Attach toString
    if(!clazz.hasOwnProperty("toString")){

      clazz.toString = this.genericToString;
    };
    // Create namespace
    var basename = name ? this.createNamespace(name, clazz) : "";
    // Store names in constructor/object
    clazz.name = clazz.classname = name;
    clazz.basename = basename;
    clazz.$$events = config.events;
    // Execute defer section
    if(config.defer){

      config.defer(clazz, proto);
    };
    // Store class reference in global class registry
    if(name != null){

      qx.Bootstrap.$$registry[name] = clazz;
    };
    return clazz;
  }
};
/**
 * Internal class that is responsible for bootstrapping the qooxdoo
 * framework at load time.
 */
qx.Bootstrap.define("qx.Bootstrap", {
  statics : {
    /** Root for create namespace. **/
    __a : null,
    /** Timestamp of qooxdoo based application startup */
    LOADSTART : qx.$$start || new Date(),
    /**
     * Mapping for early use of the qx.debug environment setting.
     */
    DEBUG : (function(){

      // make sure to reflect all changes here to the environment class!
      var debug = true;
      if(qx.$$environment && qx.$$environment["qx.debug"] === false){

        debug = false;
      };
      return debug;
    })(),
    /**
     * Minimal accessor API for the environment settings given from the
     * generator.
     *
     * WARNING: This method only should be used if the
     * {@link qx.core.Environment} class is not loaded!
     *
     * @param key {String} The key to get the value from.
     * @return {var} The value of the setting or <code>undefined</code>.
     */
    getEnvironmentSetting : function(key){

      if(qx.$$environment){

        return qx.$$environment[key];
      };
    },
    /**
     * Minimal mutator for the environment settings given from the generator.
     * It checks for the existance of the environment settings and sets the
     * key if its not given from the generator. If a setting is available from
     * the generator, the setting will be ignored.
     *
     * WARNING: This method only should be used if the
     * {@link qx.core.Environment} class is not loaded!
     *
     * @param key {String} The key of the setting.
     * @param value {var} The value for the setting.
     */
    setEnvironmentSetting : function(key, value){

      if(!qx.$$environment){

        qx.$$environment = {
        };
      };
      if(qx.$$environment[key] === undefined){

        qx.$$environment[key] = value;
      };
    },
    /**
     * Creates a namespace and assigns the given object to it.
     *
     * @internal
     * @signature function(name, object)
     * @param name {String} The complete namespace to create. Typically, the last part is the class name itself
     * @param object {Object} The object to attach to the namespace
     * @return {String} last part of the namespace (which object is assigned to)
     * @throws {Error} when the given object already exists.
     */
    createNamespace : qx.Bootstrap.createNamespace,
    /**
     * Offers the ability to change the root for creating namespaces from window to
     * whatever object is given.
     *
     * @param root {Object} The root to use.
     * @internal
     */
    setRoot : function(root){

      this.__a = root;
    },
    /**
     * Call the same method of the super class.
     *
     * @signature function(args, varargs)
     * @param args {arguments} the arguments variable of the calling method
     * @param varargs {var} variable number of arguments passed to the overwritten function
     * @return {var} the return value of the method of the base class.
     */
    base : qx.Bootstrap.base,
    /**
     * Define a new class using the qooxdoo class system.
     * Lightweight version of {@link qx.Class#define} with less features.
     *
     * @signature function(name, config)
     * @param name {String?} Name of the class. If null, the class will not be
     *   attached to a namespace.
     * @param config {Map ? null} Class definition structure. The configuration map has the following keys:
     *     <table>
     *       <tr><th>Name</th><th>Type</th><th>Description</th></tr>
     *       <tr><th>extend</th><td>Class</td><td>The super class the current class inherits from.</td></tr>
     *       <tr><th>construct</th><td>Function</td><td>The constructor of the class.</td></tr>
     *       <tr><th>statics</th><td>Map</td><td>Map of static values / functions of the class.</td></tr>
     *       <tr><th>members</th><td>Map</td><td>Map of instance members of the class.</td></tr>
     *       <tr><th>defer</th><td>Function</td><td>Function that is called at the end of
     *          processing the class declaration.</td></tr>
     *     </table>
     * @return {Class} The defined class.
     */
    define : qx.Bootstrap.define,
    /**
     * Sets the display name of the given function
     *
     * @signature function(fcn, classname, name)
     * @param fcn {Function} the function to set the display name for
     * @param classname {String} the name of the class the function is defined in
     * @param name {String} the function name
     */
    setDisplayName : qx.Bootstrap.setDisplayName,
    /**
     * Set the names of all functions defined in the given map
     *
     * @signature function(functionMap, classname)
     * @param functionMap {Object} a map with functions as values
     * @param classname {String} the name of the class, the functions are
     *   defined in
     */
    setDisplayNames : qx.Bootstrap.setDisplayNames,
    /**
     * This method will be attached to all classes to return
     * a nice identifier for them.
     *
     * @internal
     * @signature function()
     * @return {String} The class identifier
     */
    genericToString : qx.Bootstrap.genericToString,
    /**
     * Inherit a clazz from a super class.
     *
     * This function differentiates between class and constructor because the
     * constructor written by the user might be wrapped and the <code>base</code>
     * property has to be attached to the constructor, while the <code>superclass</code>
     * property has to be attached to the wrapped constructor.
     *
     * @param clazz {Function} The class's wrapped constructor
     * @param construct {Function} The unwrapped constructor
     * @param superClass {Function} The super class
     * @param name {Function} fully qualified class name
     * @param basename {Function} the base name
     */
    extendClass : function(clazz, construct, superClass, name, basename){

      var superproto = superClass.prototype;
      // Use helper function/class to save the unnecessary constructor call while
      // setting up inheritance.
      var helper = new Function();
      helper.prototype = superproto;
      var proto = new helper();
      // Apply prototype to new helper instance
      clazz.prototype = proto;
      // Store names in prototype
      proto.name = proto.classname = name;
      proto.basename = basename;
      /*
        - Store base constructor to constructor-
        - Store reference to extend class
      */
      construct.base = superClass;
      clazz.superclass = superClass;
      /*
        - Store statics/constructor onto constructor/prototype
        - Store correct constructor
        - Store statics onto prototype
      */
      construct.self = clazz.constructor = proto.constructor = clazz;
    },
    /**
     * Find a class by its name
     *
     * @param name {String} class name to resolve
     * @return {Class} the class
     */
    getByName : function(name){

      return qx.Bootstrap.$$registry[name];
    },
    /** @type {Map} Stores all defined classes */
    $$registry : {
    },
    /*
    ---------------------------------------------------------------------------
      OBJECT UTILITY FUNCTIONS
    ---------------------------------------------------------------------------
    */
    /**
     * Get the number of own properties in the object.
     *
     * @param map {Object} the map
     * @return {Integer} number of objects in the map
     * @lint ignoreUnused(key)
     */
    objectGetLength : function(map){

      return qx.Bootstrap.keys(map).length;
    },
    /**
     * Inserts all keys of the source object into the
     * target objects. Attention: The target map gets modified.
     *
     * @param target {Object} target object
     * @param source {Object} object to be merged
     * @param overwrite {Boolean ? true} If enabled existing keys will be overwritten
     * @return {Object} Target with merged values from the source object
     */
    objectMergeWith : function(target, source, overwrite){

      if(overwrite === undefined){

        overwrite = true;
      };
      for(var key in source){

        if(overwrite || target[key] === undefined){

          target[key] = source[key];
        };
      };
      return target;
    },
    /**
     * IE does not return "shadowed" keys even if they are defined directly
     * in the object.
     *
     * @internal
     * @type {String[]}
     */
    __b : ["isPrototypeOf", "hasOwnProperty", "toLocaleString", "toString", "valueOf", "propertyIsEnumerable", "constructor"],
    /**
     * Get the keys of a map as array as returned by a "for ... in" statement.
     *
     * @signature function(map)
     * @internal
     * @param map {Object} the map
     * @return {Array} array of the keys of the map
     */
    keys : ({
      "ES5" : Object.keys,
      "BROKEN_IE" : function(map){

        if(map === null || (typeof map != "object" && typeof map != "function")){

          throw new TypeError("Object.keys requires an object as argument.");
        };
        var arr = [];
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        for(var key in map){

          if(hasOwnProperty.call(map, key)){

            arr.push(key);
          };
        };
        // IE does not return "shadowed" keys even if they are defined directly
        // in the object. This is incompatible with the ECMA standard!!
        // This is why this checks are needed.
        var shadowedKeys = qx.Bootstrap.__b;
        for(var i = 0,a = shadowedKeys,l = a.length;i < l;i++){

          if(hasOwnProperty.call(map, a[i])){

            arr.push(a[i]);
          };
        };
        return arr;
      },
      "default" : function(map){

        if(map === null || (typeof map != "object" && typeof map != "function")){

          throw new TypeError("Object.keys requires an object as argument.");
        };
        var arr = [];
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        for(var key in map){

          if(hasOwnProperty.call(map, key)){

            arr.push(key);
          };
        };
        return arr;
      }
    })[typeof (Object.keys) == "function" ? "ES5" : (function(){

      for(var key in {
        toString : 1
      }){

        return key;
      };
    })() !== "toString" ? "BROKEN_IE" : "default"],
    /**
     * Mapping from JavaScript string representation of objects to names
     * @internal
     * @type {Map}
     */
    __c : {
      "[object String]" : "String",
      "[object Array]" : "Array",
      "[object Object]" : "Object",
      "[object RegExp]" : "RegExp",
      "[object Number]" : "Number",
      "[object Boolean]" : "Boolean",
      "[object Date]" : "Date",
      "[object Function]" : "Function",
      "[object Error]" : "Error"
    },
    /*
    ---------------------------------------------------------------------------
      FUNCTION UTILITY FUNCTIONS
    ---------------------------------------------------------------------------
    */
    /**
     * Returns a function whose "this" is altered.
     *
     * *Syntax*
     *
     * <pre class='javascript'>qx.Bootstrap.bind(myFunction, [self, [varargs...]]);</pre>
     *
     * *Example*
     *
     * <pre class='javascript'>
     * function myFunction()
     * {
     *   this.setStyle('color', 'red');
     *   // note that 'this' here refers to myFunction, not an element
     *   // we'll need to bind this function to the element we want to alter
     * };
     *
     * var myBoundFunction = qx.Bootstrap.bind(myFunction, myElement);
     * myBoundFunction(); // this will make the element myElement red.
     * </pre>
     *
     * @param func {Function} Original function to wrap
     * @param self {Object ? null} The object that the "this" of the function will refer to.
     * @param varargs {arguments ? null} The arguments to pass to the function.
     * @return {Function} The bound function.
     */
    bind : function(func, self, varargs){

      var fixedArgs = Array.prototype.slice.call(arguments, 2, arguments.length);
      return function(){

        var args = Array.prototype.slice.call(arguments, 0, arguments.length);
        return func.apply(self, fixedArgs.concat(args));
      };
    },
    /*
    ---------------------------------------------------------------------------
      STRING UTILITY FUNCTIONS
    ---------------------------------------------------------------------------
    */
    /**
     * Convert the first character of the string to upper case.
     *
     * @param str {String} the string
     * @return {String} the string with an upper case first character
     */
    firstUp : function(str){

      return str.charAt(0).toUpperCase() + str.substr(1);
    },
    /**
     * Convert the first character of the string to lower case.
     *
     * @param str {String} the string
     * @return {String} the string with a lower case first character
     */
    firstLow : function(str){

      return str.charAt(0).toLowerCase() + str.substr(1);
    },
    /*
    ---------------------------------------------------------------------------
      TYPE UTILITY FUNCTIONS
    ---------------------------------------------------------------------------
    */
    /**
     * Get the internal class of the value. See
     * http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
     * for details.
     *
     * @param value {var} value to get the class for
     * @return {String} the internal class of the value
     */
    getClass : function(value){

      var classString = Object.prototype.toString.call(value);
      return (qx.Bootstrap.__c[classString] || classString.slice(8, -1));
    },
    /**
     * Whether the value is a string.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a string.
     */
    isString : function(value){

      // Added "value !== null" because IE throws an exception "Object expected"
      // by executing "value instanceof String" if value is a DOM element that
      // doesn't exist. It seems that there is an internal difference between a
      // JavaScript null and a null returned from calling DOM.
      // e.q. by document.getElementById("ReturnedNull").
      return (value !== null && (typeof value === "string" || qx.Bootstrap.getClass(value) == "String" || value instanceof String || (!!value && !!value.$$isString)));
    },
    /**
     * Whether the value is an array.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is an array.
     */
    isArray : function(value){

      // Added "value !== null" because IE throws an exception "Object expected"
      // by executing "value instanceof Array" if value is a DOM element that
      // doesn't exist. It seems that there is an internal difference between a
      // JavaScript null and a null returned from calling DOM.
      // e.q. by document.getElementById("ReturnedNull").
      return (value !== null && (value instanceof Array || (value && qx.data && qx.data.IListData && qx.util.OOUtil.hasInterface(value.constructor, qx.data.IListData)) || qx.Bootstrap.getClass(value) == "Array" || (!!value && !!value.$$isArray)));
    },
    /**
     * Whether the value is an object. Note that built-in types like Window are
     * not reported to be objects.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is an object.
     */
    isObject : function(value){

      return (value !== undefined && value !== null && qx.Bootstrap.getClass(value) == "Object");
    },
    /**
     * Whether the value is a function.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a function.
     */
    isFunction : function(value){

      return qx.Bootstrap.getClass(value) == "Function";
    },
    /*
    ---------------------------------------------------------------------------
      LOGGING UTILITY FUNCTIONS
    ---------------------------------------------------------------------------
    */
    $$logs : [],
    /**
     * Sending a message at level "debug" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     */
    debug : function(object, message){

      qx.Bootstrap.$$logs.push(["debug", arguments]);
    },
    /**
     * Sending a message at level "info" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     */
    info : function(object, message){

      qx.Bootstrap.$$logs.push(["info", arguments]);
    },
    /**
     * Sending a message at level "warn" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     */
    warn : function(object, message){

      qx.Bootstrap.$$logs.push(["warn", arguments]);
    },
    /**
     * Sending a message at level "error" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     */
    error : function(object, message){

      qx.Bootstrap.$$logs.push(["error", arguments]);
    },
    /**
     * Prints the current stack trace at level "info"
     *
     * @param object {Object} Contextual object (either instance or static class)
     */
    trace : function(object){
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/**
 * This class is a base class for the OO system defined by Class, Mixin
 * and Interface. It contains helper which are basically needed to create the
 * Classes which define the OO system.
 */
qx.Bootstrap.define("qx.util.OOUtil", {
  statics : {
    /**
     * Whether the given class exists
     *
     * @param name {String} class name to check
     * @return {Boolean} true if class exists
     */
    classIsDefined : function(name){

      return qx.Bootstrap.getByName(name) !== undefined;
    },
    /**
     * Returns the definition of the given property, if not redefined.
     * Returns null if the property does not exist.
     *
     * @param clazz {Class} class to check
     * @param name {String} name of the class to check for
     * @return {Map|null} whether the object support the given event.
     */
    getPropertyDefinition : function(clazz, name){

      while(clazz){

        if(clazz.$$properties && clazz.$$properties[name]){

          return clazz.$$properties[name];
        };
        clazz = clazz.superclass;
      };
      return null;
    },
    /**
     * Whether a class has the given property
     *
     * @param clazz {Class} class to check
     * @param name {String} name of the property to check for
     * @return {Boolean} whether the class includes the given property.
     */
    hasProperty : function(clazz, name){

      return !!qx.util.OOUtil.getPropertyDefinition(clazz, name);
    },
    /**
     * Returns the event type of the given event. Returns null if
     * the event does not exist.
     *
     * @param clazz {Class} class to check
     * @param name {String} name of the event
     * @return {Map|null} Event type of the given event.
     */
    getEventType : function(clazz, name){

      var clazz = clazz.constructor;
      while(clazz.superclass){

        if(clazz.$$events && clazz.$$events[name] !== undefined){

          return clazz.$$events[name];
        };
        clazz = clazz.superclass;
      };
      return null;
    },
    /**
     * Whether a class supports the given event type
     *
     * @param clazz {Class} class to check
     * @param name {String} name of the event to check for
     * @return {Boolean} whether the class supports the given event.
     */
    supportsEvent : function(clazz, name){

      return !!qx.util.OOUtil.getEventType(clazz, name);
    },
    /**
     * Returns the class or one of its super classes which contains the
     * declaration of the given interface. Returns null if the interface is not
     * specified anywhere.
     *
     * @param clazz {Class} class to look for the interface
     * @param iface {Interface} interface to look for
     * @return {Class | null} the class which directly implements the given interface
     */
    getByInterface : function(clazz, iface){

      var list,i,l;
      while(clazz){

        if(clazz.$$implements){

          list = clazz.$$flatImplements;
          for(i = 0,l = list.length;i < l;i++){

            if(list[i] === iface){

              return clazz;
            };
          };
        };
        clazz = clazz.superclass;
      };
      return null;
    },
    /**
     * Whether a given class or any of its super classes includes a given interface.
     *
     * This function will return "true" if the interface was defined
     * in the class declaration ({@link qx.Class#define}) of the class
     * or any of its super classes using the "implement"
     * key.
     *
     * @param clazz {Class} class to check
     * @param iface {Interface} the interface to check for
     * @return {Boolean} whether the class includes the interface.
     */
    hasInterface : function(clazz, iface){

      return !!qx.util.OOUtil.getByInterface(clazz, iface);
    },
    /**
     * Returns a list of all mixins available in a given class.
     *
     * @param clazz {Class} class which should be inspected
     * @return {Mixin[]} array of mixins this class uses
     */
    getMixins : function(clazz){

      var list = [];
      while(clazz){

        if(clazz.$$includes){

          list.push.apply(list, clazz.$$flatIncludes);
        };
        clazz = clazz.superclass;
      };
      return list;
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2005-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * This class is the single point to access all settings that may be different
 * in different environments. This contains e.g. the browser name, engine
 * version but also qooxdoo or application specific settings.
 *
 * Its public API can be found in its four main methods. One pair of methods
 * is used to check the synchronous values of the environment. The other pair
 * of methods is used for asynchronous checks.
 *
 * The most often used method should be {@link #get}, which returns the
 * current value for a given environment check.
 *
 * All qooxdoo settings can be changed via the generator's config. See the manual
 * for more details about the environment key in the config. As you can see
 * from the methods API, there is no way to override an existing key. So if you
 * need to change a qooxdoo setting, you have to use the generator to do so.
 *
 * The generator is also responsible for requiring the necessary implementation
 * classes for each check. When using a check of a new category, make sure to
 * rebuild you application and let the generator include the necessary files.
 *
 * The following table shows the available checks. If you are
 * interested in more details, check the reference to the implementation of
 * each check. Please do not use those check implementations directly, as the
 * Environment class comes with a smart caching feature.
 *
 * <table border="0" cellspacing="10">
 *   <tbody>
 *     <tr>
 *       <td colspan="4"><h2>Synchronous checks</h2>
 *       </td>
 *     </tr>
 *     <tr>
 *       <th><h3>Key</h3></th>
 *       <th><h3>Type</h3></th>
 *       <th><h3>Example</h3></th>
 *       <th><h3>Details</h3></th>
 *     </tr>
 *     <tr>
 *       <td colspan="4"><b>browser</b></td>
 *     </tr>
 *     <tr>
 *       <td>browser.documentmode</td><td><i>Integer</i></td><td><code>0</code></td>
 *       <td>{@link qx.bom.client.Browser#getDocumentMode}</td>
 *     </tr>
 *     <tr>
 *       <td>browser.name</td><td><i>String</i></td><td><code> chrome </code></td>
 *       <td>{@link qx.bom.client.Browser#getName}</td>
 *     </tr>
 *     <tr>
 *       <td>browser.quirksmode</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Browser#getQuirksMode}</td>
 *     </tr>
 *     <tr>
 *       <td>browser.version</td><td><i>String</i></td><td><code>11.0</code></td>
 *       <td>{@link qx.bom.client.Browser#getVersion}</td>
 *     </tr>
 *     <tr>
 *       <td colspan="4"><b>runtime</b></td>
 *     </tr>
 *     <tr>
 *       <td>runtime.name</td><td><i> String </i></td><td><code> node.js </code></td>
 *       <td>{@link qx.bom.client.Runtime#getName}</td>
 *     </tr>
 *     <tr>
 *       <td colspan="4"><b>css</b></td>
 *     </tr>
 *     <tr>
 *       <td>css.borderradius</td><td><i>String</i> or <i>null</i></td><td><code>borderRadius</code></td>
 *       <td>{@link qx.bom.client.Css#getBorderRadius}</td>
 *     </tr>
 *     <tr>
 *       <td>css.borderimage</td><td><i>String</i> or <i>null</i></td><td><code>WebkitBorderImage</code></td>
 *       <td>{@link qx.bom.client.Css#getBorderImage}</td>
 *     </tr>
 *     <tr>
 *       <td>css.borderimage.standardsyntax</td><td><i>Boolean</i> or <i>null</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getBorderImageSyntax}</td>
 *     </tr>
 *     <tr>
 *       <td>css.boxmodel</td><td><i>String</i></td><td><code>content</code></td>
 *       <td>{@link qx.bom.client.Css#getBoxModel}</td>
 *     </tr>
 *     <tr>
 *       <td>css.boxshadow</td><td><i>String</i> or <i>null</i></td><td><code>boxShadow</code></td>
 *       <td>{@link qx.bom.client.Css#getBoxShadow}</td>
 *     </tr>
 *     <tr>
 *       <td>css.gradient.linear</td><td><i>String</i> or <i>null</i></td><td><code>-moz-linear-gradient</code></td>
 *       <td>{@link qx.bom.client.Css#getLinearGradient}</td>
 *     </tr>
 *     <tr>
 *       <td>css.gradient.filter</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getFilterGradient}</td>
 *     </tr>
 *     <tr>
 *       <td>css.gradient.radial</td><td><i>String</i> or <i>null</i></td><td><code>-moz-radial-gradient</code></td>
 *       <td>{@link qx.bom.client.Css#getRadialGradient}</td>
 *     </tr>
 *     <tr>
 *       <td>css.gradient.legacywebkit</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Css#getLegacyWebkitGradient}</td>
 *     </tr>
 *     <tr>
 *       <td>css.placeholder</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getPlaceholder}</td>
 *     </tr>
 *     <tr>
 *       <td>css.textoverflow</td><td><i>String</i> or <i>null</i></td><td><code>textOverflow</code></td>
 *       <td>{@link qx.bom.client.Css#getTextOverflow}</td>
 *     </tr>
 *     <tr>
 *       <td>css.rgba</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getRgba}</td>
 *     </tr>
 *     <tr>
 *       <td>css.usermodify</td><td><i>String</i> or <i>null</i></td><td><code>WebkitUserModify</code></td>
 *       <td>{@link qx.bom.client.Css#getUserModify}</td>
 *     </tr>
 *     <tr>
 *       <td>css.appearance</td><td><i>String</i> or <i>null</i></td><td><code>WebkitAppearance</code></td>
 *       <td>{@link qx.bom.client.Css#getAppearance}</td>
 *     </tr>
 *     <tr>
 *       <td>css.float</td><td><i>String</i> or <i>null</i></td><td><code>cssFloat</code></td>
 *       <td>{@link qx.bom.client.Css#getFloat}</td>
 *     </tr>
 *     <tr>
 *       <td>css.userselect</td><td><i>String</i> or <i>null</i></td><td><code>WebkitUserSelect</code></td>
 *       <td>{@link qx.bom.client.Css#getUserSelect}</td>
 *     </tr>
 *     <tr>
 *       <td>css.userselect.none</td><td><i>String</i> or <i>null</i></td><td><code>-moz-none</code></td>
 *       <td>{@link qx.bom.client.Css#getUserSelectNone}</td>
 *     </tr>
 *     <tr>
 *       <td>css.boxsizing</td><td><i>String</i> or <i>null</i></td><td><code>boxSizing</code></td>
 *       <td>{@link qx.bom.client.Css#getBoxSizing}</td>
 *     </tr>
 *     <tr>
 *       <td>css.animation</td><td><i>Object</i> or <i>null</i></td><td><code>{end-event: "webkitAnimationEnd", keyframes: "@-webkit-keyframes", play-state: null, name: "WebkitAnimation"}</code></td>
 *       <td>{@link qx.bom.client.CssAnimation#getSupport}</td>
 *     </tr>
 *     <tr>
 *       <td>css.animation.requestframe</td><td><i>String</i> or <i>null</i></td><td><code>mozRequestAnimationFrame</code></td>
 *       <td>{@link qx.bom.client.CssAnimation#getRequestAnimationFrame}</td>
 *     </tr>
 *     <tr>
 *       <td>css.transform</td><td><i>Object</i> or <i>null</i></td><td><code>{3d: true, origin: "WebkitTransformOrigin", name: "WebkitTransform", style: "WebkitTransformStyle", perspective: "WebkitPerspective", perspective-origin: "WebkitPerspectiveOrigin", backface-visibility: "WebkitBackfaceVisibility"}</code></td>
 *       <td>{@link qx.bom.client.CssTransform#getSupport}</td>
 *     </tr>
 *     <tr>
 *       <td>css.transform.3d</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.CssTransform#get3D}</td>
 *     </tr>
 *     <tr>
 *       <td>css.transition</td><td><i>Object</i> or <i>null</i></td><td><code>{end-event: "webkitTransitionEnd", name: "WebkitTransition"}</code></td>
 *       <td>{@link qx.bom.client.CssTransition#getSupport}</td>
 *     </tr>
 *     <tr>
 *       <td>css.inlineblock</td><td><i>String</i> or <i>null</i></td><td><code>inline-block</code></td>
 *       <td>{@link qx.bom.client.Css#getInlineBlock}</td>
 *     </tr>
 *     <tr>
 *       <td>css.opacity</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getOpacity}</td>
 *     </tr>
 *     <tr>
 *       <td>css.textShadow</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getTextShadow}</td>
 *     </tr>
 *     <tr>
 *       <td>css.textShadow.filter</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getFilterTextShadow}</td>
 *     </tr>
 *     <tr>
 *       <td>css.alphaimageloaderneeded</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Css#getAlphaImageLoaderNeeded}</td>
 *     </tr>
 *     <tr>
 *       <td>css.pointerevents</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getPointerEvents}</td>
 *     </tr>
 *     <tr>
 *       <td colspan="4"><b>device</b></td>
 *     </tr>
 *     <tr>
 *       <td>device.name</td><td><i>String</i></td><td><code>pc</code></td>
 *       <td>{@link qx.bom.client.Device#getName}</td>
 *     </tr>
 *     <tr>
 *       <td>device.type</td><td><i>String</i></td><td><code>mobile</code></td>
 *       <td>{@link qx.bom.client.Device#getType}</td>
 *     </tr>
 *     <tr>
 *       <td>device.pixelRatio</td><td><i>Number</i></td><td><code>2</code></td>
 *       <td>{@link qx.bom.client.Device#getDevicePixelRatio}</td>
 *     </tr>
 *     <tr>
 *       <td>device.touch</td><td><i>String</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Device#getTouch}</td>
 *     </tr>
 *     <tr>
 *       <td colspan="4"><b>ecmascript</b></td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.error.stacktrace</td><td><i>String</i> or <i>null</i></td><td><code>stack</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getStackTrace}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.array.indexof<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getArrayIndexOf}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.array.lastindexof<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getArrayLastIndexOf}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.array.foreach<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getArrayForEach}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.array.filter<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getArrayFilter}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.array.map<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getArrayMap}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.array.some<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getArraySome}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.array.every<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getArrayEvery}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.array.reduce<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getArrayReduce}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.array.reduceright<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getArrayReduceRight}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.function.bind<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getFunctionBind}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.object.keys<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getObjectKeys}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.date.now<td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getDateNow}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.error.toString</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getErrorToString}</td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.string.trim</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getStringTrim}</td>
 *     </tr>
 *     <tr>
 *       <td colspan="4"><b>engine</b></td>
 *     </tr>
 *     <tr>
 *       <td>engine.name</td><td><i>String</i></td><td><code>webkit</code></td>
 *       <td>{@link qx.bom.client.Engine#getName}</td>
 *     </tr>
 *     <tr>
 *       <td>engine.version</td><td><i>String</i></td><td><code>534.24</code></td>
 *       <td>{@link qx.bom.client.Engine#getVersion}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>event</b></td>
 *     </tr>
 *      <tr>
 *       <td>event.mspointer</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Event#getMsPointer}</td>
 *     </tr>
 *     <tr>
 *       <td>event.touch</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Event#getTouch}</td>
 *     </tr>
 *     <tr>
 *       <td>event.help</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Event#getHelp}</td>
 *     </tr>
 *     <tr>
 *       <td>event.hashchange</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Event#getHashChange}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>html</b></td>
 *     </tr>
 *     <tr>
 *       <td>html.audio</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getAudio}</td>
 *     </tr>
 *     <tr>
 *       <td>html.audio.mp3</td><td><i>String</i></td><td><code>""</code></td>
 *       <td>{@link qx.bom.client.Html#getAudioMp3}</td>
 *     </tr>
 *     <tr>
 *       <td>html.audio.ogg</td><td><i>String</i></td><td><code>"maybe"</code></td>
 *       <td>{@link qx.bom.client.Html#getAudioOgg}</td>
 *     </tr>
 *     <tr>
 *       <td>html.audio.wav</td><td><i>String</i></td><td><code>"probably"</code></td>
 *       <td>{@link qx.bom.client.Html#getAudioWav}</td>
 *     </tr>
 *     <tr>
 *       <td>html.audio.au</td><td><i>String</i></td><td><code>"maybe"</code></td>
 *       <td>{@link qx.bom.client.Html#getAudioAu}</td>
 *     </tr>
 *     <tr>
 *       <td>html.audio.aif</td><td><i>String</i></td><td><code>"probably"</code></td>
 *       <td>{@link qx.bom.client.Html#getAudioAif}</td>
 *     </tr>
 *     <tr>
 *       <td>html.canvas</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getCanvas}</td>
 *     </tr>
 *     <tr>
 *       <td>html.classlist</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getClassList}</td>
 *     </tr>
 *     <tr>
 *       <td>html.geolocation</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getGeoLocation}</td>
 *     </tr>
 *     <tr>
 *       <td>html.storage.local</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getLocalStorage}</td>
 *     </tr>
 *     <tr>
 *       <td>html.storage.session</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getSessionStorage}</td>
 *     </tr>
 *     <tr>
 *       <td>html.storage.userdata</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getUserDataStorage}</td>
 *     </tr>
 *     <tr>
 *       <td>html.svg</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getSvg}</td>
 *     </tr>
 *     <tr>
 *       <td>html.video</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getVideo}</td>
 *     </tr>
 *     <tr>
 *       <td>html.video.h264</td><td><i>String</i></td><td><code>"probably"</code></td>
 *       <td>{@link qx.bom.client.Html#getVideoH264}</td>
 *     </tr>
 *     <tr>
 *       <td>html.video.ogg</td><td><i>String</i></td><td><code>""</code></td>
 *       <td>{@link qx.bom.client.Html#getVideoOgg}</td>
 *     </tr>
 *     <tr>
 *       <td>html.video.webm</td><td><i>String</i></td><td><code>"maybe"</code></td>
 *       <td>{@link qx.bom.client.Html#getVideoWebm}</td>
 *     </tr>
 *     <tr>
 *       <td>html.vml</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Html#getVml}</td>
 *     </tr>
 *     <tr>
 *       <td>html.webworker</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getWebWorker}</td>
 *     <tr>
 *       <td>html.filereader</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getFileReader}</td>
 *     </tr>
 *     <tr>
 *       <td>html.xpath</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getXPath}</td>
 *     </tr>
 *     <tr>
 *       <td>html.xul</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getXul}</td>
 *     </tr>
 *     <tr>
 *       <td>html.console</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getConsole}</td>
 *     </tr>
 *     <tr>
 *       <td>html.element.contains</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getContains}</td>
 *     </tr>
 *     <tr>
 *       <td>html.element.compareDocumentPosition</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getCompareDocumentPosition}</td>
 *     </tr>
 *     <tr>
 *       <td>html.element.textContent</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getTextContent}</td>
 *     </tr>
 *     <tr>
 *       <td>html.image.naturaldimensions</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getNaturalDimensions}</td>
 *     </tr>
 *     <tr>
 *       <td>html.history.state</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getHistoryState}</td>
 *     </tr>
 *     <tr>
 *       <td>html.selection</td><td><i>String</i></td><td><code>getSelection</code></td>
 *       <td>{@link qx.bom.client.Html#getSelection}</td>
 *     </tr>
 *     <tr>
 *       <td>html.node.isequalnode</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getIsEqualNode}</td>
 *     </tr>
 *     <tr>
 *       <td colspan="4"><b>XML</b></td>
 *     </tr>
 *     <tr>
 *       <td>xml.implementation</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Xml#getImplementation}</td>
 *     </tr>
 *     <tr>
 *       <td>xml.domparser</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Xml#getDomParser}</td>
 *     </tr>
 *     <tr>
 *       <td>xml.selectsinglenode</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Xml#getSelectSingleNode}</td>
 *     </tr>
 *     <tr>
 *       <td>xml.selectnodes</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Xml#getSelectNodes}</td>
 *     </tr>
 *     <tr>
 *       <td>xml.getelementsbytagnamens</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Xml#getElementsByTagNameNS}</td>
 *     </tr>
 *     <tr>
 *       <td>xml.domproperties</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Xml#getDomProperties}</td>
 *     </tr>
 *     <tr>
 *       <td>xml.attributens</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Xml#getAttributeNS}</td>
 *     </tr>
 *     <tr>
 *       <td>xml.createelementns</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Xml#getCreateElementNS}</td>
 *     </tr>
 *     <tr>
 *       <td>xml.createnode</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Xml#getCreateNode}</td>
 *     </tr>
 *     <tr>
 *       <td>xml.getqualifieditem</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Xml#getQualifiedItem}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>Stylesheets</b></td>
 *     </tr>
 *     <tr>
 *       <td>html.stylesheet.createstylesheet</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Stylesheet#getCreateStyleSheet}</td>
 *     </tr>
 *     <tr>
 *       <td>html.stylesheet.insertrule</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Stylesheet#getInsertRule}</td>
 *     </tr>
 *     <tr>
 *       <td>html.stylesheet.deleterule</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Stylesheet#getDeleteRule}</td>
 *     </tr>
 *     <tr>
 *       <td>html.stylesheet.addimport</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Stylesheet#getAddImport}</td>
 *     </tr>
 *     <tr>
 *       <td>html.stylesheet.removeimport</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Stylesheet#getRemoveImport}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>io</b></td>
 *     </tr>
 *     <tr>
 *       <td>io.maxrequests</td><td><i>Integer</i></td><td><code>4</code></td>
 *       <td>{@link qx.bom.client.Transport#getMaxConcurrentRequestCount}</td>
 *     </tr>
 *     <tr>
 *       <td>io.ssl</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Transport#getSsl}</td>
 *     </tr>
 *     <tr>
 *       <td>io.xhr</td><td><i>String</i></td><td><code>xhr</code></td>
 *       <td>{@link qx.bom.client.Transport#getXmlHttpRequest}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>locale</b></td>
 *     </tr>
 *     <tr>
 *       <td>locale</td><td><i>String</i></td><td><code>de</code></td>
 *       <td>{@link qx.bom.client.Locale#getLocale}</td>
 *     </tr>
 *     <tr>
 *       <td>locale.variant</td><td><i>String</i></td><td><code>de</code></td>
 *       <td>{@link qx.bom.client.Locale#getVariant}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>os</b></td>
 *     </tr>
 *     <tr>
 *       <td>os.name</td><td><i>String</i></td><td><code>osx</code></td>
 *       <td>{@link qx.bom.client.OperatingSystem#getName}</td>
 *     </tr>
 *     <tr>
 *       <td>os.version</td><td><i>String</i></td><td><code>10.6</code></td>
 *       <td>{@link qx.bom.client.OperatingSystem#getVersion}</td>
 *     </tr>
 *     <tr>
 *       <td>os.scrollBarOverlayed</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Scroll#scrollBarOverlayed}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>phonegap</b></td>
 *     </tr>
 *     <tr>
 *       <td>phonegap</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.PhoneGap#getPhoneGap}</td>
 *     </tr>
 *     <tr>
 *       <td>phonegap.notification</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.PhoneGap#getNotification}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>plugin</b></td>
 *     </tr>
 *     <tr>
 *       <td>plugin.divx</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Plugin#getDivX}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.divx.version</td><td><i>String</i></td><td></td>
 *       <td>{@link qx.bom.client.Plugin#getDivXVersion}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.flash</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Flash#isAvailable}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.flash.express</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Flash#getExpressInstall}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.flash.strictsecurity</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Flash#getStrictSecurityModel}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.flash.version</td><td><i>String</i></td><td><code>10.2.154</code></td>
 *       <td>{@link qx.bom.client.Flash#getVersion}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.gears</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Plugin#getGears}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.activex</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Plugin#getActiveX}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.skype</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Plugin#getSkype}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.pdf</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Plugin#getPdf}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.pdf.version</td><td><i>String</i></td><td></td>
 *       <td>{@link qx.bom.client.Plugin#getPdfVersion}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.quicktime</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Plugin#getQuicktime}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.quicktime.version</td><td><i>String</i></td><td><code>7.6</code></td>
 *       <td>{@link qx.bom.client.Plugin#getQuicktimeVersion}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.silverlight</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Plugin#getSilverlight}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.silverlight.version</td><td><i>String</i></td><td></td>
 *       <td>{@link qx.bom.client.Plugin#getSilverlightVersion}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.windowsmedia</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Plugin#getWindowsMedia}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.windowsmedia.version</td><td><i>String</i></td><td></td>
 *       <td>{@link qx.bom.client.Plugin#getWindowsMediaVersion}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>qx</b></td>
 *     </tr>
 *     <tr>
 *       <td>qx.allowUrlSettings</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.allowUrlVariants</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.application</td><td><i>String</i></td><td><code>name.space</code></td>
 *       <td><i>default:</i> <code>&lt;&lt;application name&gt;&gt;</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.aspects</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.debug</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.debug.databinding</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.debug.dispose</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.debug.dispose.level</td><td><i>Integer</i></td><td><code>0</code></td>
 *       <td><i>default:</i> <code>0</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.debug.io</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *     <tr>
 *       <td>qx.debug.io.remote</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *     <tr>
 *       <td>qx.debug.io.remote.data</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.debug.property.level</td><td><i>Integer</i></td><td><code>0</code></td>
 *       <td><i>default:</i> <code>0</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.debug.ui.queue</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.dynamicmousewheel</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.dynlocale</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.dyntheme</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>

 *     <tr>
 *       <td>qx.globalErrorHandling</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.emulatemouse</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.mobile.emulatetouch</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.mobile.nativescroll</td><td><i>Boolean</i></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Scroll#getNativeScroll}</td>
 *     </tr>
 *     <tr>
 *       <td>qx.optimization.basecalls</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>true if the corresp. <i>optimize</i> key is set in the config</td>
 *     </tr>
 *     <tr>
 *       <td>qx.optimization.comments</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>true if the corresp. <i>optimize</i> key is set in the config</td>
 *     </tr>
 *     <tr>
 *       <td>qx.optimization.privates</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>true if the corresp. <i>optimize</i> key is set in the config</td>
 *     </tr>
 *     <tr>
 *       <td>qx.optimization.strings</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>true if the corresp. <i>optimize</i> key is set in the config</td>
 *     </tr>
 *     <tr>
 *       <td>qx.optimization.variables</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>true if the corresp. <i>optimize</i> key is set in the config</td>
 *     </tr>
 *     <tr>
 *       <td>qx.optimization.variants</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>true if the corresp. <i>optimize</i> key is set in the config</td>
 *     </tr>
 *     <tr>
 *       <td>qx.revision</td><td><i>String</i></td><td><code>27348</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.theme</td><td><i>String</i></td><td><code>qx.theme.Modern</code></td>
 *       <td><i>default:</i> <code>&lt;&lt;initial theme name&gt;&gt;</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.version</td><td><i>String</i></td><td><code>${qxversion}</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.blankpage</td><td><i>String</i></td><td><code>URI to blank.html page</code></td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>module</b></td>
 *     </tr>
 *     <tr>
 *       <td>module.databinding</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td>module.logger</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td>module.property</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td>module.events</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td colspan="4"><h3>Asynchronous checks</h3>
 *       </td>
 *     </tr>
 *     <tr>
 *       <td>html.dataurl</td><td><i>Boolean</i></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getDataUrl}</td>
 *     </tr>
 *   </tbody>
 * </table>
 *
 */
qx.Bootstrap.define("qx.core.Environment", {
  statics : {
    /** Map containing the synchronous check functions. */
    _checks : {
    },
    /** Map containing the asynchronous check functions. */
    _asyncChecks : {
    },
    /** Internal cache for all checks. */
    __d : {
    },
    /** Internal map for environment keys to check methods. */
    _checksMap : {
      "engine.version" : "qx.bom.client.Engine.getVersion",
      "engine.name" : "qx.bom.client.Engine.getName",
      "browser.name" : "qx.bom.client.Browser.getName",
      "browser.version" : "qx.bom.client.Browser.getVersion",
      "browser.documentmode" : "qx.bom.client.Browser.getDocumentMode",
      "browser.quirksmode" : "qx.bom.client.Browser.getQuirksMode",
      "runtime.name" : "qx.bom.client.Runtime.getName",
      "device.name" : "qx.bom.client.Device.getName",
      "device.type" : "qx.bom.client.Device.getType",
      "device.pixelRatio" : "qx.bom.client.Device.getPixelRatio",
      "device.touch" : "qx.bom.client.Device.getTouch",
      "locale" : "qx.bom.client.Locale.getLocale",
      "locale.variant" : "qx.bom.client.Locale.getVariant",
      "os.name" : "qx.bom.client.OperatingSystem.getName",
      "os.version" : "qx.bom.client.OperatingSystem.getVersion",
      "os.scrollBarOverlayed" : "qx.bom.client.Scroll.scrollBarOverlayed",
      "plugin.gears" : "qx.bom.client.Plugin.getGears",
      "plugin.activex" : "qx.bom.client.Plugin.getActiveX",
      "plugin.skype" : "qx.bom.client.Plugin.getSkype",
      "plugin.quicktime" : "qx.bom.client.Plugin.getQuicktime",
      "plugin.quicktime.version" : "qx.bom.client.Plugin.getQuicktimeVersion",
      "plugin.windowsmedia" : "qx.bom.client.Plugin.getWindowsMedia",
      "plugin.windowsmedia.version" : "qx.bom.client.Plugin.getWindowsMediaVersion",
      "plugin.divx" : "qx.bom.client.Plugin.getDivX",
      "plugin.divx.version" : "qx.bom.client.Plugin.getDivXVersion",
      "plugin.silverlight" : "qx.bom.client.Plugin.getSilverlight",
      "plugin.silverlight.version" : "qx.bom.client.Plugin.getSilverlightVersion",
      "plugin.flash" : "qx.bom.client.Flash.isAvailable",
      "plugin.flash.version" : "qx.bom.client.Flash.getVersion",
      "plugin.flash.express" : "qx.bom.client.Flash.getExpressInstall",
      "plugin.flash.strictsecurity" : "qx.bom.client.Flash.getStrictSecurityModel",
      "plugin.pdf" : "qx.bom.client.Plugin.getPdf",
      "plugin.pdf.version" : "qx.bom.client.Plugin.getPdfVersion",
      "io.maxrequests" : "qx.bom.client.Transport.getMaxConcurrentRequestCount",
      "io.ssl" : "qx.bom.client.Transport.getSsl",
      "io.xhr" : "qx.bom.client.Transport.getXmlHttpRequest",
      "event.touch" : "qx.bom.client.Event.getTouch",
      "event.mspointer" : "qx.bom.client.Engine.getMsPointer",
      "event.help" : "qx.bom.client.Event.getHelp",
      "event.hashchange" : "qx.bom.client.Event.getHashChange",
      "ecmascript.error.stacktrace" : "qx.bom.client.EcmaScript.getStackTrace",
      "ecmascript.array.indexof" : "qx.bom.client.EcmaScript.getArrayIndexOf",
      "ecmascript.array.lastindexof" : "qx.bom.client.EcmaScript.getArrayLastIndexOf",
      "ecmascript.array.foreach" : "qx.bom.client.EcmaScript.getArrayForEach",
      "ecmascript.array.filter" : "qx.bom.client.EcmaScript.getArrayFilter",
      "ecmascript.array.map" : "qx.bom.client.EcmaScript.getArrayMap",
      "ecmascript.array.some" : "qx.bom.client.EcmaScript.getArraySome",
      "ecmascript.array.every" : "qx.bom.client.EcmaScript.getArrayEvery",
      "ecmascript.array.reduce" : "qx.bom.client.EcmaScript.getArrayReduce",
      "ecmascript.array.reduceright" : "qx.bom.client.EcmaScript.getArrayReduceRight",
      "ecmascript.function.bind" : "qx.bom.client.EcmaScript.getFunctionBind",
      "ecmascript.object.keys" : "qx.bom.client.EcmaScript.getObjectKeys",
      "ecmascript.date.now" : "qx.bom.client.EcmaScript.getDateNow",
      "ecmascript.error.toString" : "qx.bom.client.EcmaScript.getErrorToString",
      "ecmascript.string.trim" : "qx.bom.client.EcmaScript.getStringTrim",
      "html.webworker" : "qx.bom.client.Html.getWebWorker",
      "html.filereader" : "qx.bom.client.Html.getFileReader",
      "html.geolocation" : "qx.bom.client.Html.getGeoLocation",
      "html.audio" : "qx.bom.client.Html.getAudio",
      "html.audio.ogg" : "qx.bom.client.Html.getAudioOgg",
      "html.audio.mp3" : "qx.bom.client.Html.getAudioMp3",
      "html.audio.wav" : "qx.bom.client.Html.getAudioWav",
      "html.audio.au" : "qx.bom.client.Html.getAudioAu",
      "html.audio.aif" : "qx.bom.client.Html.getAudioAif",
      "html.video" : "qx.bom.client.Html.getVideo",
      "html.video.ogg" : "qx.bom.client.Html.getVideoOgg",
      "html.video.h264" : "qx.bom.client.Html.getVideoH264",
      "html.video.webm" : "qx.bom.client.Html.getVideoWebm",
      "html.storage.local" : "qx.bom.client.Html.getLocalStorage",
      "html.storage.session" : "qx.bom.client.Html.getSessionStorage",
      "html.storage.userdata" : "qx.bom.client.Html.getUserDataStorage",
      "html.classlist" : "qx.bom.client.Html.getClassList",
      "html.xpath" : "qx.bom.client.Html.getXPath",
      "html.xul" : "qx.bom.client.Html.getXul",
      "html.canvas" : "qx.bom.client.Html.getCanvas",
      "html.svg" : "qx.bom.client.Html.getSvg",
      "html.vml" : "qx.bom.client.Html.getVml",
      "html.dataset" : "qx.bom.client.Html.getDataset",
      "html.dataurl" : "qx.bom.client.Html.getDataUrl",
      "html.console" : "qx.bom.client.Html.getConsole",
      "html.stylesheet.createstylesheet" : "qx.bom.client.Stylesheet.getCreateStyleSheet",
      "html.stylesheet.insertrule" : "qx.bom.client.Stylesheet.getInsertRule",
      "html.stylesheet.deleterule" : "qx.bom.client.Stylesheet.getDeleteRule",
      "html.stylesheet.addimport" : "qx.bom.client.Stylesheet.getAddImport",
      "html.stylesheet.removeimport" : "qx.bom.client.Stylesheet.getRemoveImport",
      "html.element.contains" : "qx.bom.client.Html.getContains",
      "html.element.compareDocumentPosition" : "qx.bom.client.Html.getCompareDocumentPosition",
      "html.element.textcontent" : "qx.bom.client.Html.getTextContent",
      "html.image.naturaldimensions" : "qx.bom.client.Html.getNaturalDimensions",
      "html.history.state" : "qx.bom.client.Html.getHistoryState",
      "html.selection" : "qx.bom.client.Html.getSelection",
      "html.node.isequalnode" : "qx.bom.client.Html.getIsEqualNode",
      "json" : "qx.bom.client.Json.getJson",
      "css.textoverflow" : "qx.bom.client.Css.getTextOverflow",
      "css.placeholder" : "qx.bom.client.Css.getPlaceholder",
      "css.borderradius" : "qx.bom.client.Css.getBorderRadius",
      "css.borderimage" : "qx.bom.client.Css.getBorderImage",
      "css.borderimage.standardsyntax" : "qx.bom.client.Css.getBorderImageSyntax",
      "css.boxshadow" : "qx.bom.client.Css.getBoxShadow",
      "css.gradient.linear" : "qx.bom.client.Css.getLinearGradient",
      "css.gradient.filter" : "qx.bom.client.Css.getFilterGradient",
      "css.gradient.radial" : "qx.bom.client.Css.getRadialGradient",
      "css.gradient.legacywebkit" : "qx.bom.client.Css.getLegacyWebkitGradient",
      "css.boxmodel" : "qx.bom.client.Css.getBoxModel",
      "css.rgba" : "qx.bom.client.Css.getRgba",
      "css.userselect" : "qx.bom.client.Css.getUserSelect",
      "css.userselect.none" : "qx.bom.client.Css.getUserSelectNone",
      "css.usermodify" : "qx.bom.client.Css.getUserModify",
      "css.appearance" : "qx.bom.client.Css.getAppearance",
      "css.float" : "qx.bom.client.Css.getFloat",
      "css.boxsizing" : "qx.bom.client.Css.getBoxSizing",
      "css.animation" : "qx.bom.client.CssAnimation.getSupport",
      "css.animation.requestframe" : "qx.bom.client.CssAnimation.getRequestAnimationFrame",
      "css.transform" : "qx.bom.client.CssTransform.getSupport",
      "css.transform.3d" : "qx.bom.client.CssTransform.get3D",
      "css.transition" : "qx.bom.client.CssTransition.getSupport",
      "css.inlineblock" : "qx.bom.client.Css.getInlineBlock",
      "css.opacity" : "qx.bom.client.Css.getOpacity",
      "css.textShadow" : "qx.bom.client.Css.getTextShadow",
      "css.textShadow.filter" : "qx.bom.client.Css.getFilterTextShadow",
      "css.alphaimageloaderneeded" : "qx.bom.client.Css.getAlphaImageLoaderNeeded",
      "css.pointerevents" : "qx.bom.client.Css.getPointerEvents",
      "phonegap" : "qx.bom.client.PhoneGap.getPhoneGap",
      "phonegap.notification" : "qx.bom.client.PhoneGap.getNotification",
      "xml.implementation" : "qx.bom.client.Xml.getImplementation",
      "xml.domparser" : "qx.bom.client.Xml.getDomParser",
      "xml.selectsinglenode" : "qx.bom.client.Xml.getSelectSingleNode",
      "xml.selectnodes" : "qx.bom.client.Xml.getSelectNodes",
      "xml.getelementsbytagnamens" : "qx.bom.client.Xml.getElementsByTagNameNS",
      "xml.domproperties" : "qx.bom.client.Xml.getDomProperties",
      "xml.attributens" : "qx.bom.client.Xml.getAttributeNS",
      "xml.createnode" : "qx.bom.client.Xml.getCreateNode",
      "xml.getqualifieditem" : "qx.bom.client.Xml.getQualifiedItem",
      "xml.createelementns" : "qx.bom.client.Xml.getCreateElementNS",
      "qx.mobile.nativescroll" : "qx.bom.client.Scroll.getNativeScroll"
    },
    /**
     * The default accessor for the checks. It returns the value the current
     * environment has for the given key. The key could be something like
     * "qx.debug", "css.textoverflow" or "io.ssl". A complete list of
     * checks can be found in the class comment of this class.
     *
     * Please keep in mind that the result is cached. If you want to run the
     * check function again in case something could have been changed, take a
     * look at the {@link #invalidateCacheKey} function.
     *
     * @param key {String} The name of the check you want to query.
     * @return {var} The stored value depending on the given key.
     *   (Details in the class doc)
     */
    get : function(key){

      // @deprecated {3.5}
      if(qx.Bootstrap.DEBUG){

        if(key === "json"){

          qx.Bootstrap.warn("The environment key 'json' is deprecated " + "and will eventually be removed.");
        };
      };
      // check the cache
      if(this.__d[key] != undefined){

        return this.__d[key];
      };
      // search for a matching check
      var check = this._checks[key];
      if(check){

        // execute the check and write the result in the cache
        var value = check();
        this.__d[key] = value;
        return value;
      };
      // try class lookup
      var classAndMethod = this._getClassNameFromEnvKey(key);
      if(classAndMethod[0] != undefined){

        var clazz = classAndMethod[0];
        var method = classAndMethod[1];
        var value = clazz[method]();
        // call the check method
        this.__d[key] = value;
        return value;
      };
      // debug flag
      if(qx.Bootstrap.DEBUG){

        qx.Bootstrap.warn(key + " is not a valid key. Please see the API-doc of " + "qx.core.Environment for a list of predefined keys.");
        qx.Bootstrap.trace(this);
      };
    },
    /**
     * Maps an environment key to a check class and method name.
     *
     * @param key {String} The name of the check you want to query.
     * @return {Array} [className, methodName] of
     *  the corresponding implementation.
     */
    _getClassNameFromEnvKey : function(key){

      var envmappings = this._checksMap;
      if(envmappings[key] != undefined){

        var implementation = envmappings[key];
        // separate class from method
        var lastdot = implementation.lastIndexOf(".");
        if(lastdot > -1){

          var classname = implementation.slice(0, lastdot);
          var methodname = implementation.slice(lastdot + 1);
          var clazz = qx.Bootstrap.getByName(classname);
          if(clazz != undefined){

            return [clazz, methodname];
          };
        };
      };
      return [undefined, undefined];
    },
    /**
     * Invokes the callback as soon as the check has been done. If no check
     * could be found, a warning will be printed.
     *
     * @param key {String} The key of the asynchronous check.
     * @param callback {Function} The function to call as soon as the check is
     *   done. The function should have one argument which is the result of the
     *   check.
     * @param self {var} The context to use when invoking the callback.
     */
    getAsync : function(key, callback, self){

      // check the cache
      var env = this;
      if(this.__d[key] != undefined){

        // force async behavior
        window.setTimeout(function(){

          callback.call(self, env.__d[key]);
        }, 0);
        return;
      };
      var check = this._asyncChecks[key];
      if(check){

        check(function(result){

          env.__d[key] = result;
          callback.call(self, result);
        });
        return;
      };
      // try class lookup
      var classAndMethod = this._getClassNameFromEnvKey(key);
      if(classAndMethod[0] != undefined){

        var clazz = classAndMethod[0];
        var method = classAndMethod[1];
        clazz[method](function(result){

          // call the check method
          env.__d[key] = result;
          callback.call(self, result);
        });
        return;
      };
      // debug flag
      if(qx.Bootstrap.DEBUG){

        qx.Bootstrap.warn(key + " is not a valid key. Please see the API-doc of " + "qx.core.Environment for a list of predefined keys.");
        qx.Bootstrap.trace(this);
      };
    },
    /**
     * Returns the proper value dependent on the check for the given key.
     *
     * @param key {String} The name of the check the select depends on.
     * @param values {Map} A map containing the values which should be returned
     *   in any case. The "default" key could be used as a catch all statement.
     * @return {var} The value which is stored in the map for the given
     *   check of the key.
     */
    select : function(key, values){

      return this.__e(this.get(key), values);
    },
    /**
     * Selects the proper function dependent on the asynchronous check.
     *
     * @param key {String} The key for the async check.
     * @param values {Map} A map containing functions. The map keys should
     *   contain all possibilities which could be returned by the given check
     *   key. The "default" key could be used as a catch all statement.
     *   The called function will get one parameter, the result of the query.
     * @param self {var} The context which should be used when calling the
     *   method in the values map.
     */
    selectAsync : function(key, values, self){

      this.getAsync(key, function(result){

        var value = this.__e(key, values);
        value.call(self, result);
      }, this);
    },
    /**
     * Internal helper which tries to pick the given key from the given values
     * map. If that key is not found, it tries to use a key named "default".
     * If there is also no default key, it prints out a warning and returns
     * undefined.
     *
     * @param key {String} The key to search for in the values.
     * @param values {Map} A map containing some keys.
     * @return {var} The value stored as values[key] usually.
     */
    __e : function(key, values){

      var value = values[key];
      if(values.hasOwnProperty(key)){

        return value;
      };
      // check for piped values
      for(var id in values){

        if(id.indexOf("|") != -1){

          var ids = id.split("|");
          for(var i = 0;i < ids.length;i++){

            if(ids[i] == key){

              return values[id];
            };
          };
        };
      };
      if(values["default"] !== undefined){

        return values["default"];
      };
      if(qx.Bootstrap.DEBUG){

        throw new Error('No match for variant "' + key + '" (' + (typeof key) + ' type)' + ' in variants [' + qx.Bootstrap.keys(values) + '] found, and no default ("default") given');
      };
    },
    /**
     * Takes a given map containing the check names as keys and converts
     * the map to an array only containing the values for check evaluating
     * to <code>true</code>. This is especially handy for conditional
     * includes of mixins.
     * @param map {Map} A map containing check names as keys and values.
     * @return {Array} An array containing the values.
     */
    filter : function(map){

      var returnArray = [];
      for(var check in map){

        if(this.get(check)){

          returnArray.push(map[check]);
        };
      };
      return returnArray;
    },
    /**
     * Invalidates the cache for the given key.
     *
     * @param key {String} The key of the check.
     */
    invalidateCacheKey : function(key){

      delete this.__d[key];
    },
    /**
     * Add a check to the environment class. If there is already a check
     * added for the given key, the add will be ignored.
     *
     * @param key {String} The key for the check e.g. html.featurexyz.
     * @param check {var} It could be either a function or a simple value.
     *   The function should be responsible for the check and should return the
     *   result of the check.
     */
    add : function(key, check){

      // ignore already added checks.
      if(this._checks[key] == undefined){

        // add functions directly
        if(check instanceof Function){

          this._checks[key] = check;
        } else {

          this._checks[key] = this.__h(check);
        };
      };
    },
    /**
     * Adds an asynchronous check to the environment. If there is already a check
     * added for the given key, the add will be ignored.
     *
     * @param key {String} The key of the check e.g. html.featureabc
     * @param check {Function} A function which should check for a specific
     *   environment setting in an asynchronous way. The method should take two
     *   arguments. First one is the callback and the second one is the context.
     */
    addAsync : function(key, check){

      if(this._checks[key] == undefined){

        this._asyncChecks[key] = check;
      };
    },
    /**
     * Returns all currently defined synchronous checks.
     *
     * @internal
     * @return {Map} The map of synchronous checks
     */
    getChecks : function(){

      return this._checks;
    },
    /**
     * Returns all currently defined asynchronous checks.
     *
     * @internal
     * @return {Map} The map of asynchronous checks
     */
    getAsyncChecks : function(){

      return this._asyncChecks;
    },
    /**
     * Initializer for the default values of the framework settings.
     */
    _initDefaultQxValues : function(){

      // an always-true key (e.g. for use in qx.core.Environment.filter() calls)
      this.add("true", function(){

        return true;
      });
      // old settings
      this.add("qx.allowUrlSettings", function(){

        return false;
      });
      this.add("qx.allowUrlVariants", function(){

        return false;
      });
      this.add("qx.debug.property.level", function(){

        return 0;
      });
      // old variants
      // make sure to reflect all changes to qx.debug here in the bootstrap class!
      this.add("qx.debug", function(){

        return true;
      });
      this.add("qx.debug.ui.queue", function(){

        return true;
      });
      this.add("qx.aspects", function(){

        return false;
      });
      this.add("qx.dynlocale", function(){

        return true;
      });
      this.add("qx.dyntheme", function(){

        return true;
      });
      this.add("qx.mobile.emulatetouch", function(){

        return false;
      });
      this.add("qx.emulatemouse", function(){

        return false;
      });
      this.add("qx.blankpage", function(){

        return "qx/static/blank.html";
      });
      this.add("qx.dynamicmousewheel", function(){

        return true;
      });
      this.add("qx.debug.databinding", function(){

        return false;
      });
      this.add("qx.debug.dispose", function(){

        return false;
      });
      // generator optimization vectors
      this.add("qx.optimization.basecalls", function(){

        return false;
      });
      this.add("qx.optimization.comments", function(){

        return false;
      });
      this.add("qx.optimization.privates", function(){

        return false;
      });
      this.add("qx.optimization.strings", function(){

        return false;
      });
      this.add("qx.optimization.variables", function(){

        return false;
      });
      this.add("qx.optimization.variants", function(){

        return false;
      });
      // qooxdoo modules
      this.add("module.databinding", function(){

        return true;
      });
      this.add("module.logger", function(){

        return true;
      });
      this.add("module.property", function(){

        return true;
      });
      this.add("module.events", function(){

        return true;
      });
      this.add("qx.nativeScrollBars", function(){

        return false;
      });
    },
    /**
     * Import checks from global qx.$$environment into the Environment class.
     */
    __f : function(){

      // import the environment map
      if(qx && qx.$$environment){

        for(var key in qx.$$environment){

          var value = qx.$$environment[key];
          this._checks[key] = this.__h(value);
        };
      };
    },
    /**
     * Checks the URL for environment settings and imports these into the
     * Environment class.
     */
    __g : function(){

      if(window.document && window.document.location){

        var urlChecks = window.document.location.search.slice(1).split("&");
        for(var i = 0;i < urlChecks.length;i++){

          var check = urlChecks[i].split(":");
          if(check.length != 3 || check[0] != "qxenv"){

            continue;
          };
          var key = check[1];
          var value = decodeURIComponent(check[2]);
          // implicit type conversion
          if(value == "true"){

            value = true;
          } else if(value == "false"){

            value = false;
          } else if(/^(\d|\.)+$/.test(value)){

            value = parseFloat(value);
          };;
          this._checks[key] = this.__h(value);
        };
      };
    },
    /**
     * Internal helper which creates a function returning the given value.
     *
     * @param value {var} The value which should be returned.
     * @return {Function} A function which could be used by a test.
     */
    __h : function(value){

      return qx.Bootstrap.bind(function(value){

        return value;
      }, null, value);
    }
  },
  defer : function(statics){

    // create default values for the environment class
    statics._initDefaultQxValues();
    // load the checks from the generator
    statics.__f();
    // load the checks from the url
    if(statics.get("qx.allowUrlSettings") === true){

      statics.__g();
    };
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * The main purpose of this class to hold all checks about ECMAScript.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.EcmaScript", {
  statics : {
    /**
     * Returns the name of the Error object property that holds stack trace
     * information or null if the client does not provide any.
     *
     * @internal
     * @return {String|null} <code>stack</code>, <code>stacktrace</code> or
     * <code>null</code>
     */
    getStackTrace : function(){

      var propName;
      var e = new Error("e");
      propName = e.stack ? "stack" : e.stacktrace ? "stacktrace" : null;
      // only thrown errors have the stack property in IE10 and PhantomJS
      if(!propName){

        try{

          throw e;
        } catch(ex) {

          e = ex;
        };
      };
      return e.stacktrace ? "stacktrace" : e.stack ? "stack" : null;
    },
    /**
     * Checks if 'indexOf' is supported on the Array object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getArrayIndexOf : function(){

      return !!Array.prototype.indexOf;
    },
    /**
     * Checks if 'lastIndexOf' is supported on the Array object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getArrayLastIndexOf : function(){

      return !!Array.prototype.lastIndexOf;
    },
    /**
     * Checks if 'forEach' is supported on the Array object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getArrayForEach : function(){

      return !!Array.prototype.forEach;
    },
    /**
     * Checks if 'filter' is supported on the Array object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getArrayFilter : function(){

      return !!Array.prototype.filter;
    },
    /**
     * Checks if 'map' is supported on the Array object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getArrayMap : function(){

      return !!Array.prototype.map;
    },
    /**
     * Checks if 'some' is supported on the Array object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getArraySome : function(){

      return !!Array.prototype.some;
    },
    /**
     * Checks if 'every' is supported on the Array object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getArrayEvery : function(){

      return !!Array.prototype.every;
    },
    /**
     * Checks if 'reduce' is supported on the Array object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getArrayReduce : function(){

      return !!Array.prototype.reduce;
    },
    /**
     * Checks if 'reduceRight' is supported on the Array object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getArrayReduceRight : function(){

      return !!Array.prototype.reduceRight;
    },
    /**
     * Checks if 'toString' is supported on the Error object and
     * its working as expected.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getErrorToString : function(){

      return typeof Error.prototype.toString == "function" && Error.prototype.toString() !== "[object Error]";
    },
    /**
     * Checks if 'bind' is supported on the Function object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getFunctionBind : function(){

      return typeof Function.prototype.bind === "function";
    },
    /**
     * Checks if 'keys' is supported on the Object object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getObjectKeys : function(){

      return !!Object.keys;
    },
    /**
     * Checks if 'now' is supported on the Date object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getDateNow : function(){

      return !!Date.now;
    },
    /**
     * Checks if 'trim' is supported on the String object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getStringTrim : function(){

      return typeof String.prototype.trim === "function";
    }
  },
  defer : function(statics){

    // array polyfill
    qx.core.Environment.add("ecmascript.array.indexof", statics.getArrayIndexOf);
    qx.core.Environment.add("ecmascript.array.lastindexof", statics.getArrayLastIndexOf);
    qx.core.Environment.add("ecmascript.array.foreach", statics.getArrayForEach);
    qx.core.Environment.add("ecmascript.array.filter", statics.getArrayFilter);
    qx.core.Environment.add("ecmascript.array.map", statics.getArrayMap);
    qx.core.Environment.add("ecmascript.array.some", statics.getArraySome);
    qx.core.Environment.add("ecmascript.array.every", statics.getArrayEvery);
    qx.core.Environment.add("ecmascript.array.reduce", statics.getArrayReduce);
    qx.core.Environment.add("ecmascript.array.reduceright", statics.getArrayReduceRight);
    // date polyfill
    qx.core.Environment.add("ecmascript.date.now", statics.getDateNow);
    // error bugfix
    qx.core.Environment.add("ecmascript.error.toString", statics.getErrorToString);
    qx.core.Environment.add("ecmascript.error.stacktrace", statics.getStackTrace);
    // function polyfill
    qx.core.Environment.add("ecmascript.function.bind", statics.getFunctionBind);
    // object polyfill
    qx.core.Environment.add("ecmascript.object.keys", statics.getObjectKeys);
    // string polyfill
    qx.core.Environment.add("ecmascript.string.trim", statics.getStringTrim);
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

   ======================================================================

   This class contains code based on the following work:

   * es5-shim

     Code:
       https://github.com/kriskowal/es5-shim/

     Copyright:
       (c) 2009, 2010 Kristopher Michael Kowal

     License:
       https://github.com/kriskowal/es5-shim/blob/master/LICENSE

   ----------------------------------------------------------------------

   Copyright 2009, 2010 Kristopher Michael Kowal. All rights reserved.
   Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to
   deal in the Software without restriction, including without limitation the
   rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
   sell copies of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:

   The above copyright notice and this permission notice shall be included in
   all copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
   IN THE SOFTWARE.

   ----------------------------------------------------------------------

   Version:
     Snapshot taken on 2012-07-25,:
     commit  9f539abd9aa9950e1d907077a4be7f5133a00e52

************************************************************************ */
/**
 * This class takes care of the normalization of the native 'Function' object.
 * Therefore it checks the availability of the following methods and appends
 * it, if not available. This means you can use the methods during
 * development in every browser. For usage samples, check out the attached links.
 *
 * *bind*:
 * <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.3.4.5">Annotated ES5 Spec</a>
 *
 * Example for the <code>bind</code> method:
 * <pre class='javascript'>
 * // sample code, assumes the used variables are already defined
 *
 * // the listener method demonstrates how to pass dynamic values
 * // to a method using 'bind'
 * var changeValueListener = function(value, event) {
 *   // value is passed by the 'bind' method: its value is 'myArray[i]'
 *   // second argument is passed by the 'on' method: its value is a event object
 *   // 'this' is pointing to 'myComponent', since the first argument of 'bind' defines the context of the function call
 * };
 * var myArray = [ 0, 2, 4, 6 ];
 * for (var i=0, j=myArray.length; i&lt;j; i++) {
 *   myComponent.on("changeValue", changeValueListener.bind(myComponent, myArray[i]));
 * }
 * </pre>
 *
 * @group (Polyfill)
 */
qx.Bootstrap.define("qx.lang.normalize.Function", {
  defer : function(){

    // bind
    if(!qx.core.Environment.get("ecmascript.function.bind")){

      var slice = Array.prototype.slice;
      Function.prototype.bind = function(that){

        // .length is 1
        // 1. Let Target be the this value.
        var target = this;
        // 2. If IsCallable(Target) is false, throw a TypeError exception.
        if(typeof target != "function"){

          throw new TypeError("Function.prototype.bind called on incompatible " + target);
        };
        // 3. Let A be a new (possibly empty) internal list of all of the
        //   argument values provided after thisArg (arg1, arg2 etc), in order.
        // XXX slicedArgs will stand in for "A" if used
        var args = slice.call(arguments, 1);
        // for normal call
        // 4. Let F be a new native ECMAScript object.
        // 11. Set the [[Prototype]] internal property of F to the standard
        //   built-in Function prototype object as specified in 15.3.3.1.
        // 12. Set the [[Call]] internal property of F as described in
        //   15.3.4.5.1.
        // 13. Set the [[Construct]] internal property of F as described in
        //   15.3.4.5.2.
        // 14. Set the [[HasInstance]] internal property of F as described in
        //   15.3.4.5.3.
        var bound = function(){

          if(this instanceof bound){

            // 15.3.4.5.2 [[Construct]]
            // When the [[Construct]] internal method of a function object,
            // F that was created using the bind function is called with a
            // list of arguments ExtraArgs, the following steps are taken:
            // 1. Let target be the value of F's [[TargetFunction]]
            //   internal property.
            // 2. If target has no [[Construct]] internal method, a
            //   TypeError exception is thrown.
            // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
            //   property.
            // 4. Let args be a new list containing the same values as the
            //   list boundArgs in the same order followed by the same
            //   values as the list ExtraArgs in the same order.
            // 5. Return the result of calling the [[Construct]] internal
            //   method of target providing args as the arguments.
            var F = function(){
            };
            F.prototype = target.prototype;
            var self = new F;
            var result = target.apply(self, args.concat(slice.call(arguments)));
            if(Object(result) === result){

              return result;
            };
            return self;
          } else {

            // 15.3.4.5.1 [[Call]]
            // When the [[Call]] internal method of a function object, F,
            // which was created using the bind function is called with a
            // this value and a list of arguments ExtraArgs, the following
            // steps are taken:
            // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
            //   property.
            // 2. Let boundThis be the value of F's [[BoundThis]] internal
            //   property.
            // 3. Let target be the value of F's [[TargetFunction]] internal
            //   property.
            // 4. Let args be a new list containing the same values as the
            //   list boundArgs in the same order followed by the same
            //   values as the list ExtraArgs in the same order.
            // 5. Return the result of calling the [[Call]] internal method
            //   of target providing boundThis as the this value and
            //   providing args as the arguments.
            // equiv: target.call(this, ...boundArgs, ...args)
            return target.apply(that, args.concat(slice.call(arguments)));
          };
        };
        // XXX bound.length is never writable, so don't even try
        //
        // 15. If the [[Class]] internal property of Target is "Function", then
        //     a. Let L be the length property of Target minus the length of A.
        //     b. Set the length own property of F to either 0 or L, whichever is
        //       larger.
        // 16. Else set the length own property of F to 0.
        // 17. Set the attributes of the length own property of F to the values
        //   specified in 15.3.5.1.
        // (Not implemented but in the spec)
        // 18. Set the [[Extensible]] internal property of F to true.
        // (Not implemented but in the spec)
        // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
        // 20. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
        //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
        //   false.
        // 21. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
        //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
        //   and false.
        // NOTE Function objects created using Function.prototype.bind do not
        // have a prototype property or the [[Code]], [[FormalParameters]], and
        // [[Scope]] internal properties.
        // XXX can't delete prototype in pure-js.
        // 22. Return F.
        return bound;
      };
    };
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/**
 * This class takes care of the normalization of the native 'Array' object.
 * Therefore it checks the availability of the following methods and appends
 * it, if not available. This means you can use the methods during
 * development in every browser. For usage samples, check out the attached links.
 *
 * *indexOf*:
 * <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.4.4.14">Annotated ES5 Spec</a>
 *
 * *lastIndexOf*:
 * <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/lastIndexOf">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.4.4.15">Annotated ES5 Spec</a>
 *
 * *forEach*:
 * <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/forEach">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.4.4.18">Annotated ES5 Spec</a>
 *
 * *filter*:
 * <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/filter">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.4.4.20">Annotated ES5 Spec</a>
 *
 * *map*:
 * <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/map">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.4.4.19">Annotated ES5 Spec</a>
 *
 * *some*:
 * <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/some">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.4.4.17">Annotated ES5 Spec</a>
 *
 * *every*:
 * <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/every">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.4.4.16">Annotated ES5 Spec</a>
 *
 * *reduce*:
 * <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/reduce">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.4.4.21">Annotated ES5 Spec</a>
 *
 * *reduceRight*:
 * <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/reduceRight">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.4.4.22">Annotated ES5 Spec</a>
 *
 * Here is a little sample of how to use <code>indexOf</code> e.g.
 * <pre class="javascript">var a = ["a", "b", "c"];
 * a.indexOf("b"); // returns 1</pre>
 *
 * @group (Polyfill)
 */
qx.Bootstrap.define("qx.lang.normalize.Array", {
  defer : function(){

    // fix indexOf
    if(!qx.core.Environment.get("ecmascript.array.indexof")){

      Array.prototype.indexOf = function(searchElement, fromIndex){

        if(fromIndex == null){

          fromIndex = 0;
        } else if(fromIndex < 0){

          fromIndex = Math.max(0, this.length + fromIndex);
        };
        for(var i = fromIndex;i < this.length;i++){

          if(this[i] === searchElement){

            return i;
          };
        };
        return -1;
      };
    };
    // lastIndexOf
    if(!qx.core.Environment.get("ecmascript.array.lastindexof")){

      Array.prototype.lastIndexOf = function(searchElement, fromIndex){

        if(fromIndex == null){

          fromIndex = this.length - 1;
        } else if(fromIndex < 0){

          fromIndex = Math.max(0, this.length + fromIndex);
        };
        for(var i = fromIndex;i >= 0;i--){

          if(this[i] === searchElement){

            return i;
          };
        };
        return -1;
      };
    };
    // forEach
    if(!qx.core.Environment.get("ecmascript.array.foreach")){

      Array.prototype.forEach = function(callback, obj){

        var l = this.length;
        for(var i = 0;i < l;i++){

          var value = this[i];
          if(value !== undefined){

            callback.call(obj || window, value, i, this);
          };
        };
      };
    };
    // filter
    if(!qx.core.Environment.get("ecmascript.array.filter")){

      Array.prototype.filter = function(callback, obj){

        var res = [];
        var l = this.length;
        for(var i = 0;i < l;i++){

          var value = this[i];
          if(value !== undefined){

            if(callback.call(obj || window, value, i, this)){

              res.push(this[i]);
            };
          };
        };
        return res;
      };
    };
    // map
    if(!qx.core.Environment.get("ecmascript.array.map")){

      Array.prototype.map = function(callback, obj){

        var res = [];
        var l = this.length;
        for(var i = 0;i < l;i++){

          var value = this[i];
          if(value !== undefined){

            res[i] = callback.call(obj || window, value, i, this);
          };
        };
        return res;
      };
    };
    // some
    if(!qx.core.Environment.get("ecmascript.array.some")){

      Array.prototype.some = function(callback, obj){

        var l = this.length;
        for(var i = 0;i < l;i++){

          var value = this[i];
          if(value !== undefined){

            if(callback.call(obj || window, value, i, this)){

              return true;
            };
          };
        };
        return false;
      };
    };
    // every
    if(!qx.core.Environment.get("ecmascript.array.every")){

      Array.prototype.every = function(callback, obj){

        var l = this.length;
        for(var i = 0;i < l;i++){

          var value = this[i];
          if(value !== undefined){

            if(!callback.call(obj || window, value, i, this)){

              return false;
            };
          };
        };
        return true;
      };
    };
    // reduce
    if(!qx.core.Environment.get("ecmascript.array.reduce")){

      Array.prototype.reduce = function(callback, init){

        if(typeof callback !== "function"){

          throw new TypeError("First argument is not callable");
        };
        if(init === undefined && this.length === 0){

          throw new TypeError("Length is 0 and no second argument given");
        };
        var ret = init === undefined ? this[0] : init;
        for(var i = init === undefined ? 1 : 0;i < this.length;i++){

          if(i in this){

            ret = callback.call(undefined, ret, this[i], i, this);
          };
        };
        return ret;
      };
    };
    // reduceRight
    if(!qx.core.Environment.get("ecmascript.array.reduceright")){

      Array.prototype.reduceRight = function(callback, init){

        if(typeof callback !== "function"){

          throw new TypeError("First argument is not callable");
        };
        if(init === undefined && this.length === 0){

          throw new TypeError("Length is 0 and no second argument given");
        };
        var ret = init === undefined ? this[this.length - 1] : init;
        for(var i = init === undefined ? this.length - 2 : this.length - 1;i >= 0;i--){

          if(i in this){

            ret = callback.call(undefined, ret, this[i], i, this);
          };
        };
        return ret;
      };
    };
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */
/**
 * This class is used to define mixins (similar to mixins in Ruby).
 *
 * Mixins are collections of code and variables, which can be merged into
 * other classes. They are similar to classes but don't support inheritance.
 *
 * See the description of the {@link #define} method how a mixin is defined.
 *
 * @require(qx.lang.normalize.Array)
 */
qx.Bootstrap.define("qx.Mixin", {
  statics : {
    /*
    ---------------------------------------------------------------------------
       PUBLIC API
    ---------------------------------------------------------------------------
    */
    /**
     * Define a new mixin.
     *
     * Example:
     * <pre class='javascript'>
     * qx.Mixin.define("name",
     * {
     *   include: [SuperMixins],
     *
     *   properties: {
     *     tabIndex: {type: "number", init: -1}
     *   },
     *
     *   members:
     *   {
     *     prop1: "foo",
     *     meth1: function() {},
     *     meth2: function() {}
     *   }
     * });
     * </pre>
     *
     * @param name {String} name of the mixin
     * @param config {Map ? null} Mixin definition structure. The configuration map has the following keys:
     *   <table>
     *     <tr><th>Name</th><th>Type</th><th>Description</th></tr>
     *     <tr><th>construct</th><td>Function</td><td>An optional mixin constructor. It is called on instantiation each
     *         class including this mixin. The constructor takes no parameters.</td></tr>
     *     <tr><th>destruct</th><td>Function</td><td>An optional mixin destructor.</td></tr>
     *     <tr><th>include</th><td>Mixin[]</td><td>Array of mixins, which will be merged into the mixin.</td></tr>
     *     <tr><th>statics</th><td>Map</td><td>
     *         Map of statics of the mixin. The statics will not get copied into the target class. They remain
     *         accessible from the mixin. This is the same behaviour as statics in interfaces ({@link qx.Interface#define}).
     *     </td></tr>
     *     <tr><th>members</th><td>Map</td><td>Map of members of the mixin.</td></tr>
     *     <tr><th>properties</th><td>Map</td><td>Map of property definitions. For a description of the format of a property definition see
     *           {@link qx.core.Property}.</td></tr>
     *     <tr><th>events</th><td>Map</td><td>
     *         Map of events the mixin fires. The keys are the names of the events and the values are
     *         corresponding event type classes.
     *     </td></tr>
     *   </table>
     *
     * @return {qx.Mixin} The configured mixin
     */
    define : function(name, config){

      if(config){

        // Normalize include
        if(config.include && !(qx.Bootstrap.getClass(config.include) === "Array")){

          config.include = [config.include];
        };
        // Validate incoming data
        if(qx.core.Environment.get("qx.debug")){

          this.__j(name, config);
        };
        // Create Interface from statics
        var mixin = config.statics ? config.statics : {
        };
        qx.Bootstrap.setDisplayNames(mixin, name);
        for(var key in mixin){

          if(mixin[key] instanceof Function){

            mixin[key].$$mixin = mixin;
          };
        };
        // Attach configuration
        if(config.construct){

          mixin.$$constructor = config.construct;
          qx.Bootstrap.setDisplayName(config.construct, name, "constructor");
        };
        if(config.include){

          mixin.$$includes = config.include;
        };
        if(config.properties){

          mixin.$$properties = config.properties;
        };
        if(config.members){

          mixin.$$members = config.members;
          qx.Bootstrap.setDisplayNames(config.members, name + ".prototype");
        };
        for(var key in mixin.$$members){

          if(mixin.$$members[key] instanceof Function){

            mixin.$$members[key].$$mixin = mixin;
          };
        };
        if(config.events){

          mixin.$$events = config.events;
        };
        if(config.destruct){

          mixin.$$destructor = config.destruct;
          qx.Bootstrap.setDisplayName(config.destruct, name, "destruct");
        };
      } else {

        var mixin = {
        };
      };
      // Add basics
      mixin.$$type = "Mixin";
      mixin.name = name;
      // Attach toString
      mixin.toString = this.genericToString;
      // Assign to namespace
      mixin.basename = qx.Bootstrap.createNamespace(name, mixin);
      // Store class reference in global mixin registry
      this.$$registry[name] = mixin;
      // Return final mixin
      return mixin;
    },
    /**
     * Check compatibility between mixins (including their includes)
     *
     * @param mixins {Mixin[]} an array of mixins
     * @throws {Error} when there is a conflict between the mixins
     * @return {Boolean} <code>true</code> if the mixin passed the compatibilty check
     */
    checkCompatibility : function(mixins){

      var list = this.flatten(mixins);
      var len = list.length;
      if(len < 2){

        return true;
      };
      var properties = {
      };
      var members = {
      };
      var events = {
      };
      var mixin;
      for(var i = 0;i < len;i++){

        mixin = list[i];
        for(var key in mixin.events){

          if(events[key]){

            throw new Error('Conflict between mixin "' + mixin.name + '" and "' + events[key] + '" in member "' + key + '"!');
          };
          events[key] = mixin.name;
        };
        for(var key in mixin.properties){

          if(properties[key]){

            throw new Error('Conflict between mixin "' + mixin.name + '" and "' + properties[key] + '" in property "' + key + '"!');
          };
          properties[key] = mixin.name;
        };
        for(var key in mixin.members){

          if(members[key]){

            throw new Error('Conflict between mixin "' + mixin.name + '" and "' + members[key] + '" in member "' + key + '"!');
          };
          members[key] = mixin.name;
        };
      };
      return true;
    },
    /**
     * Checks if a class is compatible to the given mixin (no conflicts)
     *
     * @param mixin {Mixin} mixin to check
     * @param clazz {Class} class to check
     * @throws {Error} when the given mixin is incompatible to the class
     * @return {Boolean} true if the mixin is compatible to the given class
     */
    isCompatible : function(mixin, clazz){

      var list = qx.util.OOUtil.getMixins(clazz);
      list.push(mixin);
      return qx.Mixin.checkCompatibility(list);
    },
    /**
     * Returns a mixin by name
     *
     * @param name {String} class name to resolve
     * @return {Class} the class
     */
    getByName : function(name){

      return this.$$registry[name];
    },
    /**
     * Determine if mixin exists
     *
     * @param name {String} mixin name to check
     * @return {Boolean} true if mixin exists
     */
    isDefined : function(name){

      return this.getByName(name) !== undefined;
    },
    /**
     * Determine the number of mixins which are defined
     *
     * @return {Number} the number of mixins
     */
    getTotalNumber : function(){

      return qx.Bootstrap.objectGetLength(this.$$registry);
    },
    /**
     * Generates a list of all mixins given plus all the
     * mixins these includes plus... (deep)
     *
     * @param mixins {Mixin[] ? []} List of mixins
     * @return {Array} List of all mixins
     */
    flatten : function(mixins){

      if(!mixins){

        return [];
      };
      // we need to create a copy and not to modify the existing array
      var list = mixins.concat();
      for(var i = 0,l = mixins.length;i < l;i++){

        if(mixins[i].$$includes){

          list.push.apply(list, this.flatten(mixins[i].$$includes));
        };
      };
      return list;
    },
    /*
    ---------------------------------------------------------------------------
       PRIVATE/INTERNAL API
    ---------------------------------------------------------------------------
    */
    /**
     * This method will be attached to all mixins to return
     * a nice identifier for them.
     *
     * @internal
     * @return {String} The mixin identifier
     */
    genericToString : function(){

      return "[Mixin " + this.name + "]";
    },
    /** Registers all defined mixins */
    $$registry : {
    },
    /** @type {Map} allowed keys in mixin definition */
    __i : qx.core.Environment.select("qx.debug", {
      "true" : {
        "include" : "object",
        // Mixin | Mixin[]
        "statics" : "object",
        // Map
        "members" : "object",
        // Map
        "properties" : "object",
        // Map
        "events" : "object",
        // Map
        "destruct" : "function",
        // Function
        "construct" : "function"
      },
      "default" : null
    }),
    /**
     * Validates incoming configuration and checks keys and values
     *
     * @signature function(name, config)
     * @param name {String} The name of the class
     * @param config {Map} Configuration map
     */
    __j : qx.core.Environment.select("qx.debug", {
      "true" : function(name, config){

        // Validate keys
        var allowed = this.__i;
        for(var key in config){

          if(!allowed[key]){

            throw new Error('The configuration key "' + key + '" in mixin "' + name + '" is not allowed!');
          };
          if(config[key] == null){

            throw new Error('Invalid key "' + key + '" in mixin "' + name + '"! The value is undefined/null!');
          };
          if(allowed[key] !== null && typeof config[key] !== allowed[key]){

            throw new Error('Invalid type of key "' + key + '" in mixin "' + name + '"! The type of the key must be "' + allowed[key] + '"!');
          };
        };
        // Validate maps
        var maps = ["statics", "members", "properties", "events"];
        for(var i = 0,l = maps.length;i < l;i++){

          var key = maps[i];
          if(config[key] !== undefined && (["Array", "RegExp", "Date"].indexOf(qx.Bootstrap.getClass(config[key])) != -1 || config[key].classname !== undefined)){

            throw new Error('Invalid key "' + key + '" in mixin "' + name + '"! The value needs to be a map!');
          };
        };
        // Validate includes
        if(config.include){

          for(var i = 0,a = config.include,l = a.length;i < l;i++){

            if(a[i] == null){

              throw new Error("Includes of mixins must be mixins. The include number '" + (i + 1) + "' in mixin '" + name + "'is undefined/null!");
            };
            if(a[i].$$type !== "Mixin"){

              throw new Error("Includes of mixins must be mixins. The include number '" + (i + 1) + "' in mixin '" + name + "'is not a mixin!");
            };
          };
          this.checkCompatibility(config.include);
        };
      },
      "default" : function(name, config){
      }
    })
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Andreas Ecker (ecker)

************************************************************************ */
/**
 * Basis for Aspect Oriented features in qooxdoo.
 *
 * This class makes it possible to attach functions (aspects) before or
 * after each function call of any function defined in {@link qx.Class#define}.
 *
 * Classes, which define own aspects must add an explicit require to this class
 * in the header comment using the following code:
 *
 * <pre>
 * &#35;require(qx.core.Aspect)
 * &#35;ignore(auto-require)
 * </pre>
 *
 * One example for a qooxdoo aspect is profiling ({@link qx.dev.Profile}).
 */
qx.Bootstrap.define("qx.core.Aspect", {
  statics : {
    /** @type {Array} Registry for all known aspect wishes */
    __k : [],
    /**
     * This function is used by {@link qx.Class#define} to wrap all statics, members and
     * constructors.
     *
     * @param fullName {String} Full name of the function including the class name.
     * @param fcn {Function} function to wrap.
     * @param type {String} Type of the wrapped function. One of "member", "static",
     *          "constructor", "destructor" or "property".
     *
     * @return {Function} wrapped function
     */
    wrap : function(fullName, fcn, type){

      var before = [];
      var after = [];
      var reg = this.__k;
      var entry;
      for(var i = 0;i < reg.length;i++){

        entry = reg[i];
        if((entry.type == null || type == entry.type || entry.type == "*") && (entry.name == null || fullName.match(entry.name))){

          entry.pos == -1 ? before.push(entry.fcn) : after.push(entry.fcn);
        };
      };
      if(before.length === 0 && after.length === 0){

        return fcn;
      };
      var wrapper = function(){

        for(var i = 0;i < before.length;i++){

          before[i].call(this, fullName, fcn, type, arguments);
        };
        var ret = fcn.apply(this, arguments);
        for(var i = 0;i < after.length;i++){

          after[i].call(this, fullName, fcn, type, arguments, ret);
        };
        return ret;
      };
      if(type !== "static"){

        wrapper.self = fcn.self;
        wrapper.base = fcn.base;
      };
      fcn.wrapper = wrapper;
      wrapper.original = fcn;
      return wrapper;
    },
    /**
     * Register a function to be called just before or after each time
     * one of the selected functions is called.
     *
     * @param fcn {Function} Function to be called just before or after any of the
     *     selected functions is called. If position is "before" the functions
     *     supports the same signature as {@link qx.dev.Profile#profileBefore}. If
     *     position is "after" it supports the same signature as
     *     {@link qx.dev.Profile#profileAfter}.
     * @param position {String?"after"} One of "before" or "after". Whether the function
     *     should be called before or after the wrapped function.
     * @param type {String?null} Type of the wrapped function. One of "member",
     *     "static", "constructor", "destructor", "property" or "*". <code>null</code>
     *     is handled identical to "*".
     * @param name {String|RegExp?null} Each function, with a full name matching
     *     this pattern (using <code>fullName.match(name)</code>) will be
     *     wrapped.
     */
    addAdvice : function(fcn, position, type, name){

      this.__k.push({
        fcn : fcn,
        pos : position === "before" ? -1 : 1,
        type : type,
        name : name
      });
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/**
 * This class takes care of the normalization of the native 'String' object.
 * Therefore it checks the availability of the following methods and appends
 * it, if not available. This means you can use the methods during
 * development in every browser. For usage samples, check out the attached links.
 *
 * *trim*:
 * <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/Trim">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.5.4.20">Annotated ES5 Spec</a>
 *
 * @group (Polyfill)
 */
qx.Bootstrap.define("qx.lang.normalize.String", {
  defer : function(){

    // trim
    if(!qx.core.Environment.get("ecmascript.string.trim")){

      String.prototype.trim = function(context){

        return this.replace(/^\s+|\s+$/g, '');
      };
    };
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/**
 * This class takes care of the normalization of the native 'Object' object.
 * Therefore it checks the availability of the following methods and appends
 * it, if not available. This means you can use the methods during
 * development in every browser. For usage samples, check out the attached links.
 *
 * *keys*:
 * <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/keys">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.2.3.14">Annotated ES5 Spec</a>
 *
 * @group (Polyfill)
 */
qx.Bootstrap.define("qx.lang.normalize.Object", {
  defer : function(){

    // keys
    if(!qx.core.Environment.get("ecmascript.object.keys")){

      Object.keys = qx.Bootstrap.keys;
    };
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */
/**
 * This class is used to define interfaces (similar to Java interfaces).
 *
 * See the description of the {@link #define} method how an interface is
 * defined.
 *
 * @require(qx.lang.normalize.Array)
 */
qx.Bootstrap.define("qx.Interface", {
  statics : {
    /*
    ---------------------------------------------------------------------------
       PUBLIC API
    ---------------------------------------------------------------------------
    */
    /**
     * Define a new interface. Interface definitions look much like class definitions.
     *
     * The main difference is that the bodies of functions defined in <code>members</code>
     * and <code>statics</code> are called before the original function with the
     * same arguments. This can be used to check the passed arguments. If the
     * checks fail, an exception should be thrown. It is convenient to use the
     * method defined in {@link qx.core.MAssert} to check the arguments.
     *
     * In the <code>build</code> version the checks are omitted.
     *
     * For properties only the names are required so the value of the properties
     * can be empty maps.
     *
     * Example:
     * <pre class='javascript'>
     * qx.Interface.define("name",
     * {
     *   extend: [SuperInterfaces],
     *
     *   statics:
     *   {
     *     PI : 3.14
     *   },
     *
     *   properties: {"color": {}, "name": {} },
     *
     *   members:
     *   {
     *     meth1: function() {},
     *     meth2: function(a, b) { this.assertArgumentsCount(arguments, 2, 2); },
     *     meth3: function(c) { this.assertInterface(c.constructor, qx.some.Interface); }
     *   },
     *
     *   events :
     *   {
     *     keydown : "qx.event.type.KeySequence"
     *   }
     * });
     * </pre>
     *
     * @param name {String} name of the interface
     * @param config {Map ? null} Interface definition structure. The configuration map has the following keys:
     *   <table>
     *     <tr><th>Name</th><th>Type</th><th>Description</th></tr>
     *     <tr><th>extend</th><td>Interface |<br>Interface[]</td><td>Single interface or array of interfaces this interface inherits from.</td></tr>
     *     <tr><th>members</th><td>Map</td><td>Map of members of the interface.</td></tr>
     *     <tr><th>statics</th><td>Map</td><td>
     *         Map of statics of the interface. The statics will not get copied into the target class.
     *         This is the same behaviour as statics in mixins ({@link qx.Mixin#define}).
     *     </td></tr>
     *     <tr><th>properties</th><td>Map</td><td>Map of properties and their definitions.</td></tr>
     *     <tr><th>events</th><td>Map</td><td>Map of event names and the corresponding event class name.</td></tr>
     *   </table>
     *
     * @return {qx.Interface} The configured interface
     */
    define : function(name, config){

      if(config){

        // Normalize include
        if(config.extend && !(qx.Bootstrap.getClass(config.extend) === "Array")){

          config.extend = [config.extend];
        };
        // Validate incoming data
        if(qx.core.Environment.get("qx.debug")){

          this.__j(name, config);
        };
        // Create interface from statics
        var iface = config.statics ? config.statics : {
        };
        // Attach configuration
        if(config.extend){

          iface.$$extends = config.extend;
        };
        if(config.properties){

          iface.$$properties = config.properties;
        };
        if(config.members){

          iface.$$members = config.members;
        };
        if(config.events){

          iface.$$events = config.events;
        };
      } else {

        // Create empty interface
        var iface = {
        };
      };
      // Add Basics
      iface.$$type = "Interface";
      iface.name = name;
      // Attach toString
      iface.toString = this.genericToString;
      // Assign to namespace
      iface.basename = qx.Bootstrap.createNamespace(name, iface);
      // Add to registry
      qx.Interface.$$registry[name] = iface;
      // Return final interface
      return iface;
    },
    /**
     * Returns an interface by name
     *
     * @param name {String} class name to resolve
     * @return {Class} the class
     */
    getByName : function(name){

      return this.$$registry[name];
    },
    /**
     * Determine if interface exists
     *
     * @param name {String} Interface name to check
     * @return {Boolean} true if interface exists
     */
    isDefined : function(name){

      return this.getByName(name) !== undefined;
    },
    /**
     * Determine the number of interfaces which are defined
     *
     * @return {Number} the number of interfaces
     */
    getTotalNumber : function(){

      return qx.Bootstrap.objectGetLength(this.$$registry);
    },
    /**
     * Generates a list of all interfaces including their super interfaces
     * (resolved recursively)
     *
     * @param ifaces {Interface[] ? []} List of interfaces to be resolved
     * @return {Array} List of all interfaces
     */
    flatten : function(ifaces){

      if(!ifaces){

        return [];
      };
      // we need to create a copy and not to modify the existing array
      var list = ifaces.concat();
      for(var i = 0,l = ifaces.length;i < l;i++){

        if(ifaces[i].$$extends){

          list.push.apply(list, this.flatten(ifaces[i].$$extends));
        };
      };
      return list;
    },
    /**
     * Assert members
     *
     * @param object {qx.core.Object} The object, which contains the methods
     * @param clazz {Class} class of the object
     * @param iface {Interface} the interface to verify
     * @param wrap {Boolean ? false} wrap functions required by interface to
     *     check parameters etc.
     * @param shouldThrow {Boolean} if <code>false</code>, the method
     *   will return a boolean instead of throwing an exception
     * @return {Boolean} <code>true</code> if all members are supported
     */
    __l : function(object, clazz, iface, wrap, shouldThrow){

      // Validate members
      var members = iface.$$members;
      if(members){

        for(var key in members){

          if(qx.Bootstrap.isFunction(members[key])){

            var isPropertyMethod = this.__m(clazz, key);
            var hasMemberFunction = isPropertyMethod || qx.Bootstrap.isFunction(object[key]);
            if(!hasMemberFunction){

              if(shouldThrow){

                throw new Error('Implementation of method "' + key + '" is missing in class "' + clazz.classname + '" required by interface "' + iface.name + '"');
              } else {

                return false;
              };
            };
            // Only wrap members if the interface was not been applied yet. This
            // can easily be checked by the recursive hasInterface method.
            var shouldWrapFunction = wrap === true && !isPropertyMethod && !qx.util.OOUtil.hasInterface(clazz, iface);
            if(shouldWrapFunction){

              object[key] = this.__p(iface, object[key], key, members[key]);
            };
          } else {

            // Other members are not checked more detailed because of
            // JavaScript's loose type handling
            if(typeof object[key] === undefined){

              if(typeof object[key] !== "function"){

                if(shouldThrow){

                  throw new Error('Implementation of member "' + key + '" is missing in class "' + clazz.classname + '" required by interface "' + iface.name + '"');
                } else {

                  return false;
                };
              };
            };
          };
        };
      };
      if(!shouldThrow){

        return true;
      };
    },
    /**
     * Internal helper to detect if the method will be generated by the
     * property system.
     *
     * @param clazz {Class} The current class.
     * @param methodName {String} The name of the method.
     *
     * @return {Boolean} true, if the method will be generated by the property
     *   system.
     */
    __m : function(clazz, methodName){

      var match = methodName.match(/^(is|toggle|get|set|reset)(.*)$/);
      if(!match){

        return false;
      };
      var propertyName = qx.Bootstrap.firstLow(match[2]);
      var isPropertyMethod = qx.util.OOUtil.getPropertyDefinition(clazz, propertyName);
      if(!isPropertyMethod){

        return false;
      };
      var isBoolean = match[0] == "is" || match[0] == "toggle";
      if(isBoolean){

        return qx.util.OOUtil.getPropertyDefinition(clazz, propertyName).check == "Boolean";
      };
      return true;
    },
    /**
     * Assert properties
     *
     * @param clazz {Class} class to check interface for
     * @param iface {Interface} the interface to verify
     * @param shouldThrow {Boolean} if <code>false</code>, the method
     *   will return a boolean instead of throwing an exception
     * @return {Boolean} <code>true</code> if all properties are supported
     */
    __n : function(clazz, iface, shouldThrow){

      if(iface.$$properties){

        for(var key in iface.$$properties){

          if(!qx.util.OOUtil.getPropertyDefinition(clazz, key)){

            if(shouldThrow){

              throw new Error('The property "' + key + '" is not supported by Class "' + clazz.classname + '"!');
            } else {

              return false;
            };
          };
        };
      };
      if(!shouldThrow){

        return true;
      };
    },
    /**
     * Assert events
     *
     * @param clazz {Class} class to check interface for
     * @param iface {Interface} the interface to verify
     * @param shouldThrow {Boolean} if <code>false</code>, the method
     *   will return a boolean instead of throwing an exception
     * @return {Boolean} <code>true</code> if all events are supported
     */
    __o : function(clazz, iface, shouldThrow){

      if(iface.$$events){

        for(var key in iface.$$events){

          if(!qx.util.OOUtil.supportsEvent(clazz, key)){

            if(shouldThrow){

              throw new Error('The event "' + key + '" is not supported by Class "' + clazz.classname + '"!');
            } else {

              return false;
            };
          };
        };
      };
      if(!shouldThrow){

        return true;
      };
    },
    /**
     * Asserts that the given object implements all the methods defined in the
     * interface. This method throws an exception if the object does not
     * implement the interface.
     *
     *  @param object {qx.core.Object} Object to check interface for
     *  @param iface {Interface} The interface to verify
     */
    assertObject : function(object, iface){

      var clazz = object.constructor;
      this.__l(object, clazz, iface, false, true);
      this.__n(clazz, iface, true);
      this.__o(clazz, iface, true);
      // Validate extends, recursive
      var extend = iface.$$extends;
      if(extend){

        for(var i = 0,l = extend.length;i < l;i++){

          this.assertObject(object, extend[i]);
        };
      };
    },
    /**
     * Checks if an interface is implemented by a class
     *
     * @param clazz {Class} class to check interface for
     * @param iface {Interface} the interface to verify
     * @param wrap {Boolean ? false} wrap functions required by interface to
     *     check parameters etc.
     */
    assert : function(clazz, iface, wrap){

      this.__l(clazz.prototype, clazz, iface, wrap, true);
      this.__n(clazz, iface, true);
      this.__o(clazz, iface, true);
      // Validate extends, recursive
      var extend = iface.$$extends;
      if(extend){

        for(var i = 0,l = extend.length;i < l;i++){

          this.assert(clazz, extend[i], wrap);
        };
      };
    },
    /**
     * Asserts that the given object implements all the methods defined in the
     * interface.
     *
     *  @param object {qx.core.Object} Object to check interface for
     *  @param iface {Interface} The interface to verify
     * @return {Boolean} <code>true</code> if the objects implements the interface
     */
    objectImplements : function(object, iface){

      var clazz = object.constructor;
      if(!this.__l(object, clazz, iface) || !this.__n(clazz, iface) || !this.__o(clazz, iface)){

        return false;
      };
      // Validate extends, recursive
      var extend = iface.$$extends;
      if(extend){

        for(var i = 0,l = extend.length;i < l;i++){

          if(!this.objectImplements(object, extend[i])){

            return false;
          };
        };
      };
      return true;
    },
    /**
     * Tests whether an interface is implemented by a class, without throwing an
     * exception when it doesn't.
     *
     * @param clazz {Class} class to check interface for
     * @param iface {Interface} the interface to verify
     * @return {Boolean} <code>true</code> if interface is implemented
     */
    classImplements : function(clazz, iface){

      if(!this.__l(clazz.prototype, clazz, iface) || !this.__n(clazz, iface) || !this.__o(clazz, iface)){

        return false;
      };
      // Validate extends, recursive
      var extend = iface.$$extends;
      if(extend){

        for(var i = 0,l = extend.length;i < l;i++){

          if(!this.has(clazz, extend[i])){

            return false;
          };
        };
      };
      return true;
    },
    /*
    ---------------------------------------------------------------------------
       PRIVATE/INTERNAL API
    ---------------------------------------------------------------------------
    */
    /**
     * This method will be attached to all interface to return
     * a nice identifier for them.
     *
     * @internal
     * @return {String} The interface identifier
     */
    genericToString : function(){

      return "[Interface " + this.name + "]";
    },
    /** Registry of all defined interfaces */
    $$registry : {
    },
    /**
     * Wrap a method with a precondition check.
     *
     * @signature function(iface, origFunction, functionName, preCondition)
     * @param iface {String} Name of the interface, where the pre condition
     *   was defined. (Used in error messages).
     * @param origFunction {Function} function to wrap.
     * @param functionName {String} name of the function. (Used in error messages).
     * @param preCondition {Function}. This function gets called with the arguments of the
     *   original function. If this function return true the original function is called.
     *   Otherwise an exception is thrown.
     * @return {Function} wrapped function
     */
    __p : qx.core.Environment.select("qx.debug", {
      "true" : function(iface, origFunction, functionName, preCondition){

        function wrappedFunction(){

          // call precondition
          preCondition.apply(this, arguments);
          // call original function
          return origFunction.apply(this, arguments);
        };
        origFunction.wrapper = wrappedFunction;
        return wrappedFunction;
      },
      "default" : function(iface, origFunction, functionName, preCondition){
      }
    }),
    /** @type {Map} allowed keys in interface definition */
    __i : qx.core.Environment.select("qx.debug", {
      "true" : {
        "extend" : "object",
        // Interface | Interface[]
        "statics" : "object",
        // Map
        "members" : "object",
        // Map
        "properties" : "object",
        // Map
        "events" : "object"
      },
      "default" : null
    }),
    /**
     * Validates incoming configuration and checks keys and values
     *
     * @signature function(name, config)
     * @param name {String} The name of the class
     * @param config {Map} Configuration map
     */
    __j : qx.core.Environment.select("qx.debug", {
      "true" : function(name, config){

        if(qx.core.Environment.get("qx.debug")){

          // Validate keys
          var allowed = this.__i;
          for(var key in config){

            if(allowed[key] === undefined){

              throw new Error('The configuration key "' + key + '" in class "' + name + '" is not allowed!');
            };
            if(config[key] == null){

              throw new Error("Invalid key '" + key + "' in interface '" + name + "'! The value is undefined/null!");
            };
            if(allowed[key] !== null && typeof config[key] !== allowed[key]){

              throw new Error('Invalid type of key "' + key + '" in interface "' + name + '"! The type of the key must be "' + allowed[key] + '"!');
            };
          };
          // Validate maps
          var maps = ["statics", "members", "properties", "events"];
          for(var i = 0,l = maps.length;i < l;i++){

            var key = maps[i];
            if(config[key] !== undefined && (["Array", "RegExp", "Date"].indexOf(qx.Bootstrap.getClass(config[key])) != -1 || config[key].classname !== undefined)){

              throw new Error('Invalid key "' + key + '" in interface "' + name + '"! The value needs to be a map!');
            };
          };
          // Validate extends
          if(config.extend){

            for(var i = 0,a = config.extend,l = a.length;i < l;i++){

              if(a[i] == null){

                throw new Error("Extends of interfaces must be interfaces. The extend number '" + i + 1 + "' in interface '" + name + "' is undefined/null!");
              };
              if(a[i].$$type !== "Interface"){

                throw new Error("Extends of interfaces must be interfaces. The extend number '" + i + 1 + "' in interface '" + name + "' is not an interface!");
              };
            };
          };
          // Validate statics
          if(config.statics){

            for(var key in config.statics){

              if(key.toUpperCase() !== key){

                throw new Error('Invalid key "' + key + '" in interface "' + name + '"! Static constants must be all uppercase.');
              };
              switch(typeof config.statics[key]){case "boolean":case "string":case "number":
              break;default:
              throw new Error('Invalid key "' + key + '" in interface "' + name + '"! Static constants must be all of a primitive type.');};
            };
          };
        };
      },
      "default" : function(name, config){
      }
    })
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/**
 * This class takes care of the normalization of the native 'Error' object.
 * It contains a simple bugfix for toString which might not print out the proper
 * error message.
 *
 * *toString*:
 * <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Error/toString">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.11.4.4">Annotated ES5 Spec</a>
 *
 * @group (Polyfill)
 */
qx.Bootstrap.define("qx.lang.normalize.Error", {
  defer : function(){

    // toString
    if(!qx.core.Environment.get("ecmascript.error.toString")){

      Error.prototype.toString = function(){

        var name = this.name || "Error";
        var message = this.message || "";
        if(name === "" && message === ""){

          return "Error";
        };
        if(name === ""){

          return message;
        };
        if(message === ""){

          return name;
        };
        return name + ": " + message;
      };
    };
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/**
 * This class takes care of the normalization of the native 'Date' object.
 * Therefore it checks the availability of the following methods and appends
 * it, if not available. This means you can use the methods during
 * development in every browser. For usage samples, check out the attached links.
 *
 * *now*:
 * <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/now">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.9.4.4">Annotated ES5 Spec</a>
 *
 * @group (Polyfill)
 */
qx.Bootstrap.define("qx.lang.normalize.Date", {
  defer : function(){

    // Date.now
    if(!qx.core.Environment.get("ecmascript.date.now")){

      Date.now = function(){

        return +new Date();
      };
    };
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Internal class for handling of dynamic properties. Should only be used
 * through the methods provided by {@link qx.Class}.
 *
 * For a complete documentation of properties take a look at
 * http://manual.qooxdoo.org/${qxversion}/pages/core.html#properties.
 *
 *
 * *Normal properties*
 *
 * The <code>properties</code> key in the class definition map of {@link qx.Class#define}
 * is used to generate the properties.
 *
 * Valid keys of a property definition are:
 *
 * <table>
 *   <tr><th>Name</th><th>Type</th><th>Description</th></tr>
 *   <tr><th>check</th><td>Array, String, Function</td><td>
 *     The check is used to check the type the incoming value of a property. This will only
 *     be executed in the source version. The build version will not contain the checks.
 *     The check can be:
 *     <ul>
 *       <li>a custom check function. The function takes the incoming value as a parameter and must
 *           return a boolean value to indicate whether the values is valid.
 *       </li>
 *       <li>inline check code as a string e.g. <code>"value &gt; 0 && value &lt; 100"</code></li>
 *       <li>a class name e.g. <code>qx.ui.form.Button</code></li>
 *       <li>a name of an interface the value must implement</li>
 *       <li>an array of all valid values</li>
 *       <li>one of the predefined checks: Boolean, String, Number, Integer, Float, Double,
 *           Object, Array, Map, Class, Mixin, Interface, Theme, Error, RegExp, Function,
 *           Date, Node, Element, Document, Window, Event
 *       </li>
 *     <ul>
 *   </td></tr>
 *   <tr><th>init</th><td>var</td><td>
 *     Sets the default/initial value of the property. If no property value is set or the property
 *     gets reset, the getter will return the <code>init</code> value.
 *   </td></tr>
 *   <tr><th>apply</th><td>String</td><td>
 *     On change of the property value the method of the specified name will be called. The signature of
 *     the method is <code>function(newValue, oldValue, propertyName)</code>. It is conventional to name
 *     the callback <code>_apply</code> + <i>PropertyName</i>, with the property name camel-cased (e.g.
 *     "<i>_applyFooBar</i>" for a property <i>fooBar</i>).
 *   </td></tr>
 *   <tr><th>event</th><td>String</td><td>
 *     On change of the property value an event with the given name will be dispatched. The event type is
 *     {@link qx.event.type.Data}.
 *   </td></tr>
 *   <tr><th>themeable</th><td>Boolean</td><td>
 *     Whether this property can be set using themes.
 *   </td></tr>
 *   <tr><th>inheritable</th><td>Boolean</td><td>
 *     Whether the property value should be inheritable. If the property does not have an user defined or an
 *     init value, the property will try to get the value from the parent of the current object.
 *   </td></tr>
 *   <tr><th>nullable</th><td>Boolean</td><td>
 *     Whether <code>null</code> is an allowed value of the property. This is complementary to the check
 *     defined using the <code>check</code> key.
 *   </td></tr>
 *   <tr><th>refine</th><td>Boolean</td><td>
 *     Whether the property definition is a refinement of a property in one of the super classes of the class.
 *     Only the <code>init</code> value can be changed using refine.
 *   </td></tr>
 *   <tr><th>transform</th><td>String</td><td>
 *     On setting of the property value the method of the specified name will
 *     be called. The signature of the method is <code>function(value)</code>.
 *     The parameter <code>value</code> is the value passed to the setter.
 *     The function must return the modified or unmodified value.
 *     Transformation occurs before the check function, so both may be
 *     specified if desired.  Alternatively, the transform function may throw
 *     an error if the value passed to it is invalid.
 *   </td></tr>
 *   <tr><th>validate</th><td>Function, String</td><td>
 *     On setting of the property value the method of the specified name will
 *     be called. The signature of the method is <code>function(value)</code>.
 *     The parameter <code>value</code> is the value passed to the setter.
 *     If the validation fails, an <code>qx.core.ValidationError</code> should
 *     be thrown by the validation function. Otherwise, just do nothing in the
 *     function.<br>
 *     If a string is given, the string should hold a reference to a member
 *     method.<br>
 *     <code>"<i>methodname</i>"</code> for example
 *     <code>"__validateProperty"</code><br>
 *     There are some default validators in the {@link qx.util.Validate} class.
 *     See this documentation for usage examples.
 *   </td></tr>
 *   <tr><th>dereference</th><td>Boolean</td><td>
 *     By default, the references to the values (current, init, ...) of the
 *     property will be stored as references on the object. When disposing
 *     this object, the references will not be deleted. Setting the
 *     dereference key to true tells the property system to delete all
 *     connections made by this property on dispose. This can be necessary for
 *     disconnecting DOM objects to allow the garbage collector to work
 *     properly.
 *   </td></tr>
 *   <tr><th>deferredInit</th><td>Boolean</td><td>
 *     Allow for a deferred initialization for reference types. Defaults to false.
 *   </td></tr>
 * </table>
 *
 * *Property groups*
 *
 * Property groups are defined in a similar way but support a different set of keys:
 *
 * <table>
 *   <tr><th>Name</th><th>Type</th><th>Description</th></tr>
 *   <tr><th>group</th><td>String[]</td><td>
 *     A list of property names which should be set using the property group.
 *   </td></tr>
 *   <tr><th>mode</th><td>String</td><td>
 *     If mode is set to <code>"shorthand"</code>, the properties can be set using a CSS like shorthand mode.
 *   </td></tr>
 *   <tr><th>themeable</th><td>Boolean</td><td>
 *     Whether this property can be set using themes.
 *   </td></tr>
 * </table>
 *
 * @internal
 * @ignore(qx.Interface)
 */
qx.Bootstrap.define("qx.core.Property", {
  statics : {
    /**
     * This is a method which does nothing than gethering dependencies for the
     * module system. Calling this method is useless because it does nothing.
     */
    __q : function(){

      if(qx.core.Environment.get("module.events")){

        qx.event.type.Data;
        qx.event.dispatch.Direct;
      };
    },
    /**
     * Built-in checks
     * The keys could be used in the check of the properties
     */
    __r : {
      "Boolean" : 'qx.core.Assert.assertBoolean(value, msg) || true',
      "String" : 'qx.core.Assert.assertString(value, msg) || true',
      "Number" : 'qx.core.Assert.assertNumber(value, msg) || true',
      "Integer" : 'qx.core.Assert.assertInteger(value, msg) || true',
      "PositiveNumber" : 'qx.core.Assert.assertPositiveNumber(value, msg) || true',
      "PositiveInteger" : 'qx.core.Assert.assertPositiveInteger(value, msg) || true',
      "Error" : 'qx.core.Assert.assertInstance(value, Error, msg) || true',
      "RegExp" : 'qx.core.Assert.assertInstance(value, RegExp, msg) || true',
      "Object" : 'qx.core.Assert.assertObject(value, msg) || true',
      "Array" : 'qx.core.Assert.assertArray(value, msg) || true',
      "Map" : 'qx.core.Assert.assertMap(value, msg) || true',
      "Function" : 'qx.core.Assert.assertFunction(value, msg) || true',
      "Date" : 'qx.core.Assert.assertInstance(value, Date, msg) || true',
      "Node" : 'value !== null && value.nodeType !== undefined',
      "Element" : 'value !== null && value.nodeType === 1 && value.attributes',
      "Document" : 'value !== null && value.nodeType === 9 && value.documentElement',
      "Window" : 'value !== null && value.document',
      "Event" : 'value !== null && value.type !== undefined',
      "Class" : 'value !== null && value.$$type === "Class"',
      "Mixin" : 'value !== null && value.$$type === "Mixin"',
      "Interface" : 'value !== null && value.$$type === "Interface"',
      "Theme" : 'value !== null && value.$$type === "Theme"',
      "Color" : 'qx.lang.Type.isString(value) && qx.util.ColorUtil.isValidPropertyValue(value)',
      "Decorator" : 'value !== null && qx.theme.manager.Decoration.getInstance().isValidPropertyValue(value)',
      "Font" : 'value !== null && qx.theme.manager.Font.getInstance().isDynamic(value)'
    },
    /**
     * Contains types from {@link #__checks} list which need to be dereferenced
     */
    __s : {
      "Node" : true,
      "Element" : true,
      "Document" : true,
      "Window" : true,
      "Event" : true
    },
    /**
     * Inherit value, used to override defaults etc. to force inheritance
     * even if property value is not undefined (through multi-values)
     *
     * @internal
     */
    $$inherit : "inherit",
    /**
     * Caching field names for each property created
     *
     * @internal
     */
    $$store : {
      runtime : {
      },
      user : {
      },
      theme : {
      },
      inherit : {
      },
      init : {
      },
      useinit : {
      }
    },
    /**
     * Caching function names for each property created
     *
     * @internal
     */
    $$method : {
      get : {
      },
      set : {
      },
      reset : {
      },
      init : {
      },
      refresh : {
      },
      setRuntime : {
      },
      resetRuntime : {
      },
      setThemed : {
      },
      resetThemed : {
      }
    },
    /**
     * Supported keys for property defintions
     *
     * @internal
     */
    $$allowedKeys : {
      name : "string",
      // String
      dereference : "boolean",
      // Boolean
      inheritable : "boolean",
      // Boolean
      nullable : "boolean",
      // Boolean
      themeable : "boolean",
      // Boolean
      refine : "boolean",
      // Boolean
      init : null,
      // var
      apply : "string",
      // String
      event : "string",
      // String
      check : null,
      // Array, String, Function
      transform : "string",
      // String
      deferredInit : "boolean",
      // Boolean
      validate : null
    },
    /**
     * Supported keys for property group definitions
     *
     * @internal
     */
    $$allowedGroupKeys : {
      name : "string",
      // String
      group : "object",
      // Array
      mode : "string",
      // String
      themeable : "boolean"
    },
    /** Contains names of inheritable properties, filled by {@link qx.Class.define} */
    $$inheritable : {
    },
    /**
     * Generate optimized refresh method and  attach it to the class' prototype
     *
     * @param clazz {Class} clazz to which the refresher should be added
     */
    __t : function(clazz){

      var inheritables = this.__u(clazz);
      if(!inheritables.length){

        var refresher = function(){
        };
      } else {

        refresher = this.__v(inheritables);
      };
      clazz.prototype.$$refreshInheritables = refresher;
    },
    /**
     * Get the names of all inheritable properties of the given class
     *
     * @param clazz {Class} class to get the inheritable properties of
     * @return {String[]} List of property names
     */
    __u : function(clazz){

      var inheritable = [];
      while(clazz){

        var properties = clazz.$$properties;
        if(properties){

          for(var name in this.$$inheritable){

            // Whether the property is available in this class
            // and whether it is inheritable in this class as well
            if(properties[name] && properties[name].inheritable){

              inheritable.push(name);
            };
          };
        };
        clazz = clazz.superclass;
      };
      return inheritable;
    },
    /**
     * Assemble the refresher code and return the generated function
     *
     * @param inheritables {String[]} list of inheritable properties
     * @return {Function} refresher function
     */
    __v : function(inheritables){

      var inherit = this.$$store.inherit;
      var init = this.$$store.init;
      var refresh = this.$$method.refresh;
      var code = ["var parent = this.getLayoutParent();", "if (!parent) return;"];
      for(var i = 0,l = inheritables.length;i < l;i++){

        var name = inheritables[i];
        code.push("var value = parent.", inherit[name], ";", "if (value===undefined) value = parent.", init[name], ";", "this.", refresh[name], "(value);");
      };
      return new Function(code.join(""));
    },
    /**
     * Attach $$refreshInheritables method stub to the given class
     *
     * @param clazz {Class} clazz to which the refresher should be added
     */
    attachRefreshInheritables : function(clazz){

      clazz.prototype.$$refreshInheritables = function(){

        qx.core.Property.__t(clazz);
        return this.$$refreshInheritables();
      };
    },
    /**
     * Attach one property to class
     *
     * @param clazz {Class} Class to attach properties to
     * @param name {String} Name of property
     * @param config {Map} Configuration map of property
     */
    attachMethods : function(clazz, name, config){

      // Divide groups from "normal" properties
      config.group ? this.__w(clazz, config, name) : this.__x(clazz, config, name);
    },
    /**
     * Attach group methods
     *
     * @param clazz {Class} Class to attach properties to
     * @param config {Map} Property configuration
     * @param name {String} Name of the property
     */
    __w : function(clazz, config, name){

      var upname = qx.Bootstrap.firstUp(name);
      var members = clazz.prototype;
      var themeable = config.themeable === true;
      if(qx.core.Environment.get("qx.debug")){

        if(qx.core.Environment.get("qx.debug.property.level") > 1){

          qx.Bootstrap.debug("Generating property group: " + name);
        };
      };
      var setter = [];
      var resetter = [];
      if(themeable){

        var styler = [];
        var unstyler = [];
      };
      var argHandler = "var a=arguments[0] instanceof Array?arguments[0]:arguments;";
      setter.push(argHandler);
      if(themeable){

        styler.push(argHandler);
      };
      if(config.mode == "shorthand"){

        var shorthand = "a=qx.lang.Array.fromShortHand(qx.lang.Array.fromArguments(a));";
        setter.push(shorthand);
        if(themeable){

          styler.push(shorthand);
        };
      };
      for(var i = 0,a = config.group,l = a.length;i < l;i++){

        if(qx.core.Environment.get("qx.debug")){

          if(!this.$$method.set[a[i]] || !this.$$method.reset[a[i]]){

            throw new Error("Cannot create property group '" + name + "' including non-existing property '" + a[i] + "'!");
          };
        };
        setter.push("this.", this.$$method.set[a[i]], "(a[", i, "]);");
        resetter.push("this.", this.$$method.reset[a[i]], "();");
        if(themeable){

          if(qx.core.Environment.get("qx.debug")){

            if(!this.$$method.setThemed[a[i]]){

              throw new Error("Cannot add the non themable property '" + a[i] + "' to the themable property group '" + name + "'");
            };
          };
          styler.push("this.", this.$$method.setThemed[a[i]], "(a[", i, "]);");
          unstyler.push("this.", this.$$method.resetThemed[a[i]], "();");
        };
      };
      // Attach setter
      this.$$method.set[name] = "set" + upname;
      members[this.$$method.set[name]] = new Function(setter.join(""));
      // Attach resetter
      this.$$method.reset[name] = "reset" + upname;
      members[this.$$method.reset[name]] = new Function(resetter.join(""));
      if(themeable){

        // Attach styler
        this.$$method.setThemed[name] = "setThemed" + upname;
        members[this.$$method.setThemed[name]] = new Function(styler.join(""));
        // Attach unstyler
        this.$$method.resetThemed[name] = "resetThemed" + upname;
        members[this.$$method.resetThemed[name]] = new Function(unstyler.join(""));
      };
    },
    /**
     * Attach property methods
     *
     * @param clazz {Class} Class to attach properties to
     * @param config {Map} Property configuration
     * @param name {String} Name of the property
     */
    __x : function(clazz, config, name){

      var upname = qx.Bootstrap.firstUp(name);
      var members = clazz.prototype;
      if(qx.core.Environment.get("qx.debug")){

        if(qx.core.Environment.get("qx.debug.property.level") > 1){

          qx.Bootstrap.debug("Generating property wrappers: " + name);
        };
      };
      // Fill dispose value
      if(config.dereference === undefined && typeof config.check === "string"){

        config.dereference = this.__y(config.check);
      };
      var method = this.$$method;
      var store = this.$$store;
      store.runtime[name] = "$$runtime_" + name;
      store.user[name] = "$$user_" + name;
      store.theme[name] = "$$theme_" + name;
      store.init[name] = "$$init_" + name;
      store.inherit[name] = "$$inherit_" + name;
      store.useinit[name] = "$$useinit_" + name;
      method.get[name] = "get" + upname;
      members[method.get[name]] = function(){

        return qx.core.Property.executeOptimizedGetter(this, clazz, name, "get");
      };
      method.set[name] = "set" + upname;
      members[method.set[name]] = function(value){

        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "set", arguments);
      };
      method.reset[name] = "reset" + upname;
      members[method.reset[name]] = function(){

        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "reset");
      };
      if(config.inheritable || config.apply || config.event || config.deferredInit){

        method.init[name] = "init" + upname;
        members[method.init[name]] = function(value){

          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "init", arguments);
        };
        if(qx.core.Environment.get("qx.debug")){

          members[method.init[name]].$$propertyMethod = true;
        };
      };
      if(config.inheritable){

        method.refresh[name] = "refresh" + upname;
        members[method.refresh[name]] = function(value){

          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "refresh", arguments);
        };
        if(qx.core.Environment.get("qx.debug")){

          members[method.refresh[name]].$$propertyMethod = true;
        };
      };
      method.setRuntime[name] = "setRuntime" + upname;
      members[method.setRuntime[name]] = function(value){

        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "setRuntime", arguments);
      };
      method.resetRuntime[name] = "resetRuntime" + upname;
      members[method.resetRuntime[name]] = function(){

        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "resetRuntime");
      };
      if(config.themeable){

        method.setThemed[name] = "setThemed" + upname;
        members[method.setThemed[name]] = function(value){

          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "setThemed", arguments);
        };
        method.resetThemed[name] = "resetThemed" + upname;
        members[method.resetThemed[name]] = function(){

          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "resetThemed");
        };
        if(qx.core.Environment.get("qx.debug")){

          members[method.setThemed[name]].$$propertyMethod = true;
          members[method.resetThemed[name]].$$propertyMethod = true;
        };
      };
      if(config.check === "Boolean"){

        members["toggle" + upname] = new Function("return this." + method.set[name] + "(!this." + method.get[name] + "())");
        members["is" + upname] = new Function("return this." + method.get[name] + "()");
        if(qx.core.Environment.get("qx.debug")){

          members["toggle" + upname].$$propertyMethod = true;
          members["is" + upname].$$propertyMethod = true;
        };
      };
      // attach a flag to makr generated property methods
      if(qx.core.Environment.get("qx.debug")){

        members[method.get[name]].$$propertyMethod = true;
        members[method.set[name]].$$propertyMethod = true;
        members[method.reset[name]].$$propertyMethod = true;
        members[method.setRuntime[name]].$$propertyMethod = true;
        members[method.resetRuntime[name]].$$propertyMethod = true;
      };
    },
    /**
     * Returns if the reference for the given property check should be removed
     * on dispose.
     *
     * @param check {var} The check of the property definition.
     * @return {Boolean} If the dereference key should be set.
     */
    __y : function(check){

      return !!this.__s[check];
    },
    /** @type {Map} Internal data field for error messages used by {@link #error} */
    __z : {
      '0' : 'Could not change or apply init value after constructing phase!',
      '1' : 'Requires exactly one argument!',
      '2' : 'Undefined value is not allowed!',
      '3' : 'Does not allow any arguments!',
      '4' : 'Null value is not allowed!',
      '5' : 'Is invalid!'
    },
    /**
     * Error method used by the property system to report errors.
     *
     * @param obj {qx.core.Object} Any qooxdoo object
     * @param id {Integer} Numeric error identifier
     * @param property {String} Name of the property
     * @param variant {String} Name of the method variant e.g. "set", "reset", ...
     * @param value {var} Incoming value
     */
    error : function(obj, id, property, variant, value){

      var classname = obj.constructor.classname;
      var msg = "Error in property " + property + " of class " + classname + " in method " + this.$$method[variant][property] + " with incoming value '" + value + "': ";
      throw new Error(msg + (this.__z[id] || "Unknown reason: " + id));
    },
    /**
     * Compiles a string builder object to a function, executes the function and
     * returns the return value.
     *
     * @param instance {Object} Instance which have called the original method
     * @param members {Object} Prototype members map where the new function should be stored
     * @param name {String} Name of the property
     * @param variant {String} Function variant e.g. get, set, reset, ...
     * @param code {Array} Array which contains the code
     * @param args {arguments} Incoming arguments of wrapper method
     * @return {var} Return value of the generated function
     */
    __A : function(instance, members, name, variant, code, args){

      var store = this.$$method[variant][name];
      // Output generate code
      if(qx.core.Environment.get("qx.debug")){

        if(qx.core.Environment.get("qx.debug.property.level") > 1){

          qx.Bootstrap.debug("Code[" + this.$$method[variant][name] + "]: " + code.join(""));
        };
        // Overriding temporary wrapper
        try{

          members[store] = new Function("value", code.join(""));
        } catch(ex) {

          throw new Error("Malformed generated code to unwrap method: " + this.$$method[variant][name] + "\n" + code.join(""));
        };
      } else {

        members[store] = new Function("value", code.join(""));
      };
      // Enable profiling code
      if(qx.core.Environment.get("qx.aspects")){

        members[store] = qx.core.Aspect.wrap(instance.classname + "." + store, members[store], "property");
      };
      qx.Bootstrap.setDisplayName(members[store], instance.classname + ".prototype", store);
      // Executing new function
      if(args === undefined){

        return instance[store]();
      } else if(qx.core.Environment.get("qx.debug")){

        return instance[store].apply(instance, args);
      } else {

        return instance[store](args[0]);
      };
    },
    /**
     * Generates the optimized getter
     * Supported variants: get
     *
     * @param instance {Object} the instance which calls the method
     * @param clazz {Class} the class which originally defined the property
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     * @return {var} Execute return value of apply generated function, generally the incoming value
     */
    executeOptimizedGetter : function(instance, clazz, name, variant){

      var config = clazz.$$properties[name];
      var members = clazz.prototype;
      var code = [];
      var store = this.$$store;
      code.push('if(this.', store.runtime[name], '!==undefined)');
      code.push('return this.', store.runtime[name], ';');
      if(config.inheritable){

        code.push('else if(this.', store.inherit[name], '!==undefined)');
        code.push('return this.', store.inherit[name], ';');
        code.push('else ');
      };
      code.push('if(this.', store.user[name], '!==undefined)');
      code.push('return this.', store.user[name], ';');
      if(config.themeable){

        code.push('else if(this.', store.theme[name], '!==undefined)');
        code.push('return this.', store.theme[name], ';');
      };
      if(config.deferredInit && config.init === undefined){

        code.push('else if(this.', store.init[name], '!==undefined)');
        code.push('return this.', store.init[name], ';');
      };
      code.push('else ');
      if(config.init !== undefined){

        if(config.inheritable){

          code.push('var init=this.', store.init[name], ';');
          if(config.nullable){

            code.push('if(init==qx.core.Property.$$inherit)init=null;');
          } else if(config.init !== undefined){

            code.push('return this.', store.init[name], ';');
          } else {

            code.push('if(init==qx.core.Property.$$inherit)throw new Error("Inheritable property ', name, ' of an instance of ', clazz.classname, ' is not (yet) ready!");');
          };
          code.push('return init;');
        } else {

          code.push('return this.', store.init[name], ';');
        };
      } else if(config.inheritable || config.nullable){

        code.push('return null;');
      } else {

        code.push('throw new Error("Property ', name, ' of an instance of ', clazz.classname, ' is not (yet) ready!");');
      };
      return this.__A(instance, members, name, variant, code);
    },
    /**
     * Generates the optimized setter
     * Supported variants: set, reset, init, refresh, style, unstyle
     *
     * @param instance {Object} the instance which calls the method
     * @param clazz {Class} the class which originally defined the property
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     * @param args {arguments} Incoming arguments of wrapper method
     * @return {var} Execute return value of apply generated function, generally the incoming value
     */
    executeOptimizedSetter : function(instance, clazz, name, variant, args){

      var config = clazz.$$properties[name];
      var members = clazz.prototype;
      var code = [];
      var incomingValue = variant === "set" || variant === "setThemed" || variant === "setRuntime" || (variant === "init" && config.init === undefined);
      var hasCallback = config.apply || config.event || config.inheritable;
      var store = this.__B(variant, name);
      this.__C(code, config, name, variant, incomingValue);
      if(incomingValue){

        this.__D(code, clazz, config, name);
      };
      if(hasCallback){

        this.__E(code, incomingValue, store, variant);
      };
      if(config.inheritable){

        code.push('var inherit=prop.$$inherit;');
      };
      if(qx.core.Environment.get("qx.debug")){

        if(incomingValue){

          this.__F(code, config, clazz, name, variant);
        };
      };
      if(!hasCallback){

        this.__G(code, name, variant, incomingValue);
      } else {

        this.__H(code, config, name, variant, incomingValue);
      };
      if(config.inheritable){

        this.__I(code, config, name, variant);
      } else if(hasCallback){

        this.__J(code, config, name, variant);
      };
      if(hasCallback){

        this.__K(code, config, name, variant);
        // Refresh children
        // Requires the parent/children interface
        if(config.inheritable && members._getChildren){

          this.__L(code, name);
        };
      };
      // Return value
      if(incomingValue){

        code.push('return value;');
      };
      return this.__A(instance, members, name, variant, code, args);
    },
    /**
     * Get the object to store the value for the given variant
     *
     * @param variant {String} Method variant.
     * @param name {String} name of the property
     *
     * @return {Object} the value store
     */
    __B : function(variant, name){

      if(variant === "setRuntime" || variant === "resetRuntime"){

        var store = this.$$store.runtime[name];
      } else if(variant === "setThemed" || variant === "resetThemed"){

        store = this.$$store.theme[name];
      } else if(variant === "init"){

        store = this.$$store.init[name];
      } else {

        store = this.$$store.user[name];
      };;
      return store;
    },
    /**
     * Emit code to check the arguments pre-conditions
     *
     * @param code {String[]} String array to append the code to
     * @param config {Object} The property configuration map
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     * @param incomingValue {Boolean} Whether the setter has an incoming value
     */
    __C : function(code, config, name, variant, incomingValue){

      if(qx.core.Environment.get("qx.debug")){

        code.push('var prop=qx.core.Property;');
        if(variant === "init"){

          code.push('if(this.$$initialized)prop.error(this,0,"', name, '","', variant, '",value);');
        };
        if(variant === "refresh"){
        } else if(incomingValue){

          // Check argument length
          code.push('if(arguments.length!==1)prop.error(this,1,"', name, '","', variant, '",value);');
          // Undefined check
          code.push('if(value===undefined)prop.error(this,2,"', name, '","', variant, '",value);');
        } else {

          // Check argument length
          code.push('if(arguments.length!==0)prop.error(this,3,"', name, '","', variant, '",value);');
        };
      } else {

        if(!config.nullable || config.check || config.inheritable){

          code.push('var prop=qx.core.Property;');
        };
        // Undefined check
        if(variant === "set"){

          code.push('if(value===undefined)prop.error(this,2,"', name, '","', variant, '",value);');
        };
      };
    },
    /**
     * Emit code to apply the "validate" and "transform" config keys.
     *
     * @param code {String[]} String array to append the code to
     * @param clazz {Class} the class which originally defined the property
     * @param config {Object} The property configuration map
     * @param name {String} name of the property
     */
    __D : function(code, clazz, config, name){

      // Call user-provided transform method, if one is provided.  Transform
      // method should either throw an error or return the new value.
      if(config.transform){

        code.push('value=this.', config.transform, '(value);');
      };
      // Call user-provided validate method, if one is provided.  Validate
      // method should either throw an error or do nothing.
      if(config.validate){

        // if it is a string
        if(typeof config.validate === "string"){

          code.push('this.', config.validate, '(value);');
        } else if(config.validate instanceof Function){

          code.push(clazz.classname, '.$$properties.', name);
          code.push('.validate.call(this, value);');
        };
      };
    },
    /**
     * Emit code, which returns if the incoming value equals the current value.
     *
     * @param code {String[]} String array to append the code to
     * @param incomingValue {Boolean} Whether the setter has an incoming value
     * @param store {Object} The data store to use for the incoming value
     * @param variant {String} Method variant.
     */
    __E : function(code, incomingValue, store, variant){

      var resetValue = (variant === "reset" || variant === "resetThemed" || variant === "resetRuntime");
      if(incomingValue){

        code.push('if(this.', store, '===value)return value;');
      } else if(resetValue){

        code.push('if(this.', store, '===undefined)return;');
      };
    },
    /**
     * Emit code, which performs validation of the incoming value according to
     * the "nullable", "check" and "inheritable" config keys.
     *
     * @signature function(code, config, clazz, name, variant)
     * @param code {String[]} String array to append the code to
     * @param config {Object} The property configuration map
     * @param clazz {Class} the class which originally defined the property
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     */
    __F : qx.core.Environment.select("qx.debug", {
      "true" : function(code, config, clazz, name, variant){

        // Null check
        if(!config.nullable){

          code.push('if(value===null)prop.error(this,4,"', name, '","', variant, '",value);');
        };
        // Processing check definition
        if(config.check !== undefined){

          code.push('var msg = "Invalid incoming value for property \'' + name + '\' of class \'' + clazz.classname + '\'";');
          // Accept "null"
          if(config.nullable){

            code.push('if(value!==null)');
          };
          // Inheritable properties always accept "inherit" as value
          if(config.inheritable){

            code.push('if(value!==inherit)');
          };
          code.push('if(');
          if(this.__r[config.check] !== undefined){

            code.push('!(', this.__r[config.check], ')');
          } else if(qx.Class.isDefined(config.check)){

            code.push('qx.core.Assert.assertInstance(value, qx.Class.getByName("', config.check, '"), msg)');
          } else if(qx.Interface && qx.Interface.isDefined(config.check)){

            code.push('qx.core.Assert.assertInterface(value, qx.Interface.getByName("', config.check, '"), msg)');
          } else if(typeof config.check === "function"){

            code.push('!', clazz.classname, '.$$properties.', name);
            code.push('.check.call(this, value)');
          } else if(typeof config.check === "string"){

            code.push('!(', config.check, ')');
          } else if(config.check instanceof Array){

            code.push('qx.core.Assert.assertInArray(value, ', clazz.classname, '.$$properties.', name, '.check, msg)');
          } else {

            throw new Error("Could not add check to property " + name + " of class " + clazz.classname);
          };;;;;
          code.push(')prop.error(this,5,"', name, '","', variant, '",value);');
        };
      },
      "false" : undefined
    }),
    /**
     * Emit code to store the incoming value
     *
     * @param code {String[]} String array to append the code to
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     * @param incomingValue {Boolean} Whether the setter has an incoming value
     */
    __G : function(code, name, variant, incomingValue){

      if(variant === "setRuntime"){

        code.push('this.', this.$$store.runtime[name], '=value;');
      } else if(variant === "resetRuntime"){

        code.push('if(this.', this.$$store.runtime[name], '!==undefined)');
        code.push('delete this.', this.$$store.runtime[name], ';');
      } else if(variant === "set"){

        code.push('this.', this.$$store.user[name], '=value;');
      } else if(variant === "reset"){

        code.push('if(this.', this.$$store.user[name], '!==undefined)');
        code.push('delete this.', this.$$store.user[name], ';');
      } else if(variant === "setThemed"){

        code.push('this.', this.$$store.theme[name], '=value;');
      } else if(variant === "resetThemed"){

        code.push('if(this.', this.$$store.theme[name], '!==undefined)');
        code.push('delete this.', this.$$store.theme[name], ';');
      } else if(variant === "init" && incomingValue){

        code.push('this.', this.$$store.init[name], '=value;');
      };;;;;;
    },
    /**
     * Emit code to store the incoming value and compute the "old" and "computed"
     * values.
     *
     * @param code {String[]} String array to append the code to
     * @param config {Object} The property configuration map
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     * @param incomingValue {Boolean} Whether the setter has an incoming value
     */
    __H : function(code, config, name, variant, incomingValue){

      if(config.inheritable){

        code.push('var computed, old=this.', this.$$store.inherit[name], ';');
      } else {

        code.push('var computed, old;');
      };
      // OLD = RUNTIME VALUE
      code.push('if(this.', this.$$store.runtime[name], '!==undefined){');
      if(variant === "setRuntime"){

        // Replace it with new value
        code.push('computed=this.', this.$$store.runtime[name], '=value;');
      } else if(variant === "resetRuntime"){

        // Delete field
        code.push('delete this.', this.$$store.runtime[name], ';');
        // Complex compution of new value
        code.push('if(this.', this.$$store.user[name], '!==undefined)');
        code.push('computed=this.', this.$$store.user[name], ';');
        code.push('else if(this.', this.$$store.theme[name], '!==undefined)');
        code.push('computed=this.', this.$$store.theme[name], ';');
        code.push('else if(this.', this.$$store.init[name], '!==undefined){');
        code.push('computed=this.', this.$$store.init[name], ';');
        code.push('this.', this.$$store.useinit[name], '=true;');
        code.push('}');
      } else {

        // Use runtime value as it has higher priority
        code.push('old=computed=this.', this.$$store.runtime[name], ';');
        // Store incoming value
        if(variant === "set"){

          code.push('this.', this.$$store.user[name], '=value;');
        } else if(variant === "reset"){

          code.push('delete this.', this.$$store.user[name], ';');
        } else if(variant === "setThemed"){

          code.push('this.', this.$$store.theme[name], '=value;');
        } else if(variant === "resetThemed"){

          code.push('delete this.', this.$$store.theme[name], ';');
        } else if(variant === "init" && incomingValue){

          code.push('this.', this.$$store.init[name], '=value;');
        };;;;
      };
      code.push('}');
      // OLD = USER VALUE
      code.push('else if(this.', this.$$store.user[name], '!==undefined){');
      if(variant === "set"){

        if(!config.inheritable){

          // Remember old value
          code.push('old=this.', this.$$store.user[name], ';');
        };
        // Replace it with new value
        code.push('computed=this.', this.$$store.user[name], '=value;');
      } else if(variant === "reset"){

        if(!config.inheritable){

          // Remember old value
          code.push('old=this.', this.$$store.user[name], ';');
        };
        // Delete field
        code.push('delete this.', this.$$store.user[name], ';');
        // Complex compution of new value
        code.push('if(this.', this.$$store.runtime[name], '!==undefined)');
        code.push('computed=this.', this.$$store.runtime[name], ';');
        code.push('if(this.', this.$$store.theme[name], '!==undefined)');
        code.push('computed=this.', this.$$store.theme[name], ';');
        code.push('else if(this.', this.$$store.init[name], '!==undefined){');
        code.push('computed=this.', this.$$store.init[name], ';');
        code.push('this.', this.$$store.useinit[name], '=true;');
        code.push('}');
      } else {

        if(variant === "setRuntime"){

          // Use runtime value where it has higher priority
          code.push('computed=this.', this.$$store.runtime[name], '=value;');
        } else if(config.inheritable){

          // Use user value where it has higher priority
          code.push('computed=this.', this.$$store.user[name], ';');
        } else {

          // Use user value where it has higher priority
          code.push('old=computed=this.', this.$$store.user[name], ';');
        };
        // Store incoming value
        if(variant === "setThemed"){

          code.push('this.', this.$$store.theme[name], '=value;');
        } else if(variant === "resetThemed"){

          code.push('delete this.', this.$$store.theme[name], ';');
        } else if(variant === "init" && incomingValue){

          code.push('this.', this.$$store.init[name], '=value;');
        };;
      };
      code.push('}');
      // OLD = THEMED VALUE
      if(config.themeable){

        code.push('else if(this.', this.$$store.theme[name], '!==undefined){');
        if(!config.inheritable){

          code.push('old=this.', this.$$store.theme[name], ';');
        };
        if(variant === "setRuntime"){

          code.push('computed=this.', this.$$store.runtime[name], '=value;');
        } else if(variant === "set"){

          code.push('computed=this.', this.$$store.user[name], '=value;');
        } else if(variant === "setThemed"){

          code.push('computed=this.', this.$$store.theme[name], '=value;');
        } else if(variant === "resetThemed"){

          // Delete entry
          code.push('delete this.', this.$$store.theme[name], ';');
          // Fallback to init value
          code.push('if(this.', this.$$store.init[name], '!==undefined){');
          code.push('computed=this.', this.$$store.init[name], ';');
          code.push('this.', this.$$store.useinit[name], '=true;');
          code.push('}');
        } else if(variant === "init"){

          if(incomingValue){

            code.push('this.', this.$$store.init[name], '=value;');
          };
          code.push('computed=this.', this.$$store.theme[name], ';');
        } else if(variant === "refresh"){

          code.push('computed=this.', this.$$store.theme[name], ';');
        };;;;;
        code.push('}');
      };
      // OLD = INIT VALUE
      code.push('else if(this.', this.$$store.useinit[name], '){');
      if(!config.inheritable){

        code.push('old=this.', this.$$store.init[name], ';');
      };
      if(variant === "init"){

        if(incomingValue){

          code.push('computed=this.', this.$$store.init[name], '=value;');
        } else {

          code.push('computed=this.', this.$$store.init[name], ';');
        };
      } else if(variant === "set" || variant === "setRuntime" || variant === "setThemed" || variant === "refresh"){

        code.push('delete this.', this.$$store.useinit[name], ';');
        if(variant === "setRuntime"){

          code.push('computed=this.', this.$$store.runtime[name], '=value;');
        } else if(variant === "set"){

          code.push('computed=this.', this.$$store.user[name], '=value;');
        } else if(variant === "setThemed"){

          code.push('computed=this.', this.$$store.theme[name], '=value;');
        } else if(variant === "refresh"){

          code.push('computed=this.', this.$$store.init[name], ';');
        };;;
      };
      code.push('}');
      // OLD = NONE
      // reset(), resetRuntime() and resetStyle() are impossible because otherwise there
      // is already an old value
      if(variant === "set" || variant === "setRuntime" || variant === "setThemed" || variant === "init"){

        code.push('else{');
        if(variant === "setRuntime"){

          code.push('computed=this.', this.$$store.runtime[name], '=value;');
        } else if(variant === "set"){

          code.push('computed=this.', this.$$store.user[name], '=value;');
        } else if(variant === "setThemed"){

          code.push('computed=this.', this.$$store.theme[name], '=value;');
        } else if(variant === "init"){

          if(incomingValue){

            code.push('computed=this.', this.$$store.init[name], '=value;');
          } else {

            code.push('computed=this.', this.$$store.init[name], ';');
          };
          code.push('this.', this.$$store.useinit[name], '=true;');
        };;;
        // refresh() will work with the undefined value, later
        code.push('}');
      };
    },
    /**
     * Emit code to store the value of an inheritable property
     *
     * @param code {String[]} String array to append the code to
     * @param config {Object} The property configuration map
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     */
    __I : function(code, config, name, variant){

      code.push('if(computed===undefined||computed===inherit){');
      if(variant === "refresh"){

        code.push('computed=value;');
      } else {

        code.push('var pa=this.getLayoutParent();if(pa)computed=pa.', this.$$store.inherit[name], ';');
      };
      // Fallback to init value if inheritance was unsuccessful
      code.push('if((computed===undefined||computed===inherit)&&');
      code.push('this.', this.$$store.init[name], '!==undefined&&');
      code.push('this.', this.$$store.init[name], '!==inherit){');
      code.push('computed=this.', this.$$store.init[name], ';');
      code.push('this.', this.$$store.useinit[name], '=true;');
      code.push('}else{');
      code.push('delete this.', this.$$store.useinit[name], ';}');
      code.push('}');
      // Compare old/new computed value
      code.push('if(old===computed)return value;');
      // Note: At this point computed can be "inherit" or "undefined".
      // Normalize "inherit" to undefined and delete inherited value
      code.push('if(computed===inherit){');
      code.push('computed=undefined;delete this.', this.$$store.inherit[name], ';');
      code.push('}');
      // Only delete inherited value
      code.push('else if(computed===undefined)');
      code.push('delete this.', this.$$store.inherit[name], ';');
      // Store inherited value
      code.push('else this.', this.$$store.inherit[name], '=computed;');
      // Protect against normalization
      code.push('var backup=computed;');
      // After storage finally normalize computed and old value
      if(config.init !== undefined && variant !== "init"){

        code.push('if(old===undefined)old=this.', this.$$store.init[name], ";");
      } else {

        code.push('if(old===undefined)old=null;');
      };
      code.push('if(computed===undefined||computed==inherit)computed=null;');
    },
    /**
     * Emit code to normalize the old and incoming values from undefined to
     * <code>null</code>.
     *
     * @param code {String[]} String array to append the code to
     * @param config {Object} The property configuration map
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     */
    __J : function(code, config, name, variant){

      // Properties which are not inheritable have no possibility to get
      // undefined at this position. (Hint: set(), setRuntime() and setThemed() only allow non undefined values)
      if(variant !== "set" && variant !== "setRuntime" && variant !== "setThemed"){

        code.push('if(computed===undefined)computed=null;');
      };
      // Compare old/new computed value
      code.push('if(old===computed)return value;');
      // Normalize old value
      if(config.init !== undefined && variant !== "init"){

        code.push('if(old===undefined)old=this.', this.$$store.init[name], ";");
      } else {

        code.push('if(old===undefined)old=null;');
      };
    },
    /**
     * Emit code to call the apply method and fire the change event
     *
     * @param code {String[]} String array to append the code to
     * @param config {Object} The property configuration map
     * @param name {String} name of the property
     * @param variant {String} variant of the method e.g. setThemed
     */
    __K : function(code, config, name, variant){

      // Execute user configured setter
      if(config.apply){

        code.push('this.', config.apply, '(computed, old, "', name, '", "', variant, '");');
      };
      // Fire event
      if(config.event){

        code.push("var reg=qx.event.Registration;", "if(reg.hasListener(this, '", config.event, "')){", "reg.fireEvent(this, '", config.event, "', qx.event.type.Data, [computed, old]", ")}");
      };
    },
    /**
     * Emit code to update the inherited values of child objects
     *
     * @param code {String[]} String array to append the code to
     * @param name {String} name of the property
     */
    __L : function(code, name){

      code.push('var a=this._getChildren();if(a)for(var i=0,l=a.length;i<l;i++){');
      code.push('if(a[i].', this.$$method.refresh[name], ')a[i].', this.$$method.refresh[name], '(backup);');
      code.push('}');
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */
/**
 * This class is one of the most important parts of qooxdoo's
 * object-oriented features.
 *
 * Its {@link #define} method is used to create qooxdoo classes.
 *
 * Each instance of a class defined by {@link #define} has
 * the following keys attached to the constructor and the prototype:
 *
 * <table>
 * <tr><th><code>classname</code></th><td>The fully-qualified name of the class (e.g. <code>"qx.ui.core.Widget"</code>).</td></tr>
 * <tr><th><code>basename</code></th><td>The namespace part of the class name (e.g. <code>"qx.ui.core"</code>).</td></tr>
 * <tr><th><code>constructor</code></th><td>A reference to the constructor of the class.</td></tr>
 * <tr><th><code>superclass</code></th><td>A reference to the constructor of the super class.</td></tr>
 * </table>
 *
 * Each method may access static members of the same class by using
 * <code>this.self(arguments)</code> ({@link qx.core.Object#self}):
 * <pre class='javascript'>
 * statics : { FOO : "bar" },
 * members: {
 *   baz: function(x) {
 *     this.self(arguments).FOO;
 *     ...
 *   }
 * }
 * </pre>
 *
 * Each overriding method may call the overridden method by using
 * <code>this.base(arguments [, ...])</code> ({@link qx.core.Object#base}). This is also true for calling
 * the constructor of the superclass.
 * <pre class='javascript'>
 * members: {
 *   foo: function(x) {
 *     this.base(arguments, x);
 *     ...
 *   }
 * }
 * </pre>
 *
 * By using <code>qx.Class</code> within an app, the native JS data types are
 * conveniently polyfilled according to {@link qx.lang.normalize}.
 *
 * @require(qx.Interface)
 * @require(qx.Mixin)
 * @require(qx.lang.normalize.Array)
 * @require(qx.lang.normalize.Date)
 * @require(qx.lang.normalize.Error)
 * @require(qx.lang.normalize.Function)
 * @require(qx.lang.normalize.String)
 * @require(qx.lang.normalize.Object)
 */
qx.Bootstrap.define("qx.Class", {
  statics : {
    /**
     * A static reference to the property implementation in the case it
     * should be included.
     */
    __M : qx.core.Environment.get("module.property") ? qx.core.Property : null,
    /*
    ---------------------------------------------------------------------------
       PUBLIC METHODS
    ---------------------------------------------------------------------------
    */
    /**
     * Define a new class using the qooxdoo class system. This sets up the
     * namespace for the class and generates the class from the definition map.
     *
     * Example:
     * <pre class='javascript'>
     * qx.Class.define("name",
     * {
     *   extend : Object, // superclass
     *   implement : [Interfaces],
     *   include : [Mixins],
     *
     *   statics:
     *   {
     *     CONSTANT : 3.141,
     *
     *     publicMethod: function() {},
     *     _protectedMethod: function() {},
     *     __privateMethod: function() {}
     *   },
     *
     *   properties:
     *   {
     *     "tabIndex": { check: "Number", init : -1 }
     *   },
     *
     *   members:
     *   {
     *     publicField: "foo",
     *     publicMethod: function() {},
     *
     *     _protectedField: "bar",
     *     _protectedMethod: function() {},
     *
     *     __privateField: "baz",
     *     __privateMethod: function() {}
     *   }
     * });
     * </pre>
     *
     * @param name {String?null} Name of the class. If <code>null</code>, the class
     *   will not be added to any namespace which could be handy for testing.
     * @param config {Map ? null} Class definition structure. The configuration map has the following keys:
     *     <table>
     *       <tr><th>Name</th><th>Type</th><th>Description</th></tr>
     *       <tr><th>type</th><td>String</td><td>
     *           Type of the class. Valid types are "abstract", "static" and "singleton".
     *           If unset it defaults to a regular non-static class.
     *       </td></tr>
     *       <tr><th>extend</th><td>Class</td><td>The super class the current class inherits from.</td></tr>
     *       <tr><th>implement</th><td>Interface | Interface[]</td><td>Single interface or array of interfaces the class implements.</td></tr>
     *       <tr><th>include</th><td>Mixin | Mixin[]</td><td>Single mixin or array of mixins, which will be merged into the class.</td></tr>
     *       <tr><th>construct</th><td>Function</td><td>The constructor of the class.</td></tr>
     *       <tr><th>statics</th><td>Map</td><td>Map of static members of the class.</td></tr>
     *       <tr><th>properties</th><td>Map</td><td>Map of property definitions. For a description of the format of a property definition see
     *           {@link qx.core.Property}.</td></tr>
     *       <tr><th>members</th><td>Map</td><td>Map of instance members of the class.</td></tr>
     *       <tr><th>environment</th><td>Map</td><td>Map of environment settings for this class. For a description of the format of a setting see
     *           {@link qx.core.Environment}.</td></tr>
     *       <tr><th>events</th><td>Map</td><td>
     *           Map of events the class fires. The keys are the names of the events and the values are the
     *           corresponding event type class names.
     *       </td></tr>
     *       <tr><th>defer</th><td>Function</td><td>Function that is called at the end of processing the class declaration. It allows access to the declared statics, members and properties.</td></tr>
     *       <tr><th>destruct</th><td>Function</td><td>The destructor of the class.</td></tr>
     *     </table>
     * @return {Class} The defined class
     */
    define : function(name, config){

      if(!config){

        config = {
        };
      };
      // Normalize include to array
      if(config.include && !(qx.Bootstrap.getClass(config.include) === "Array")){

        config.include = [config.include];
      };
      // Normalize implement to array
      if(config.implement && !(qx.Bootstrap.getClass(config.implement) === "Array")){

        config.implement = [config.implement];
      };
      // Normalize type
      var implicitType = false;
      if(!config.hasOwnProperty("extend") && !config.type){

        config.type = "static";
        implicitType = true;
      };
      // Validate incoming data
      if(qx.core.Environment.get("qx.debug")){

        try{

          this.__j(name, config);
        } catch(ex) {

          if(implicitType){

            ex.message = 'Assumed static class because no "extend" key was found. ' + ex.message;
          };
          throw ex;
        };
      };
      // Create the class
      var clazz = this.__P(name, config.type, config.extend, config.statics, config.construct, config.destruct, config.include);
      // Members, properties, events and mixins are only allowed for non-static classes
      if(config.extend){

        // Attach properties
        if(config.properties){

          this.__R(clazz, config.properties, true);
        };
        // Attach members
        if(config.members){

          this.__T(clazz, config.members, true, true, false);
        };
        // Process events
        if(config.events){

          this.__Q(clazz, config.events, true);
        };
        // Include mixins
        // Must be the last here to detect conflicts
        if(config.include){

          for(var i = 0,l = config.include.length;i < l;i++){

            this.__X(clazz, config.include[i], false);
          };
        };
      } else if(config.hasOwnProperty('extend') && qx.core.Environment.get("qx.debug")){

        throw new Error('"extend" parameter is null or undefined');
      };
      // Process environment
      if(config.environment){

        for(var key in config.environment){

          qx.core.Environment.add(key, config.environment[key]);
        };
      };
      // Interface support for non-static classes
      if(config.implement){

        for(var i = 0,l = config.implement.length;i < l;i++){

          this.__V(clazz, config.implement[i]);
        };
      };
      if(qx.core.Environment.get("qx.debug")){

        this.__O(clazz);
      };
      // Process defer
      if(config.defer){

        config.defer.self = clazz;
        config.defer(clazz, clazz.prototype, {
          add : function(name, config){

            // build pseudo properties map
            var properties = {
            };
            properties[name] = config;
            // execute generic property handler
            qx.Class.__R(clazz, properties, true);
          }
        });
      };
      return clazz;
    },
    /**
     * Removes a class from qooxdoo defined by {@link #define}
     *
     * @param name {String} Name of the class
     */
    undefine : function(name){

      // first, delete the class from the registry
      delete this.$$registry[name];
      // delete the class reference from the namespaces and all empty namespaces
      var ns = name.split(".");
      // build up an array containing all namespace objects including window
      var objects = [window];
      for(var i = 0;i < ns.length;i++){

        objects.push(objects[i][ns[i]]);
      };
      // go through all objects and check for the constructor or empty namespaces
      for(var i = objects.length - 1;i >= 1;i--){

        var last = objects[i];
        var parent = objects[i - 1];
        if(qx.Bootstrap.isFunction(last) || qx.Bootstrap.objectGetLength(last) === 0){

          delete parent[ns[i - 1]];
        } else {

          break;
        };
      };
    },
    /**
     * Whether the given class exists
     *
     * @signature function(name)
     * @param name {String} class name to check
     * @return {Boolean} true if class exists
     */
    isDefined : qx.util.OOUtil.classIsDefined,
    /**
     * Determine the total number of classes
     *
     * @return {Number} the total number of classes
     */
    getTotalNumber : function(){

      return qx.Bootstrap.objectGetLength(this.$$registry);
    },
    /**
     * Find a class by its name
     *
     * @signature function(name)
     * @param name {String} class name to resolve
     * @return {Class} the class
     */
    getByName : qx.Bootstrap.getByName,
    /**
     * Include all features of the given mixin into the class. The mixin must
     * not include any methods or properties that are already available in the
     * class. This would only be possible using the {@link #patch} method.
     *
     * @param clazz {Class} An existing class which should be augmented by including a mixin.
     * @param mixin {Mixin} The mixin to be included.
     */
    include : function(clazz, mixin){

      if(qx.core.Environment.get("qx.debug")){

        if(!mixin){

          throw new Error("The mixin to include into class '" + clazz.classname + "' is undefined/null!");
        };
        qx.Mixin.isCompatible(mixin, clazz);
      };
      qx.Class.__X(clazz, mixin, false);
    },
    /**
     * Include all features of the given mixin into the class. The mixin may
     * include features, which are already defined in the target class. Existing
     * features of equal name will be overwritten.
     * Please keep in mind that this functionality is not intended for regular
     * use, but as a formalized way (and a last resort) in order to patch
     * existing classes.
     *
     * <b>WARNING</b>: You may break working classes and features.
     *
     * @param clazz {Class} An existing class which should be modified by including a mixin.
     * @param mixin {Mixin} The mixin to be included.
     */
    patch : function(clazz, mixin){

      if(qx.core.Environment.get("qx.debug")){

        if(!mixin){

          throw new Error("The mixin to patch class '" + clazz.classname + "' is undefined/null!");
        };
        qx.Mixin.isCompatible(mixin, clazz);
      };
      qx.Class.__X(clazz, mixin, true);
    },
    /**
     * Whether a class is a direct or indirect sub class of another class,
     * or both classes coincide.
     *
     * @param clazz {Class} the class to check.
     * @param superClass {Class} the potential super class
     * @return {Boolean} whether clazz is a sub class of superClass.
     */
    isSubClassOf : function(clazz, superClass){

      if(!clazz){

        return false;
      };
      if(clazz == superClass){

        return true;
      };
      if(clazz.prototype instanceof superClass){

        return true;
      };
      return false;
    },
    /**
     * Returns the definition of the given property. Returns null
     * if the property does not exist.
     *
     * @signature function(clazz, name)
     * @param clazz {Class} class to check
     * @param name {String} name of the class to check for
     * @return {Map|null} whether the object support the given event.
     */
    getPropertyDefinition : qx.util.OOUtil.getPropertyDefinition,
    /**
     * Returns a list of all properties supported by the given class
     *
     * @param clazz {Class} Class to query
     * @return {String[]} List of all property names
     */
    getProperties : function(clazz){

      var list = [];
      while(clazz){

        if(clazz.$$properties){

          list.push.apply(list, Object.keys(clazz.$$properties));
        };
        clazz = clazz.superclass;
      };
      return list;
    },
    /**
     * Returns the class or one of its superclasses which contains the
     * declaration for the given property in its class definition. Returns null
     * if the property is not specified anywhere.
     *
     * @param clazz {Class} class to look for the property
     * @param name {String} name of the property
     * @return {Class | null} The class which includes the property
     */
    getByProperty : function(clazz, name){

      while(clazz){

        if(clazz.$$properties && clazz.$$properties[name]){

          return clazz;
        };
        clazz = clazz.superclass;
      };
      return null;
    },
    /**
     * Whether a class has the given property
     *
     * @signature function(clazz, name)
     * @param clazz {Class} class to check
     * @param name {String} name of the property to check for
     * @return {Boolean} whether the class includes the given property.
     */
    hasProperty : qx.util.OOUtil.hasProperty,
    /**
     * Returns the event type of the given event. Returns null if
     * the event does not exist.
     *
     * @signature function(clazz, name)
     * @param clazz {Class} class to check
     * @param name {String} name of the event
     * @return {String|null} Event type of the given event.
     */
    getEventType : qx.util.OOUtil.getEventType,
    /**
     * Whether a class supports the given event type
     *
     * @signature function(clazz, name)
     * @param clazz {Class} class to check
     * @param name {String} name of the event to check for
     * @return {Boolean} whether the class supports the given event.
     */
    supportsEvent : qx.util.OOUtil.supportsEvent,
    /**
     * Whether a class directly includes a mixin.
     *
     * @param clazz {Class} class to check
     * @param mixin {Mixin} the mixin to check for
     * @return {Boolean} whether the class includes the mixin directly.
     */
    hasOwnMixin : function(clazz, mixin){

      return clazz.$$includes && clazz.$$includes.indexOf(mixin) !== -1;
    },
    /**
     * Returns the class or one of its superclasses which contains the
     * declaration for the given mixin. Returns null if the mixin is not
     * specified anywhere.
     *
     * @param clazz {Class} class to look for the mixin
     * @param mixin {Mixin} mixin to look for
     * @return {Class | null} The class which directly includes the given mixin
     */
    getByMixin : function(clazz, mixin){

      var list,i,l;
      while(clazz){

        if(clazz.$$includes){

          list = clazz.$$flatIncludes;
          for(i = 0,l = list.length;i < l;i++){

            if(list[i] === mixin){

              return clazz;
            };
          };
        };
        clazz = clazz.superclass;
      };
      return null;
    },
    /**
     * Returns a list of all mixins available in a given class.
     *
     * @signature function(clazz)
     * @param clazz {Class} class which should be inspected
     * @return {Mixin[]} array of mixins this class uses
     */
    getMixins : qx.util.OOUtil.getMixins,
    /**
     * Whether a given class or any of its superclasses includes a given mixin.
     *
     * @param clazz {Class} class to check
     * @param mixin {Mixin} the mixin to check for
     * @return {Boolean} whether the class includes the mixin.
     */
    hasMixin : function(clazz, mixin){

      return !!this.getByMixin(clazz, mixin);
    },
    /**
     * Whether a given class directly includes an interface.
     *
     * This function will only return "true" if the interface was defined
     * in the class declaration ({@link qx.Class#define}) using the "implement"
     * key.
     *
     * @param clazz {Class} class or instance to check
     * @param iface {Interface} the interface to check for
     * @return {Boolean} whether the class includes the mixin directly.
     */
    hasOwnInterface : function(clazz, iface){

      return clazz.$$implements && clazz.$$implements.indexOf(iface) !== -1;
    },
    /**
     * Returns the class or one of its super classes which contains the
     * declaration of the given interface. Returns null if the interface is not
     * specified anywhere.
     *
     * @signature function(clazz, iface)
     * @param clazz {Class} class to look for the interface
     * @param iface {Interface} interface to look for
     * @return {Class | null} the class which directly implements the given interface
     */
    getByInterface : qx.util.OOUtil.getByInterface,
    /**
     * Returns a list of all interfaces a given class has to implement.
     *
     * @param clazz {Class} class which should be inspected
     * @return {Interface[]} array of interfaces this class implements
     */
    getInterfaces : function(clazz){

      var list = [];
      while(clazz){

        if(clazz.$$implements){

          list.push.apply(list, clazz.$$flatImplements);
        };
        clazz = clazz.superclass;
      };
      return list;
    },
    /**
     * Whether a given class or any of its super classes includes a given interface.
     *
     * This function will return "true" if the interface was defined
     * in the class declaration ({@link qx.Class#define}) of the class
     * or any of its super classes using the "implement"
     * key.
     *
     * @signature function(clazz, iface)
     * @param clazz {Class} class to check
     * @param iface {Interface} the interface to check for
     * @return {Boolean} whether the class includes the interface.
     */
    hasInterface : qx.util.OOUtil.hasInterface,
    /**
     * Whether a given class complies to an interface.
     *
     * Checks whether all methods defined in the interface are
     * implemented. The class does not need to implement
     * the interface explicitly in the <code>extend</code> key.
     *
     * @param obj {Object} class to check
     * @param iface {Interface} the interface to check for
     * @return {Boolean} whether the class conforms to the interface.
     */
    implementsInterface : function(obj, iface){

      var clazz = obj.constructor;
      if(this.hasInterface(clazz, iface)){

        return true;
      };
      if(qx.Interface.objectImplements(obj, iface)){

        return true;
      };
      if(qx.Interface.classImplements(clazz, iface)){

        return true;
      };
      return false;
    },
    /**
     * Helper method to handle singletons
     *
     * @internal
     * @return {Object} The singleton instance
     */
    getInstance : function(){

      if(!this.$$instance){

        this.$$allowconstruct = true;
        this.$$instance = new this();
        delete this.$$allowconstruct;
      };
      return this.$$instance;
    },
    /*
    ---------------------------------------------------------------------------
       PRIVATE/INTERNAL BASICS
    ---------------------------------------------------------------------------
    */
    /**
     * This method will be attached to all classes to return
     * a nice identifier for them.
     *
     * @internal
     * @return {String} The class identifier
     */
    genericToString : function(){

      return "[Class " + this.classname + "]";
    },
    /** Stores all defined classes */
    $$registry : qx.Bootstrap.$$registry,
    /** @type {Map} allowed keys in non-static class definition */
    __i : qx.core.Environment.select("qx.debug", {
      "true" : {
        "type" : "string",
        // String
        "extend" : "function",
        // Function
        "implement" : "object",
        // Interface[]
        "include" : "object",
        // Mixin[]
        "construct" : "function",
        // Function
        "statics" : "object",
        // Map
        "properties" : "object",
        // Map
        "members" : "object",
        // Map
        "environment" : "object",
        // Map
        "events" : "object",
        // Map
        "defer" : "function",
        // Function
        "destruct" : "function"
      },
      "default" : null
    }),
    /** @type {Map} allowed keys in static class definition */
    __N : qx.core.Environment.select("qx.debug", {
      "true" : {
        "type" : "string",
        // String
        "statics" : "object",
        // Map
        "environment" : "object",
        // Map
        "defer" : "function"
      },
      "default" : null
    }),
    /**
     * Validates an incoming configuration and checks for proper keys and values
     *
     * @signature function(name, config)
     * @param name {String} The name of the class
     * @param config {Map} Configuration map
     */
    __j : qx.core.Environment.select("qx.debug", {
      "true" : function(name, config){

        // Validate type
        if(config.type && !(config.type === "static" || config.type === "abstract" || config.type === "singleton")){

          throw new Error('Invalid type "' + config.type + '" definition for class "' + name + '"!');
        };
        // Validate non-static class on the "extend" key
        if(config.type && config.type !== "static" && !config.extend){

          throw new Error('Invalid config in class "' + name + '"! Every non-static class has to extend at least the "qx.core.Object" class.');
        };
        // Validate keys
        var allowed = config.type === "static" ? this.__N : this.__i;
        for(var key in config){

          if(!allowed[key]){

            throw new Error('The configuration key "' + key + '" in class "' + name + '" is not allowed!');
          };
          if(config[key] == null){

            throw new Error('Invalid key "' + key + '" in class "' + name + '"! The value is undefined/null!');
          };
          if(typeof config[key] !== allowed[key]){

            throw new Error('Invalid type of key "' + key + '" in class "' + name + '"! The type of the key must be "' + allowed[key] + '"!');
          };
        };
        // Validate maps
        var maps = ["statics", "properties", "members", "environment", "settings", "variants", "events"];
        for(var i = 0,l = maps.length;i < l;i++){

          var key = maps[i];
          if(config[key] !== undefined && (config[key].$$hash !== undefined || !qx.Bootstrap.isObject(config[key]))){

            throw new Error('Invalid key "' + key + '" in class "' + name + '"! The value needs to be a map!');
          };
        };
        // Validate include definition
        if(config.include){

          if(qx.Bootstrap.getClass(config.include) === "Array"){

            for(var i = 0,a = config.include,l = a.length;i < l;i++){

              if(a[i] == null || a[i].$$type !== "Mixin"){

                throw new Error('The include definition in class "' + name + '" contains an invalid mixin at position ' + i + ': ' + a[i]);
              };
            };
          } else {

            throw new Error('Invalid include definition in class "' + name + '"! Only mixins and arrays of mixins are allowed!');
          };
        };
        // Validate implement definition
        if(config.implement){

          if(qx.Bootstrap.getClass(config.implement) === "Array"){

            for(var i = 0,a = config.implement,l = a.length;i < l;i++){

              if(a[i] == null || a[i].$$type !== "Interface"){

                throw new Error('The implement definition in class "' + name + '" contains an invalid interface at position ' + i + ': ' + a[i]);
              };
            };
          } else {

            throw new Error('Invalid implement definition in class "' + name + '"! Only interfaces and arrays of interfaces are allowed!');
          };
        };
        // Check mixin compatibility
        if(config.include){

          try{

            qx.Mixin.checkCompatibility(config.include);
          } catch(ex) {

            throw new Error('Error in include definition of class "' + name + '"! ' + ex.message);
          };
        };
        // Validate environment
        if(config.environment){

          for(var key in config.environment){

            if(key.substr(0, key.indexOf(".")) != name.substr(0, name.indexOf("."))){

              throw new Error('Forbidden environment setting "' + key + '" found in "' + name + '". It is forbidden to define a ' + 'environment setting for an external namespace!');
            };
          };
        };
        // Validate settings
        if(config.settings){

          for(var key in config.settings){

            if(key.substr(0, key.indexOf(".")) != name.substr(0, name.indexOf("."))){

              throw new Error('Forbidden setting "' + key + '" found in "' + name + '". It is forbidden to define a default setting for an external namespace!');
            };
          };
        };
        // Validate variants
        if(config.variants){

          for(var key in config.variants){

            if(key.substr(0, key.indexOf(".")) != name.substr(0, name.indexOf("."))){

              throw new Error('Forbidden variant "' + key + '" found in "' + name + '". It is forbidden to define a variant for an external namespace!');
            };
          };
        };
      },
      "default" : function(name, config){
      }
    }),
    /**
     * Validates the interfaces required by abstract base classes
     *
     * @signature function(clazz)
     * @param clazz {Class} The configured class.
     */
    __O : qx.core.Environment.select("qx.debug", {
      "true" : function(clazz){

        var superclass = clazz.superclass;
        while(superclass){

          if(superclass.$$classtype !== "abstract"){

            break;
          };
          var interfaces = superclass.$$implements;
          if(interfaces){

            for(var i = 0;i < interfaces.length;i++){

              qx.Interface.assert(clazz, interfaces[i], true);
            };
          };
          superclass = superclass.superclass;
        };
      },
      "default" : function(clazz){
      }
    }),
    /**
     * Creates a class by type. Supports modern inheritance etc.
     *
     * @param name {String} Full name of the class
     * @param type {String} type of the class, i.e. "static", "abstract" or "singleton"
     * @param extend {Class} Superclass to inherit from
     * @param statics {Map} Static methods or fields
     * @param construct {Function} Constructor of the class
     * @param destruct {Function} Destructor of the class
     * @param mixins {Mixin[]} array of mixins of the class
     * @return {Class} The generated class
     */
    __P : function(name, type, extend, statics, construct, destruct, mixins){

      var clazz;
      if(!extend && qx.core.Environment.get("qx.aspects") == false){

        // Create empty/non-empty class
        clazz = statics || {
        };
        qx.Bootstrap.setDisplayNames(clazz, name);
      } else {

        clazz = {
        };
        if(extend){

          // Create default constructor
          if(!construct){

            construct = this.__Y();
          };
          if(this.__bb(extend, mixins)){

            clazz = this.__bc(construct, name, type);
          } else {

            clazz = construct;
          };
          // Add singleton getInstance()
          if(type === "singleton"){

            clazz.getInstance = this.getInstance;
          };
          qx.Bootstrap.setDisplayName(construct, name, "constructor");
        };
        // Copy statics
        if(statics){

          qx.Bootstrap.setDisplayNames(statics, name);
          var key;
          for(var i = 0,a = Object.keys(statics),l = a.length;i < l;i++){

            key = a[i];
            var staticValue = statics[key];
            if(qx.core.Environment.get("qx.aspects")){

              if(staticValue instanceof Function){

                staticValue = qx.core.Aspect.wrap(name + "." + key, staticValue, "static");
              };
              clazz[key] = staticValue;
            } else {

              clazz[key] = staticValue;
            };
          };
        };
      };
      // Create namespace
      var basename = name ? qx.Bootstrap.createNamespace(name, clazz) : "";
      // Store names in constructor/object
      clazz.name = clazz.classname = name;
      clazz.basename = basename;
      // Store type info
      clazz.$$type = "Class";
      if(type){

        clazz.$$classtype = type;
      };
      // Attach toString
      if(!clazz.hasOwnProperty("toString")){

        clazz.toString = this.genericToString;
      };
      if(extend){

        qx.Bootstrap.extendClass(clazz, construct, extend, name, basename);
        // Store destruct onto class
        if(destruct){

          if(qx.core.Environment.get("qx.aspects")){

            destruct = qx.core.Aspect.wrap(name, destruct, "destructor");
          };
          clazz.$$destructor = destruct;
          qx.Bootstrap.setDisplayName(destruct, name, "destruct");
        };
      };
      // Store class reference in global class registry
      this.$$registry[name] = clazz;
      // Return final class object
      return clazz;
    },
    /*
    ---------------------------------------------------------------------------
       PRIVATE ADD HELPERS
    ---------------------------------------------------------------------------
    */
    /**
     * Attach events to the class
     *
     * @param clazz {Class} class to add the events to
     * @param events {Map} map of event names the class fires.
     * @param patch {Boolean ? false} Enable redefinition of event type?
     */
    __Q : function(clazz, events, patch){

      if(qx.core.Environment.get("qx.debug")){

        if(typeof events !== "object" || qx.Bootstrap.getClass(events) === "Array"){

          throw new Error(clazz.classname + ": the events must be defined as map!");
        };
        for(var key in events){

          if(typeof events[key] !== "string"){

            throw new Error(clazz.classname + "/" + key + ": the event value needs to be a string with the class name of the event object which will be fired.");
          };
        };
        // Compare old and new event type/value if patching is disabled
        if(clazz.$$events && patch !== true){

          for(var key in events){

            if(clazz.$$events[key] !== undefined && clazz.$$events[key] !== events[key]){

              throw new Error(clazz.classname + "/" + key + ": the event value/type cannot be changed from " + clazz.$$events[key] + " to " + events[key]);
            };
          };
        };
      };
      if(clazz.$$events){

        for(var key in events){

          clazz.$$events[key] = events[key];
        };
      } else {

        clazz.$$events = events;
      };
    },
    /**
     * Attach properties to classes
     *
     * @param clazz {Class} class to add the properties to
     * @param properties {Map} map of properties
     * @param patch {Boolean ? false} Overwrite property with the limitations of a property
               which means you are able to refine but not to replace (esp. for new properties)
     */
    __R : function(clazz, properties, patch){

      // check for the property module
      if(!qx.core.Environment.get("module.property")){

        throw new Error("Property module disabled.");
      };
      var config;
      if(patch === undefined){

        patch = false;
      };
      var proto = clazz.prototype;
      for(var name in properties){

        config = properties[name];
        // Check incoming configuration
        if(qx.core.Environment.get("qx.debug")){

          this.__S(clazz, name, config, patch);
        };
        // Store name into configuration
        config.name = name;
        // Add config to local registry
        if(!config.refine){

          if(clazz.$$properties === undefined){

            clazz.$$properties = {
            };
          };
          clazz.$$properties[name] = config;
        };
        // Store init value to prototype. This makes it possible to
        // overwrite this value in derived classes.
        if(config.init !== undefined){

          clazz.prototype["$$init_" + name] = config.init;
        };
        // register event name
        if(config.event !== undefined){

          // break if no events layer loaded
          if(!qx.core.Environment.get("module.events")){

            throw new Error("Events module not enabled.");
          };
          var event = {
          };
          event[config.event] = "qx.event.type.Data";
          this.__Q(clazz, event, patch);
        };
        // Remember inheritable properties
        if(config.inheritable){

          this.__M.$$inheritable[name] = true;
          if(!proto.$$refreshInheritables){

            this.__M.attachRefreshInheritables(clazz);
          };
        };
        if(!config.refine){

          this.__M.attachMethods(clazz, name, config);
        };
      };
    },
    /**
     * Validates the given property
     *
     * @signature function(clazz, name, config, patch)
     * @param clazz {Class} class to add property to
     * @param name {String} name of the property
     * @param config {Map} configuration map
     * @param patch {Boolean ? false} enable refine/patch?
     */
    __S : qx.core.Environment.select("qx.debug", {
      "true" : function(clazz, name, config, patch){

        // check for properties
        if(!qx.core.Environment.get("module.property")){

          throw new Error("Property module disabled.");
        };
        var has = this.hasProperty(clazz, name);
        if(has){

          var existingProperty = this.getPropertyDefinition(clazz, name);
          if(config.refine && existingProperty.init === undefined){

            throw new Error("Could not refine an init value if there was previously no init value defined. Property '" + name + "' of class '" + clazz.classname + "'.");
          };
        };
        if(!has && config.refine){

          throw new Error("Could not refine non-existent property: '" + name + "' of class: '" + clazz.classname + "'!");
        };
        if(has && !patch){

          throw new Error("Class " + clazz.classname + " already has a property: " + name + "!");
        };
        if(has && patch){

          if(!config.refine){

            throw new Error('Could not refine property "' + name + '" without a "refine" flag in the property definition! This class: ' + clazz.classname + ', original class: ' + this.getByProperty(clazz, name).classname + '.');
          };
          for(var key in config){

            if(key !== "init" && key !== "refine"){

              throw new Error("Class " + clazz.classname + " could not refine property: " + name + "! Key: " + key + " could not be refined!");
            };
          };
        };
        // Check 0.7 keys
        var allowed = config.group ? this.__M.$$allowedGroupKeys : this.__M.$$allowedKeys;
        for(var key in config){

          if(allowed[key] === undefined){

            throw new Error('The configuration key "' + key + '" of property "' + name + '" in class "' + clazz.classname + '" is not allowed!');
          };
          if(config[key] === undefined){

            throw new Error('Invalid key "' + key + '" of property "' + name + '" in class "' + clazz.classname + '"! The value is undefined: ' + config[key]);
          };
          if(allowed[key] !== null && typeof config[key] !== allowed[key]){

            throw new Error('Invalid type of key "' + key + '" of property "' + name + '" in class "' + clazz.classname + '"! The type of the key must be "' + allowed[key] + '"!');
          };
        };
        if(config.transform != null){

          if(!(typeof config.transform == "string")){

            throw new Error('Invalid transform definition of property "' + name + '" in class "' + clazz.classname + '"! Needs to be a String.');
          };
        };
        if(config.check != null){

          if(!qx.Bootstrap.isString(config.check) && !qx.Bootstrap.isArray(config.check) && !qx.Bootstrap.isFunction(config.check)){

            throw new Error('Invalid check definition of property "' + name + '" in class "' + clazz.classname + '"! Needs to be a String, Array or Function.');
          };
        };
      },
      "default" : null
    }),
    /**
     * Attach members to a class
     *
     * @param clazz {Class} clazz to add members to
     * @param members {Map} The map of members to attach
     * @param patch {Boolean ? false} Enable patching of
     * @param base {Boolean ? true} Attach base flag to mark function as members
     *     of this class
     * @param wrap {Boolean ? false} Whether the member method should be wrapped.
     *     this is needed to allow base calls in patched mixin members.
     */
    __T : function(clazz, members, patch, base, wrap){

      var proto = clazz.prototype;
      var key,member;
      qx.Bootstrap.setDisplayNames(members, clazz.classname + ".prototype");
      for(var i = 0,a = Object.keys(members),l = a.length;i < l;i++){

        key = a[i];
        member = members[key];
        if(qx.core.Environment.get("qx.debug")){

          if(proto[key] !== undefined && key.charAt(0) == "_" && key.charAt(1) == "_"){

            throw new Error('Overwriting private member "' + key + '" of Class "' + clazz.classname + '" is not allowed!');
          };
          if(patch !== true && proto.hasOwnProperty(key)){

            throw new Error('Overwriting member "' + key + '" of Class "' + clazz.classname + '" is not allowed!');
          };
          if(proto[key] != undefined && proto[key].$$propertyMethod){

            throw new Error('Overwriting generated property method "' + key + '" of Class "' + clazz.classname + '" is not allowed!');
          };
        };
        // Added helper stuff to functions
        // Hint: Could not use typeof function because RegExp objects are functions, too
        // Protect to apply base property and aspect support on special attributes e.g.
        // classes which are function like as well.
        if(base !== false && member instanceof Function && member.$$type == null){

          if(wrap == true){

            // wrap "patched" mixin member
            member = this.__U(member, proto[key]);
          } else {

            // Configure extend (named base here)
            // Hint: proto[key] is not yet overwritten here
            if(proto[key]){

              member.base = proto[key];
            };
            member.self = clazz;
          };
          if(qx.core.Environment.get("qx.aspects")){

            member = qx.core.Aspect.wrap(clazz.classname + "." + key, member, "member");
          };
        };
        // Attach member
        proto[key] = member;
      };
    },
    /**
     * Wraps a member function of a mixin, which is included using "patch". This
     * allows "base" calls in the mixin member function.
     *
     * @param member {Function} The mixin method to wrap
     * @param base {Function} The overwritten method
     * @return {Function} the wrapped mixin member
     */
    __U : function(member, base){

      if(base){

        return function(){

          var oldBase = member.base;
          member.base = base;
          var retval = member.apply(this, arguments);
          member.base = oldBase;
          return retval;
        };
      } else {

        return member;
      };
    },
    /**
     * Add a single interface to a class
     *
     * @param clazz {Class} class to add interface to
     * @param iface {Interface} the Interface to add
     */
    __V : function(clazz, iface){

      if(qx.core.Environment.get("qx.debug")){

        if(!clazz || !iface){

          throw new Error("Incomplete parameters!");
        };
        // This differs from mixins, we only check if the interface is already
        // directly used by this class. It is allowed however, to have an interface
        // included multiple times by extends in the interfaces etc.
        if(this.hasOwnInterface(clazz, iface)){

          throw new Error('Interface "' + iface.name + '" is already used by Class "' + clazz.classname + '!');
        };
        // Check interface and wrap members
        if(clazz.$$classtype !== "abstract"){

          qx.Interface.assert(clazz, iface, true);
        };
      };
      // Store interface reference
      var list = qx.Interface.flatten([iface]);
      if(clazz.$$implements){

        clazz.$$implements.push(iface);
        clazz.$$flatImplements.push.apply(clazz.$$flatImplements, list);
      } else {

        clazz.$$implements = [iface];
        clazz.$$flatImplements = list;
      };
    },
    /**
     * Wrap the constructor of an already existing clazz. This function will
     * replace all references to the existing constructor with the new wrapped
     * constructor.
     *
     * @param clazz {Class} The class to wrap
     * @return {Class} The wrapped class
     */
    __W : function(clazz){

      var name = clazz.classname;
      var wrapper = this.__bc(clazz, name, clazz.$$classtype);
      // copy all keys from the wrapped constructor to the wrapper
      for(var i = 0,a = Object.keys(clazz),l = a.length;i < l;i++){

        key = a[i];
        wrapper[key] = clazz[key];
      };
      // fix prototype
      wrapper.prototype = clazz.prototype;
      // fix self references in members
      var members = clazz.prototype;
      for(var i = 0,a = Object.keys(members),l = a.length;i < l;i++){

        key = a[i];
        var method = members[key];
        // check if method is available because null values can be stored as
        // init values on classes e.g. [BUG #3709]
        if(method && method.self == clazz){

          method.self = wrapper;
        };
      };
      // fix base and superclass references in all defined classes
      for(var key in this.$$registry){

        var construct = this.$$registry[key];
        if(!construct){

          continue;
        };
        if(construct.base == clazz){

          construct.base = wrapper;
        };
        if(construct.superclass == clazz){

          construct.superclass = wrapper;
        };
        if(construct.$$original){

          if(construct.$$original.base == clazz){

            construct.$$original.base = wrapper;
          };
          if(construct.$$original.superclass == clazz){

            construct.$$original.superclass = wrapper;
          };
        };
      };
      qx.Bootstrap.createNamespace(name, wrapper);
      this.$$registry[name] = wrapper;
      return wrapper;
    },
    /**
     * Include all features of the mixin into the given class, recursively.
     *
     * @param clazz {Class} The class onto which the mixin should be attached.
     * @param mixin {Mixin} Include all features of this mixin
     * @param patch {Boolean} Overwrite existing fields, functions and properties
     */
    __X : function(clazz, mixin, patch){

      if(qx.core.Environment.get("qx.debug")){

        if(!clazz || !mixin){

          throw new Error("Incomplete parameters!");
        };
      };
      if(this.hasMixin(clazz, mixin)){

        return;
      };
      var isConstructorWrapped = clazz.$$original;
      if(mixin.$$constructor && !isConstructorWrapped){

        clazz = this.__W(clazz);
      };
      // Attach content
      var list = qx.Mixin.flatten([mixin]);
      var entry;
      for(var i = 0,l = list.length;i < l;i++){

        entry = list[i];
        // Attach events
        if(entry.$$events){

          this.__Q(clazz, entry.$$events, patch);
        };
        // Attach properties (Properties are already readonly themselves, no patch handling needed)
        if(entry.$$properties){

          this.__R(clazz, entry.$$properties, patch);
        };
        // Attach members (Respect patch setting, but dont apply base variables)
        if(entry.$$members){

          this.__T(clazz, entry.$$members, patch, patch, patch);
        };
      };
      // Store mixin reference
      if(clazz.$$includes){

        clazz.$$includes.push(mixin);
        clazz.$$flatIncludes.push.apply(clazz.$$flatIncludes, list);
      } else {

        clazz.$$includes = [mixin];
        clazz.$$flatIncludes = list;
      };
    },
    /*
    ---------------------------------------------------------------------------
       PRIVATE FUNCTION HELPERS
    ---------------------------------------------------------------------------
    */
    /**
     * Returns the default constructor.
     * This constructor just calls the constructor of the base class.
     *
     * @return {Function} The default constructor.
     */
    __Y : function(){

      function defaultConstructor(){

        defaultConstructor.base.apply(this, arguments);
      };
      return defaultConstructor;
    },
    /**
     * Returns an empty function. This is needed to get an empty function with an empty closure.
     *
     * @return {Function} empty function
     */
    __ba : function(){

      return function(){
      };
    },
    /**
     * Checks if the constructor needs to be wrapped.
     *
     * @param base {Class} The base class.
     * @param mixins {Mixin[]} All mixins which should be included.
     * @return {Boolean} true, if the constructor needs to be wrapped.
     */
    __bb : function(base, mixins){

      if(qx.core.Environment.get("qx.debug")){

        return true;
      };
      // Check for base class mixin constructors
      if(base && base.$$includes){

        var baseMixins = base.$$flatIncludes;
        for(var i = 0,l = baseMixins.length;i < l;i++){

          if(baseMixins[i].$$constructor){

            return true;
          };
        };
      };
      // check for direct mixin constructors
      if(mixins){

        var flatMixins = qx.Mixin.flatten(mixins);
        for(var i = 0,l = flatMixins.length;i < l;i++){

          if(flatMixins[i].$$constructor){

            return true;
          };
        };
      };
      return false;
    },
    /**
     * Generate a wrapper of the original class constructor in order to enable
     * some of the advanced OO features (e.g. abstract class, singleton, mixins)
     *
     * @param construct {Function} the original constructor
     * @param name {String} name of the class
     * @param type {String} the user specified class type
     * @return {Function} The wrapped constructor
     */
    __bc : function(construct, name, type){

      var wrapper = function(){

        var clazz = wrapper;
        if(qx.core.Environment.get("qx.debug")){

          // new keyword check
          if(!(this instanceof clazz)){

            throw new Error("Please initialize '" + name + "' objects using the new keyword!");
          };
          // add abstract and singleton checks
          if(type === "abstract"){

            if(this.classname === name){

              throw new Error("The class '," + name + "' is abstract! It is not possible to instantiate it.");
            };
          } else if(type === "singleton"){

            if(!clazz.$$allowconstruct){

              throw new Error("The class '" + name + "' is a singleton! It is not possible to instantiate it directly. Use the static getInstance() method instead.");
            };
          };
        };
        // Execute default constructor
        var retval = clazz.$$original.apply(this, arguments);
        // Initialize local mixins
        if(clazz.$$includes){

          var mixins = clazz.$$flatIncludes;
          for(var i = 0,l = mixins.length;i < l;i++){

            if(mixins[i].$$constructor){

              mixins[i].$$constructor.apply(this, arguments);
            };
          };
        };
        if(qx.core.Environment.get("qx.debug")){

          // Mark instance as initialized
          if(this.classname === name){

            this.$$initialized = true;
          };
        };
        // Return optional return value
        return retval;
      };
      if(qx.core.Environment.get("qx.aspects")){

        var aspectWrapper = qx.core.Aspect.wrap(name, wrapper, "constructor");
        wrapper.$$original = construct;
        wrapper.constructor = aspectWrapper;
        wrapper = aspectWrapper;
      };
      // Store original constructor
      wrapper.$$original = construct;
      // Store wrapper into constructor (needed for base calls etc.)
      construct.wrapper = wrapper;
      // Return generated wrapper
      return wrapper;
    }
  },
  defer : function(){

    // Binding of already loaded bootstrap classes
    if(qx.core.Environment.get("qx.aspects")){

      for(var classname in qx.Bootstrap.$$registry){

        var statics = qx.Bootstrap.$$registry[classname];
        for(var key in statics){

          // only functions, no regexps
          if(statics[key] instanceof Function){

            statics[key] = qx.core.Aspect.wrap(classname + "." + key, statics[key], "static");
          };
        };
      };
    };
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * This mixin is forwarding the static methods of
 * {@link qx.data.SingleValueBinding} to the instance including the mixin.
 * The source object will be <code>this</code>.
 */
qx.Mixin.define("qx.data.MBinding", {
  members : {
    /**
     * The bind method delegates the call to the
     * {@link qx.data.SingleValueBinding#bind} function. As source, the current
     * object (this) will be used.
     *
     * @param sourcePropertyChain {String} The property chain which represents
     *   the source property.
     * @param targetObject {qx.core.Object} The object which the source should
     *   be bind to.
     * @param targetProperty {String} The property name of the target object.
     * @param options {Map} A map containing the options. See
     *   {@link qx.data.SingleValueBinding#bind} for more
     *   information.
     *
     * @return {var} Returns the internal id for that binding. This can be used
     *   for referencing the binding e.g. for removing. This is not an atomic
     *   id so you can't you use it as a hash-map index.
     *
     * @throws {qx.core.AssertionError} If the event is no data event or
     *   there is no property definition for object and property (source and
     *   target).
     */
    bind : function(sourcePropertyChain, targetObject, targetProperty, options){

      return qx.data.SingleValueBinding.bind(this, sourcePropertyChain, targetObject, targetProperty, options);
    },
    /**
     * Removes the binding with the given id from the current object. The
     * id hast to be the id returned by any of the bind functions.
     *
     * @param id {var} The id of the binding.
     * @throws {Error} If the binding could not be found.
     */
    removeBinding : function(id){

      qx.data.SingleValueBinding.removeBindingFromObject(this, id);
    },
    /**
     * Removes all bindings from the object.
     *
     * @throws {qx.core.AssertionError} If the object is not in the internal
     *   registry of the bindings.
     * @throws {Error} If one of the bindings listed internally can not be
     *   removed.
     */
    removeAllBindings : function(){

      qx.data.SingleValueBinding.removeAllBindingsForObject(this);
    },
    /**
     * Returns an array which lists all bindings for the object.
     *
     * @return {Array} An array of binding informations. Every binding
     *   information is an array itself containing id, sourceObject, sourceEvent,
     *   targetObject and targetProperty in that order.
     */
    getBindings : function(){

      return qx.data.SingleValueBinding.getAllBindingsForObject(this);
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * The data binding package is still under development so there will be changes
 * to the API. This Features is for testing purpose only.
 */
qx.Class.define("qx.data.SingleValueBinding", {
  statics : {
    /** internal reference for all bindings */
    __bd : {
    },
    /**
     * The function is responsible for binding a source objects property to
     * a target objects property. Both properties have to have the usual qooxdoo
     * getter and setter. The source property also needs to fire change-events
     * on every change of its value.
     * Please keep in mind, that this binding is unidirectional. If you need
     * a binding in both directions, you have to use two of this bindings.
     *
     * It's also possible to bind some kind of a hierarchy as a source. This
     * means that you can separate the source properties with a dot and bind
     * by that the object referenced to this property chain.
     * Example with an object 'a' which has object 'b' stored in its 'child'
     * property. Object b has a string property named abc:
     * <pre><code>
     * qx.data.SingleValueBinding.bind(a, "child.abc", textfield, "value");
     * </code></pre>
     * In that case, if the property abc of b changes, the textfield will
     * automatically contain the new value. Also if the child of a changes, the
     * new value (abc of the new child) will be in the textfield.
     *
     * There is also a possibility of binding an array. Therefor the array
     * {@link qx.data.IListData} is needed because this array has change events
     * which the native does not. Imagine a qooxdoo object a which has a
     * children property containing an array holding more of its own kind.
     * Every object has a name property as a string.
     * <pre>
     * var svb = qx.data.SingleValueBinding;
     * // bind the first childs name of 'a' to a textfield
     * svb.bind(a, "children[0].name", textfield, "value");
     * // bind the last childs name of 'a' to a textfield
     * svb.bind(a, "children[last].name", textfield2, "value");
     * // also deeper bindinds are possible
     * svb.bind(a, "children[0].children[0].name", textfield3, "value");
     * </pre>
     *
     * As you can see in this example, the abc property of a's b will be bound
     * to the textfield. If now the value of b changed or even the a will get a
     * new b, the binding still shows the right value.
     *
     * @param sourceObject {qx.core.Object} The source of the binding.
     * @param sourcePropertyChain {String} The property chain which represents
     *   the source property.
     * @param targetObject {qx.core.Object} The object which the source should
     *   be bind to.
     * @param targetPropertyChain {String} The property chain to the target
     *   object.
     * @param options {Map?null} A map containing the options.
     *   <li>converter: A converter function which takes four parameters
     *       and should return the converted value.
     *       <ol>
     *         <li>The data to convert</li>
     *         <li>The corresponding model object, which is only set in case of the use of an controller.</li>
     *         <li>The source object for the binding</li>
     *         <li>The target object.</li>
     *       </ol>
     *       If no conversion has been done, the given value should be returned.
     *       e.g. a number to boolean converter
     *       <code>function(data, model, source, target) {return data > 100;}</code>
     *   </li>
     *   <li>onUpdate: A callback function can be given here. This method will be
     *       called if the binding was updated successful. There will be
     *       three parameter you do get in that method call.
     *       <ol>
     *         <li>The source object</li>
     *         <li>The target object</li>
     *         <li>The data</li>
     *       </ol>
     *       Here is a sample: <code>onUpdate : function(source, target, data) {...}</code>
     *   </li>
     *   <li>onSetFail: A callback function can be given here. This method will
     *       be called if the set of the value fails.
     *   </li>
     *   <li>ignoreConverter: A string which will be matched using the current
     *       property chain. If it matches, the converter will not be called.
     *   </li>
     *
     * @return {var} Returns the internal id for that binding. This can be used
     *   for referencing the binding or e.g. for removing. This is not an atomic
     *   id so you can't you use it as a hash-map index.
     *
     * @throws {qx.core.AssertionError} If the event is no data event or
     *   there is no property definition for object and property (source and
     *   target).
     */
    bind : function(sourceObject, sourcePropertyChain, targetObject, targetPropertyChain, options){

      // check for the arguments
      if(qx.core.Environment.get("qx.debug")){

        qx.core.Assert.assertObject(sourceObject, "sourceObject");
        qx.core.Assert.assertString(sourcePropertyChain, "sourcePropertyChain");
        qx.core.Assert.assertObject(targetObject, "targetObject");
        qx.core.Assert.assertString(targetPropertyChain, "targetPropertyChain");
      };
      // set up the target binding
      var targetListenerMap = this.__bf(sourceObject, sourcePropertyChain, targetObject, targetPropertyChain, options);
      // get the property names
      var propertyNames = sourcePropertyChain.split(".");
      // stuff that's needed to store for the listener function
      var arrayIndexValues = this.__bl(propertyNames);
      var sources = [];
      var listeners = [];
      var listenerIds = [];
      var eventNames = [];
      var source = sourceObject;
      // add a try catch to make it possible to remove the listeners of the
      // chain in case the loop breaks after some listeners already added.
      try{

        // go through all property names
        for(var i = 0;i < propertyNames.length;i++){

          // check for the array
          if(arrayIndexValues[i] !== ""){

            // push the array change event
            eventNames.push("change");
          } else {

            eventNames.push(this.__bg(source, propertyNames[i]));
          };
          // save the current source
          sources[i] = source;
          // check for the last property
          if(i == propertyNames.length - 1){

            // if it is an array, set the initial value and bind the event
            if(arrayIndexValues[i] !== ""){

              // getthe current value
              var itemIndex = arrayIndexValues[i] === "last" ? source.length - 1 : arrayIndexValues[i];
              var currentValue = source.getItem(itemIndex);
              // set the initial value
              this.__bk(currentValue, targetObject, targetPropertyChain, options, sourceObject);
              // bind the event
              listenerIds[i] = this.__bm(source, eventNames[i], targetObject, targetPropertyChain, options, arrayIndexValues[i]);
            } else {

              // try to set the initial value
              if(propertyNames[i] != null && source["get" + qx.lang.String.firstUp(propertyNames[i])] != null){

                var currentValue = source["get" + qx.lang.String.firstUp(propertyNames[i])]();
                this.__bk(currentValue, targetObject, targetPropertyChain, options, sourceObject);
              };
              // bind the property
              listenerIds[i] = this.__bm(source, eventNames[i], targetObject, targetPropertyChain, options);
            };
          } else {

            // create the context for the listener
            var context = {
              index : i,
              propertyNames : propertyNames,
              sources : sources,
              listenerIds : listenerIds,
              arrayIndexValues : arrayIndexValues,
              targetObject : targetObject,
              targetPropertyChain : targetPropertyChain,
              options : options,
              listeners : listeners
            };
            // create a listener
            var listener = qx.lang.Function.bind(this.__be, this, context);
            // store the listener for further processing
            listeners.push(listener);
            // add the chaining listener
            listenerIds[i] = source.addListener(eventNames[i], listener);
          };
          // get and store the next source
          if(source["get" + qx.lang.String.firstUp(propertyNames[i])] == null){

            source = null;
          } else if(arrayIndexValues[i] !== ""){

            source = source["get" + qx.lang.String.firstUp(propertyNames[i])](arrayIndexValues[i]);
          } else {

            source = source["get" + qx.lang.String.firstUp(propertyNames[i])]();
          };
          if(!source){

            break;
          };
        };
      } catch(ex) {

        // remove the already added listener
        // go threw all added listeners (source)
        for(var i = 0;i < sources.length;i++){

          // check if a source is available
          if(sources[i] && listenerIds[i]){

            sources[i].removeListenerById(listenerIds[i]);
          };
        };
        var targets = targetListenerMap.targets;
        var targetIds = targetListenerMap.listenerIds;
        // go threw all added listeners (target)
        for(var i = 0;i < targets.length;i++){

          // check if a target is available
          if(targets[i] && targetIds[i]){

            targets[i].removeListenerById(targetIds[i]);
          };
        };
        throw ex;
      };
      // create the id map
      var id = {
        type : "deepBinding",
        listenerIds : listenerIds,
        sources : sources,
        targetListenerIds : targetListenerMap.listenerIds,
        targets : targetListenerMap.targets
      };
      // store the bindings
      this.__bn(id, sourceObject, sourcePropertyChain, targetObject, targetPropertyChain);
      return id;
    },
    /**
     * Event listener for the chaining of the properties.
     *
     * @param context {Map} The current context for the listener.
     */
    __be : function(context){

      // invoke the onUpdate method
      if(context.options && context.options.onUpdate){

        context.options.onUpdate(context.sources[context.index], context.targetObject);
      };
      // delete all listener after the current one
      for(var j = context.index + 1;j < context.propertyNames.length;j++){

        // remove the old sources
        var source = context.sources[j];
        context.sources[j] = null;
        if(!source){

          continue;
        };
        // remove the listeners
        source.removeListenerById(context.listenerIds[j]);
      };
      // get the current source
      var source = context.sources[context.index];
      // add new once after the current one
      for(var j = context.index + 1;j < context.propertyNames.length;j++){

        // get and store the new source
        if(context.arrayIndexValues[j - 1] !== ""){

          source = source["get" + qx.lang.String.firstUp(context.propertyNames[j - 1])](context.arrayIndexValues[j - 1]);
        } else {

          source = source["get" + qx.lang.String.firstUp(context.propertyNames[j - 1])]();
        };
        context.sources[j] = source;
        // reset the target object if no new source could be found
        if(!source){

          // use the converter if the property chain breaks [BUG# 6880]
          if(context.options && context.options.converter){

            var ignoreConverter = false;
            // take care of the ignore pattern used for the controller
            if(context.options.ignoreConverter){

              // the current property chain as string
              var currentSourceChain = context.propertyNames.slice(0, j).join(".");
              // match for the current patten given in the options
              var match = currentSourceChain.match(new RegExp("^" + context.options.ignoreConverter));
              ignoreConverter = match ? match.length > 0 : false;
            };
            var data = null;
            if(!ignoreConverter){

              data = context.options.converter();
            };
            this.__bi(context.targetObject, context.targetPropertyChain, data);
          } else {

            this.__bh(context.targetObject, context.targetPropertyChain);
          };
          break;
        };
        // if its the last property
        if(j == context.propertyNames.length - 1){

          // if its an array
          if(qx.Class.implementsInterface(source, qx.data.IListData)){

            // set the inital value
            var itemIndex = context.arrayIndexValues[j] === "last" ? source.length - 1 : context.arrayIndexValues[j];
            var currentValue = source.getItem(itemIndex);
            this.__bk(currentValue, context.targetObject, context.targetPropertyChain, context.options, context.sources[context.index]);
            // bind the item event to the new target
            context.listenerIds[j] = this.__bm(source, "change", context.targetObject, context.targetPropertyChain, context.options, context.arrayIndexValues[j]);
          } else {

            if(context.propertyNames[j] != null && source["get" + qx.lang.String.firstUp(context.propertyNames[j])] != null){

              var currentValue = source["get" + qx.lang.String.firstUp(context.propertyNames[j])]();
              this.__bk(currentValue, context.targetObject, context.targetPropertyChain, context.options, context.sources[context.index]);
            };
            var eventName = this.__bg(source, context.propertyNames[j]);
            // bind the last property to the new target
            context.listenerIds[j] = this.__bm(source, eventName, context.targetObject, context.targetPropertyChain, context.options);
          };
        } else {

          // check if a listener already created
          if(context.listeners[j] == null){

            var listener = qx.lang.Function.bind(this.__be, this, context);
            // store the listener for further processing
            context.listeners.push(listener);
          };
          // add a new listener
          if(qx.Class.implementsInterface(source, qx.data.IListData)){

            var eventName = "change";
          } else {

            var eventName = this.__bg(source, context.propertyNames[j]);
          };
          context.listenerIds[j] = source.addListener(eventName, context.listeners[j]);
        };
      };
    },
    /**
     * Internal helper for setting up the listening to the changes on the
     * target side of the binding. Only works if the target property is a
     * property chain
     *
     * @param sourceObject {qx.core.Object} The source of the binding.
     * @param sourcePropertyChain {String} The property chain which represents
     *   the source property.
     * @param targetObject {qx.core.Object} The object which the source should
     *   be bind to.
     * @param targetPropertyChain {String} The property name of the target
     *   object.
     * @param options {Map} The options map perhaps containing the user defined
     *   converter.
     * @return {var} A map containing the listener ids and the targets.
     */
    __bf : function(sourceObject, sourcePropertyChain, targetObject, targetPropertyChain, options){

      // get the property names
      var propertyNames = targetPropertyChain.split(".");
      var arrayIndexValues = this.__bl(propertyNames);
      var targets = [];
      var listeners = [];
      var listenerIds = [];
      var eventNames = [];
      var target = targetObject;
      // go through all property names
      for(var i = 0;i < propertyNames.length - 1;i++){

        // check for the array
        if(arrayIndexValues[i] !== ""){

          // push the array change event
          eventNames.push("change");
        } else {

          try{

            eventNames.push(this.__bg(target, propertyNames[i]));
          } catch(e) {

            // if the event names could not be terminated,
            // just ignore the target chain listening
            break;
          };
        };
        // save the current source
        targets[i] = target;
        // create a listener
        var listener = function(){

          // delete all listener after the current one
          for(var j = i + 1;j < propertyNames.length - 1;j++){

            // remove the old sources
            var target = targets[j];
            targets[j] = null;
            if(!target){

              continue;
            };
            // remove the listeners
            target.removeListenerById(listenerIds[j]);
          };
          // get the current target
          var target = targets[i];
          // add new once after the current one
          for(var j = i + 1;j < propertyNames.length - 1;j++){

            var firstUpPropName = qx.lang.String.firstUp(propertyNames[j - 1]);
            // get and store the new target
            if(arrayIndexValues[j - 1] !== ""){

              var currentIndex = arrayIndexValues[j - 1] === "last" ? target.getLength() - 1 : arrayIndexValues[j - 1];
              target = target["get" + firstUpPropName](currentIndex);
            } else {

              target = target["get" + firstUpPropName]();
            };
            targets[j] = target;
            // check if a listener already created
            if(listeners[j] == null){

              // store the listener for further processing
              listeners.push(listener);
            };
            // add a new listener
            if(qx.Class.implementsInterface(target, qx.data.IListData)){

              var eventName = "change";
            } else {

              try{

                var eventName = qx.data.SingleValueBinding.__bg(target, propertyNames[j]);
              } catch(e) {

                // if the event name could not be terminated,
                // ignore the rest
                break;
              };
            };
            listenerIds[j] = target.addListener(eventName, listeners[j]);
          };
          qx.data.SingleValueBinding.updateTarget(sourceObject, sourcePropertyChain, targetObject, targetPropertyChain, options);
        };
        // store the listener for further processing
        listeners.push(listener);
        // add the chaining listener
        listenerIds[i] = target.addListener(eventNames[i], listener);
        var firstUpPropName = qx.lang.String.firstUp(propertyNames[i]);
        // get and store the next target
        if(target["get" + firstUpPropName] == null){

          target = null;
        } else if(arrayIndexValues[i] !== ""){

          target = target["get" + firstUpPropName](arrayIndexValues[i]);
        } else {

          target = target["get" + firstUpPropName]();
        };
        if(!target){

          break;
        };
      };
      return {
        listenerIds : listenerIds,
        targets : targets
      };
    },
    /**
     * Helper for updating the target. Gets the current set data from the source
     * and set that on the target.
     *
     * @param sourceObject {qx.core.Object} The source of the binding.
     * @param sourcePropertyChain {String} The property chain which represents
     *   the source property.
     * @param targetObject {qx.core.Object} The object which the source should
     *   be bind to.
     * @param targetPropertyChain {String} The property name of the target
     *   object.
     * @param options {Map} The options map perhaps containing the user defined
     *   converter.
     *
     * @internal
     */
    updateTarget : function(sourceObject, sourcePropertyChain, targetObject, targetPropertyChain, options){

      var value = this.resolvePropertyChain(sourceObject, sourcePropertyChain);
      // convert the data before setting
      value = qx.data.SingleValueBinding.__bo(value, targetObject, targetPropertyChain, options, sourceObject);
      this.__bi(targetObject, targetPropertyChain, value);
    },
    /**
     * Internal helper for getting the current set value at the property chain.
     *
     * @param o {qx.core.Object} The source of the binding.
     * @param propertyChain {String} The property chain which represents
     *   the source property.
     * @return {var?undefined} Returns the set value if defined.
     */
    resolvePropertyChain : function(o, propertyChain){

      var source = this.__bj(o, propertyChain);
      var value;
      if(source != null){

        // geht the name of the last property
        var lastProperty = propertyChain.substring(propertyChain.lastIndexOf(".") + 1, propertyChain.length);
        // check for arrays
        if(lastProperty.charAt(lastProperty.length - 1) == "]"){

          // split up the chain into property and index
          var index = lastProperty.substring(lastProperty.lastIndexOf("[") + 1, lastProperty.length - 1);
          var prop = lastProperty.substring(0, lastProperty.lastIndexOf("["));
          // get the array
          var sourceArray = source["get" + qx.lang.String.firstUp(prop)]();
          if(index == "last"){

            index = sourceArray.length - 1;
          };
          if(sourceArray != null){

            value = sourceArray.getItem(index);
          };
        } else {

          // set the given value
          value = source["get" + qx.lang.String.firstUp(lastProperty)]();
        };
      };
      return value;
    },
    /**
     * Tries to return a fitting event name to the given source object and
     * property name. First, it assumes that the propertyname is a real property
     * and therefore it checks the property definition for the event. The second
     * possibility is to check if there is an event with the given name. The
     * third and last possibility checked is if there is an event which is named
     * change + propertyname. If this three possibilities fail, an error will be
     * thrown.
     *
     * @param source {qx.core.Object} The source where the property is stored.
     * @param propertyname {String} The name of the property.
     * @return {String} The name of the corresponding property.
     */
    __bg : function(source, propertyname){

      // get the current event Name from the property definition
      var eventName = this.__bp(source, propertyname);
      // if no event name could be found
      if(eventName == null){

        // check if the propertyname is the event name
        if(qx.Class.supportsEvent(source.constructor, propertyname)){

          eventName = propertyname;
        } else if(qx.Class.supportsEvent(source.constructor, "change" + qx.lang.String.firstUp(propertyname))){

          eventName = "change" + qx.lang.String.firstUp(propertyname);
        } else {

          throw new qx.core.AssertionError("Binding property " + propertyname + " of object " + source + " not possible: No event available. ");
        };
      };
      return eventName;
    },
    /**
     * Resets the value of the given target after resolving the target property
     * chain.
     *
     * @param targetObject {qx.core.Object} The object where the property chain
     *   starts.
     * @param targetPropertyChain {String} The names of the properties,
     *   separated with a dot.
     */
    __bh : function(targetObject, targetPropertyChain){

      // get the last target object of the chain
      var target = this.__bj(targetObject, targetPropertyChain);
      if(target != null){

        // get the name of the last property
        var lastProperty = targetPropertyChain.substring(targetPropertyChain.lastIndexOf(".") + 1, targetPropertyChain.length);
        // check for an array and set the value to null
        if(lastProperty.charAt(lastProperty.length - 1) == "]"){

          this.__bi(targetObject, targetPropertyChain, null);
          return;
        };
        // try to reset the property
        if(target["reset" + qx.lang.String.firstUp(lastProperty)] != undefined){

          target["reset" + qx.lang.String.firstUp(lastProperty)]();
        } else {

          // fallback if no resetter is given (see bug #2456)
          target["set" + qx.lang.String.firstUp(lastProperty)](null);
        };
      };
    },
    /**
     * Sets the given value to the given target after resolving the
     * target property chain.
     *
     * @param targetObject {qx.core.Object} The object where the property chain
     *   starts.
     * @param targetPropertyChain {String} The names of the properties,
     *   separated with a dot.
     * @param value {var} The value to set.
     */
    __bi : function(targetObject, targetPropertyChain, value){

      // get the last target object of the chain
      var target = this.__bj(targetObject, targetPropertyChain);
      if(target != null){

        // geht the name of the last property
        var lastProperty = targetPropertyChain.substring(targetPropertyChain.lastIndexOf(".") + 1, targetPropertyChain.length);
        // check for arrays
        if(lastProperty.charAt(lastProperty.length - 1) == "]"){

          // split up the chain into property and index
          var index = lastProperty.substring(lastProperty.lastIndexOf("[") + 1, lastProperty.length - 1);
          var prop = lastProperty.substring(0, lastProperty.lastIndexOf("["));
          // get the array
          var targetArray = targetObject;
          if(!qx.Class.implementsInterface(targetArray, qx.data.IListData)){

            targetArray = target["get" + qx.lang.String.firstUp(prop)]();
          };
          if(index == "last"){

            index = targetArray.length - 1;
          };
          if(targetArray != null){

            targetArray.setItem(index, value);
          };
        } else {

          // set the given value
          target["set" + qx.lang.String.firstUp(lastProperty)](value);
        };
      };
    },
    /**
     * Helper-Function resolving the object on which the last property of the
     * chain should be set.
     *
     * @param targetObject {qx.core.Object} The object where the property chain
     *   starts.
     * @param targetPropertyChain {String} The names of the properties,
     *   separated with a dot.
     * @return {qx.core.Object | null} The object on which the last property
     *   should be set.
     */
    __bj : function(targetObject, targetPropertyChain){

      var properties = targetPropertyChain.split(".");
      var target = targetObject;
      // ignore the last property
      for(var i = 0;i < properties.length - 1;i++){

        try{

          var property = properties[i];
          // if there is an array notation
          if(property.indexOf("]") == property.length - 1){

            var index = property.substring(property.indexOf("[") + 1, property.length - 1);
            property = property.substring(0, property.indexOf("["));
          };
          // in case there is a property infront of the brackets
          if(property != ""){

            target = target["get" + qx.lang.String.firstUp(property)]();
          };
          // if there is an index, we can be sure its an array
          if(index != null){

            // check for the 'last' notation
            if(index == "last"){

              index = target.length - 1;
            };
            // get the array item
            target = target.getItem(index);
            index = null;
          };
        } catch(ex) {

          return null;
        };
      };
      return target;
    },
    /**
     * Set the given value to the target property. This method is used for
     * initially set the value.
     *
     * @param value {var} The value to set.
     * @param targetObject {qx.core.Object} The object which contains the target
     *   property.
     * @param targetPropertyChain {String} The name of the target property in the
     *   target object.
     * @param options {Map} The options map perhaps containing the user defined
     *   converter.
     * @param sourceObject {qx.core.Object} The source object of the binding (
     *   used for the onUpdate callback).
     */
    __bk : function(value, targetObject, targetPropertyChain, options, sourceObject){

      // first convert the initial value
      value = this.__bo(value, targetObject, targetPropertyChain, options, sourceObject);
      // check if the converted value is undefined
      if(value === undefined){

        this.__bh(targetObject, targetPropertyChain);
      };
      // only set the initial value if one is given (may be null)
      if(value !== undefined){

        try{

          this.__bi(targetObject, targetPropertyChain, value);
          // tell the user that the setter was invoked probably
          if(options && options.onUpdate){

            options.onUpdate(sourceObject, targetObject, value);
          };
        } catch(e) {

          if(!(e instanceof qx.core.ValidationError)){

            throw e;
          };
          if(options && options.onSetFail){

            options.onSetFail(e);
          } else {

            qx.log.Logger.warn("Failed so set value " + value + " on " + targetObject + ". Error message: " + e);
          };
        };
      };
    },
    /**
     * Checks for an array element in the given property names and adapts the
     * arrays to fit the algorithm.
     *
     * @param propertyNames {Array} The array containing the property names.
     *   Attention, this method can chang this parameter!!!
     * @return {Array} An array containing the values of the array properties
     *   corresponding to the property names.
     */
    __bl : function(propertyNames){

      // array for the values of the array properties
      var arrayIndexValues = [];
      // go through all properties and check for array notations
      for(var i = 0;i < propertyNames.length;i++){

        var name = propertyNames[i];
        // if its an array property in the chain
        if(qx.lang.String.endsWith(name, "]")){

          // get the inner value of the array notation
          var arrayIndex = name.substring(name.indexOf("[") + 1, name.indexOf("]"));
          // check the arrayIndex
          if(name.indexOf("]") != name.length - 1){

            throw new Error("Please use only one array at a time: " + name + " does not work.");
          };
          if(arrayIndex !== "last"){

            if(arrayIndex == "" || isNaN(parseInt(arrayIndex, 10))){

              throw new Error("No number or 'last' value hast been given" + " in an array binding: " + name + " does not work.");
            };
          };
          // if a property is infront of the array notation
          if(name.indexOf("[") != 0){

            // store the property name without the array notation
            propertyNames[i] = name.substring(0, name.indexOf("["));
            // store the values in the array for the current iteration
            arrayIndexValues[i] = "";
            // store the properties for the next iteration (the item of the array)
            arrayIndexValues[i + 1] = arrayIndex;
            propertyNames.splice(i + 1, 0, "item");
            // skip the next iteration. its the array item and its already set
            i++;
          } else {

            // store the array index and override the entry in the property names
            arrayIndexValues[i] = arrayIndex;
            propertyNames.splice(i, 1, "item");
          };
        } else {

          arrayIndexValues[i] = "";
        };
      };
      return arrayIndexValues;
    },
    /**
     * Internal helper method which is actually doing all bindings. That means
     * that an event listener will be added to the source object which listens
     * to the given event and invokes an set on the target property on the
     * targetObject.
     * This method does not store the binding in the internal reference store
     * so it should NOT be used from outside this class. For an outside usage,
     * use {@link #bind}.
     *
     * @param sourceObject {qx.core.Object} The source of the binding.
     * @param sourceEvent {String} The event of the source object which could
     *   be the change event in common but has to be an
     *   {@link qx.event.type.Data} event.
     * @param targetObject {qx.core.Object} The object which the source should
     *   be bind to.
     * @param targetProperty {String} The property name of the target object.
     * @param options {Map} A map containing the options. See
     *   {@link #bind} for more information.
     * @param arrayIndex {String} The index of the given array if its an array
     *   to bind.
     *
     * @return {var} Returns the internal id for that binding. This can be used
     *   for referencing the binding or e.g. for removing. This is not an atomic
     *   id so you can't you use it as a hash-map index. It's the id which will
     *   be returned by the {@link qx.core.Object#addListener} method.
     * @throws {qx.core.AssertionError} If the event is no data event or
     *   there is no property definition for the target object and target
     *   property.
     */
    __bm : function(sourceObject, sourceEvent, targetObject, targetProperty, options, arrayIndex){

      // checks
      if(qx.core.Environment.get("qx.debug")){

        // check for the data event
        var eventType = qx.Class.getEventType(sourceObject.constructor, sourceEvent);
        qx.core.Assert.assertEquals("qx.event.type.Data", eventType, sourceEvent + " is not an data (qx.event.type.Data) event on " + sourceObject + ".");
      };
      var bindListener = function(arrayIndex, e){

        // if an array value is given
        if(arrayIndex !== ""){

          //check if its the "last" value
          if(arrayIndex === "last"){

            arrayIndex = sourceObject.length - 1;
          };
          // get the data of the array
          var data = sourceObject.getItem(arrayIndex);
          // reset the target if the data is not set
          if(data === undefined){

            qx.data.SingleValueBinding.__bh(targetObject, targetProperty);
          };
          // only do something if the curren array has been changed
          var start = e.getData().start;
          var end = e.getData().end;
          if(arrayIndex < start || arrayIndex > end){

            return;
          };
        } else {

          // get the data out of the event
          var data = e.getData();
        };
        // debug message
        if(qx.core.Environment.get("qx.debug.databinding")){

          qx.log.Logger.debug("Binding executed from " + sourceObject + " by " + sourceEvent + " to " + targetObject + " (" + targetProperty + ")");
          qx.log.Logger.debug("Data before conversion: " + data);
        };
        // convert the data
        data = qx.data.SingleValueBinding.__bo(data, targetObject, targetProperty, options, sourceObject);
        // debug message
        if(qx.core.Environment.get("qx.debug.databinding")){

          qx.log.Logger.debug("Data after conversion: " + data);
        };
        // try to set the value
        try{

          if(data !== undefined){

            qx.data.SingleValueBinding.__bi(targetObject, targetProperty, data);
          } else {

            qx.data.SingleValueBinding.__bh(targetObject, targetProperty);
          };
          // tell the user that the setter was invoked probably
          if(options && options.onUpdate){

            options.onUpdate(sourceObject, targetObject, data);
          };
        } catch(ex) {

          if(!(ex instanceof qx.core.ValidationError)){

            throw ex;
          };
          if(options && options.onSetFail){

            options.onSetFail(ex);
          } else {

            qx.log.Logger.warn("Failed so set value " + data + " on " + targetObject + ". Error message: " + ex);
          };
        };
      };
      // check if an array index is given
      if(!arrayIndex){

        // if not, signal it a s an empty string
        arrayIndex = "";
      };
      // bind the listener function (make the array index in the listener available)
      bindListener = qx.lang.Function.bind(bindListener, sourceObject, arrayIndex);
      // add the listener
      var id = sourceObject.addListener(sourceEvent, bindListener);
      return id;
    },
    /**
     * This method stores the given value as a binding in the internal structure
     * of all bindings.
     *
     * @param id {var} The listener id of the id for a deeper binding.
     * @param sourceObject {qx.core.Object} The source Object of the binding.
     * @param sourceEvent {String} The name of the source event.
     * @param targetObject {qx.core.Object} The target object.
     * @param targetProperty {String} The name of the property on the target
     *   object.
     */
    __bn : function(id, sourceObject, sourceEvent, targetObject, targetProperty){

      // add the listener id to the internal registry
      if(this.__bd[sourceObject.toHashCode()] === undefined){

        this.__bd[sourceObject.toHashCode()] = [];
      };
      this.__bd[sourceObject.toHashCode()].push([id, sourceObject, sourceEvent, targetObject, targetProperty]);
    },
    /**
     * This method takes the given value, checks if the user has given a
     * converter and converts the value to its target type. If no converter is
     * given by the user, the {@link #__defaultConversion} will try to convert
     * the value.
     *
     * @param value {var} The value which possibly should be converted.
     * @param targetObject {qx.core.Object} The target object.
     * @param targetPropertyChain {String} The property name of the target object.
     * @param options {Map} The options map which can includes the converter.
     *   For a detailed information on the map, take a look at
     *   {@link #bind}.
     * @param sourceObject {qx.core.Object} The source obejct for the binding.
     *
     * @return {var} The converted value. If no conversion has been done, the
     *   value property will be returned.
     * @throws {qx.core.AssertionError} If there is no property definition
     *   of the given target object and target property.
     */
    __bo : function(value, targetObject, targetPropertyChain, options, sourceObject){

      // do the conversion given by the user
      if(options && options.converter){

        var model;
        if(targetObject.getModel){

          model = targetObject.getModel();
        };
        return options.converter(value, model, sourceObject, targetObject);
      } else {

        var target = this.__bj(targetObject, targetPropertyChain);
        var lastProperty = targetPropertyChain.substring(targetPropertyChain.lastIndexOf(".") + 1, targetPropertyChain.length);
        // if no target is currently available, return the original value
        if(target == null){

          return value;
        };
        var propertieDefinition = qx.Class.getPropertyDefinition(target.constructor, lastProperty);
        var check = propertieDefinition == null ? "" : propertieDefinition.check;
        return this.__bq(value, check);
      };
    },
    /**
     * Helper method which tries to figure out if the given property on the
     * given object does have a change event and if returns the name of it.
     *
     * @param sourceObject {qx.core.Object} The object to check.
     * @param sourceProperty {String} The name of the property.
     *
     * @return {String} The name of the change event.
     * @throws {qx.core.AssertionError} If there is no property definition of
     *   the given object property pair.
     */
    __bp : function(sourceObject, sourceProperty){

      // get the event name
      var propertieDefinition = qx.Class.getPropertyDefinition(sourceObject.constructor, sourceProperty);
      if(propertieDefinition == null){

        return null;
      };
      return propertieDefinition.event;
    },
    /**
     * Tries to convert the data to the type given in the targetCheck argument.
     *
     * @param data {var} The data to convert.
     * @param targetCheck {String} The value of the check property. That usually
     *   contains the target type.
     * @return {Integer|String|Float} The converted data
     */
    __bq : function(data, targetCheck){

      var dataType = qx.lang.Type.getClass(data);
      // to integer
      if((dataType == "Number" || dataType == "String") && (targetCheck == "Integer" || targetCheck == "PositiveInteger")){

        data = parseInt(data, 10);
      };
      // to string
      if((dataType == "Boolean" || dataType == "Number" || dataType == "Date") && targetCheck == "String"){

        data = data + "";
      };
      // to float
      if((dataType == "Number" || dataType == "String") && (targetCheck == "Number" || targetCheck == "PositiveNumber")){

        data = parseFloat(data);
      };
      return data;
    },
    /**
     * Removes the binding with the given id from the given sourceObject. The
     * id hast to be the id returned by any of the bind functions.
     *
     * @param sourceObject {qx.core.Object} The source object of the binding.
     * @param id {var} The id of the binding.
     * @throws {Error} If the binding could not be found.
     */
    removeBindingFromObject : function(sourceObject, id){

      // check for a deep binding
      if(id.type == "deepBinding"){

        // go threw all added listeners (source)
        for(var i = 0;i < id.sources.length;i++){

          // check if a source is available
          if(id.sources[i]){

            id.sources[i].removeListenerById(id.listenerIds[i]);
          };
        };
        // go threw all added listeners (target)
        for(var i = 0;i < id.targets.length;i++){

          // check if a target is available
          if(id.targets[i]){

            id.targets[i].removeListenerById(id.targetListenerIds[i]);
          };
        };
      } else {

        // remove the listener
        sourceObject.removeListenerById(id);
      };
      // remove the id from the internal reference system
      var bindings = this.__bd[sourceObject.toHashCode()];
      // check if the binding exists
      if(bindings != undefined){

        for(var i = 0;i < bindings.length;i++){

          if(bindings[i][0] == id){

            qx.lang.Array.remove(bindings, bindings[i]);
            return;
          };
        };
      };
      throw new Error("Binding could not be found!");
    },
    /**
     * Removes all bindings for the given object.
     *
     * @param object {qx.core.Object} The object of which the bindings should be
     *   removed.
     * @throws {qx.core.AssertionError} If the object is not in the internal
     *   registry of the bindings.
     * @throws {Error} If one of the bindings listed internally can not be
     *   removed.
     */
    removeAllBindingsForObject : function(object){

      // check for the null value
      if(qx.core.Environment.get("qx.debug")){

        qx.core.Assert.assertNotNull(object, "Can not remove the bindings for null object!");
      };
      // get the bindings
      var bindings = this.__bd[object.toHashCode()];
      if(bindings != undefined){

        // remove every binding with the removeBindingFromObject function
        for(var i = bindings.length - 1;i >= 0;i--){

          this.removeBindingFromObject(object, bindings[i][0]);
        };
      };
    },
    /**
     * Returns an array which lists all bindings.
     *
     * @param object {qx.core.Object} The object of which the bindings should
     *   be returned.
     *
     * @return {Array} An array of binding informations. Every binding
     *   information is an array itself containing id, sourceObject,
     *   sourceEvent, targetObject and targetProperty in that order.
     */
    getAllBindingsForObject : function(object){

      // create an empty array if no binding exists
      if(this.__bd[object.toHashCode()] === undefined){

        this.__bd[object.toHashCode()] = [];
      };
      return this.__bd[object.toHashCode()];
    },
    /**
     * Removes all binding in the whole application. After that not a single
     * binding is left.
     */
    removeAllBindings : function(){

      // go threw all registerd objects
      for(var hash in this.__bd){

        var object = qx.core.ObjectRegistry.fromHashCode(hash);
        // check for the object, perhaps its already deleted
        if(object == null){

          delete this.__bd[hash];
          continue;
        };
        this.removeAllBindingsForObject(object);
      };
      // reset the bindings map
      this.__bd = {
      };
    },
    /**
     * Returns a map containing for every bound object an array of data binding
     * information. The key of the map is the hashcode of the bound objects.
     * Every binding is represented by an array containing id, sourceObject,
     * sourceEvent, targetObject and targetProperty.
     *
     * @return {Map} Map containing all bindings.
     */
    getAllBindings : function(){

      return this.__bd;
    },
    /**
     * Debug function which shows some valuable information about the given
     * binding in console. For that it uses {@link qx.log.Logger}.
     *
     * @param object {qx.core.Object} the source of the binding.
     * @param id {var} The id of the binding.
     */
    showBindingInLog : function(object, id){

      var binding;
      // go threw all bindings of the given object
      for(var i = 0;i < this.__bd[object.toHashCode()].length;i++){

        // the first array item is the id
        if(this.__bd[object.toHashCode()][i][0] == id){

          binding = this.__bd[object.toHashCode()][i];
          break;
        };
      };
      if(binding === undefined){

        var message = "Binding does not exist!";
      } else {

        var message = "Binding from '" + binding[1] + "' (" + binding[2] + ") to the object '" + binding[3] + "' (" + binding[4] + ").";
      };
      qx.log.Logger.debug(message);
    },
    /**
     * Debug function which shows all bindings in the log console. To get only
     * one binding in the console use {@link #showBindingInLog}
     */
    showAllBindingsInLog : function(){

      // go threw all objects in the registry
      for(var hash in this.__bd){

        var object = qx.core.ObjectRegistry.fromHashCode(hash);
        for(var i = 0;i < this.__bd[hash].length;i++){

          this.showBindingInLog(object, this.__bd[hash][i][0]);
        };
      };
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */
/**
 * Utility class with type check for all native JavaScript data types.
 */
qx.Bootstrap.define("qx.lang.Type", {
  statics : {
    /**
     * Get the internal class of the value. See
     * http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
     * for details.
     *
     * @signature function(value)
     * @param value {var} value to get the class for
     * @return {String} the internal class of the value
     */
    getClass : qx.Bootstrap.getClass,
    /**
     * Whether the value is a string.
     *
     * @signature function(value)
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a string.
     */
    isString : qx.Bootstrap.isString,
    /**
     * Whether the value is an array.
     *
     * @signature function(value)
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is an array.
     */
    isArray : qx.Bootstrap.isArray,
    /**
     * Whether the value is an object. Note that built-in types like Window are
     * not reported to be objects.
     *
     * @signature function(value)
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is an object.
     */
    isObject : qx.Bootstrap.isObject,
    /**
     * Whether the value is a function.
     *
     * @signature function(value)
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a function.
     */
    isFunction : qx.Bootstrap.isFunction,
    /**
    * Whether the value is a regular expression.
    *
    * @param value {var} Value to check.
    * @return {Boolean} Whether the value is a regular expression.
    */
    isRegExp : function(value){

      return this.getClass(value) == "RegExp";
    },
    /**
    * Whether the value is a number.
    *
    * @param value {var} Value to check.
    * @return {Boolean} Whether the value is a number.
    */
    isNumber : function(value){

      // Added "value !== null" because IE throws an exception "Object expected"
      // by executing "value instanceof Number" if value is a DOM element that
      // doesn't exist. It seems that there is an internal different between a
      // JavaScript null and a null returned from calling DOM.
      // e.q. by document.getElementById("ReturnedNull").
      return (value !== null && (this.getClass(value) == "Number" || value instanceof Number));
    },
    /**
    * Whether the value is a boolean.
    *
    * @param value {var} Value to check.
    * @return {Boolean} Whether the value is a boolean.
    */
    isBoolean : function(value){

      // Added "value !== null" because IE throws an exception "Object expected"
      // by executing "value instanceof Boolean" if value is a DOM element that
      // doesn't exist. It seems that there is an internal different between a
      // JavaScript null and a null returned from calling DOM.
      // e.q. by document.getElementById("ReturnedNull").
      return (value !== null && (this.getClass(value) == "Boolean" || value instanceof Boolean));
    },
    /**
     * Whether the value is a date.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a date.
     */
    isDate : function(value){

      // Added "value !== null" because IE throws an exception "Object expected"
      // by executing "value instanceof Date" if value is a DOM element that
      // doesn't exist. It seems that there is an internal different between a
      // JavaScript null and a null returned from calling DOM.
      // e.q. by document.getElementById("ReturnedNull").
      return (value !== null && (this.getClass(value) == "Date" || value instanceof Date));
    },
    /**
     * Whether the value is a Error.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a Error.
     */
    isError : function(value){

      // Added "value !== null" because IE throws an exception "Object expected"
      // by executing "value instanceof Error" if value is a DOM element that
      // doesn't exist. It seems that there is an internal different between a
      // JavaScript null and a null returned from calling DOM.
      // e.q. by document.getElementById("ReturnedNull").
      return (value !== null && (this.getClass(value) == "Error" || value instanceof Error));
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */
/**
 * A collection of assertions.
 *
 * These methods can be used to assert incoming parameters, return values, ...
 * If an assertion fails an {@link AssertionError} is thrown.
 *
 * Assertions are used in unit tests as well.
 *
 * @require(qx.lang.Type)
 */
qx.Class.define("qx.core.Assert", {
  statics : {
    __br : true,
    /**
     * Assert that the condition evaluates to <code>true</code>. An
     * {@link AssertionError} is thrown if otherwise.
     *
     * @param comment {String} Message to be shown if the assertion fails. This
     *    message is provided by the user.
     * @param msgvarargs {var} any number of parts of a message to show if assertion
     *                         triggers. Each will be converted to a string and all
     *                         parts will be concatenated. E. g. instead of
     *                         "Got invalid value " + this.__toString(val) + "!!!!!"
     *                         use
     *                         "Got invalid value ", val, "!!!!!"
     *                         (much better performance)
     *
     */
    __bs : function(comment, msgvarargs){

      // Build up message from message varargs. It's not really important
      // how long this takes as it is done only when assertion is triggered
      var msg = "";
      for(var i = 1,l = arguments.length;i < l;i++){

        msg = msg + this.__bt(arguments[i] === undefined ? "'undefined'" : arguments[i]);
      };
      var fullComment = "";
      if(msg){

        fullComment = comment + ": " + msg;
      } else {

        fullComment = comment;
      };
      var errorMsg = "Assertion error! " + fullComment;
      if(qx.Class.isDefined("qx.core.AssertionError")){

        var err = new qx.core.AssertionError(comment, msg);
        if(this.__br){

          qx.Bootstrap.error(errorMsg + "\n Stack trace: \n" + err.getStackTrace());
        };
        throw err;
      } else {

        if(this.__br){

          qx.Bootstrap.error(errorMsg);
        };
        throw new Error(errorMsg);
      };
    },
    /**
     * Convert an unknown value to a string to display in error messages
     *
     * @param value {var} any value
     * @return {String} a string representation of the value
     */
    __bt : function(value){

      var stringValue;
      if(value === null){

        stringValue = "null";
      } else if(qx.lang.Type.isArray(value) && value.length > 10){

        stringValue = "Array[" + value.length + "]";
      } else if((value instanceof Object) && (value.toString == null)){

        stringValue = qx.lang.Json.stringify(value, null, 2);
      } else {

        try{

          stringValue = value.toString();
        } catch(e) {

          stringValue = "";
        };
      };;
      return stringValue;
    },
    /**
     * Assert that the condition evaluates to <code>true</code>.
     *
     * @param condition {var} Condition to check for. Must evaluate to
     *    <code>true</code>.
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assert : function(condition, msg){

      condition == true || this.__bs(msg || "", "Called assert with 'false'");
    },
    /**
     * Raise an {@link AssertionError}.
     *
     * @param msg {String} Message to be shown if the assertion fails.
     * @param compact {Boolean} Show less verbose message. Default: false.
     */
    fail : function(msg, compact){

      var msgvarargs = compact ? "" : "Called fail().";
      this.__bs(msg || "", msgvarargs);
    },
    /**
     * Assert that the value is <code>true</code> (Identity check).
     *
     * @param value {Boolean} Condition to check for. Must be identical to
     *    <code>true</code>.
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertTrue : function(value, msg){

      (value === true) || this.__bs(msg || "", "Called assertTrue with '", value, "'");
    },
    /**
     * Assert that the value is <code>false</code> (Identity check).
     *
     * @param value {Boolean} Condition to check for. Must be identical to
     *    <code>false</code>.
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertFalse : function(value, msg){

      (value === false) || this.__bs(msg || "", "Called assertFalse with '", value, "'");
    },
    /**
     * Assert that both values are equal. (Uses the equality operator
     * <code>==</code>.)
     *
     * @param expected {var} Reference value
     * @param found {var} found value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertEquals : function(expected, found, msg){

      expected == found || this.__bs(msg || "", "Expected '", expected, "' but found '", found, "'!");
    },
    /**
     * Assert that both values are not equal. (Uses the not equality operator
     * <code>!=</code>.)
     *
     * @param expected {var} Reference value
     * @param found {var} found value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNotEquals : function(expected, found, msg){

      expected != found || this.__bs(msg || "", "Expected '", expected, "' to be not equal with '", found, "'!");
    },
    /**
     * Assert that both values are identical. (Uses the identity operator
     * <code>===</code>.)
     *
     * @param expected {var} Reference value
     * @param found {var} found value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertIdentical : function(expected, found, msg){

      expected === found || this.__bs(msg || "", "Expected '", expected, "' (identical) but found '", found, "'!");
    },
    /**
     * Assert that both values are not identical. (Uses the not identity operator
     * <code>!==</code>.)
     *
     * @param expected {var} Reference value
     * @param found {var} found value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNotIdentical : function(expected, found, msg){

      expected !== found || this.__bs(msg || "", "Expected '", expected, "' to be not identical with '", found, "'!");
    },
    /**
     * Assert that the value is not <code>undefined</code>.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNotUndefined : function(value, msg){

      value !== undefined || this.__bs(msg || "", "Expected value not to be undefined but found undefined!");
    },
    /**
     * Assert that the value is <code>undefined</code>.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertUndefined : function(value, msg){

      value === undefined || this.__bs(msg || "", "Expected value to be undefined but found ", value, "!");
    },
    /**
     * Assert that the value is not <code>null</code>.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNotNull : function(value, msg){

      value !== null || this.__bs(msg || "", "Expected value not to be null but found null!");
    },
    /**
     * Assert that the value is <code>null</code>.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNull : function(value, msg){

      value === null || this.__bs(msg || "", "Expected value to be null but found ", value, "!");
    },
    /**
     * Assert that the first two arguments are equal, when serialized into
     * JSON.
     *
     * @param expected {var} The the expected value
     * @param found {var} The found value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertJsonEquals : function(expected, found, msg){

      this.assertEquals(qx.lang.Json.stringify(expected), qx.lang.Json.stringify(found), msg);
    },
    /**
     * Assert that the given string matches the regular expression
     *
     * @param str {String} String, which should match the regular expression
     * @param re {String|RegExp} Regular expression to match
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertMatch : function(str, re, msg){

      this.assertString(str);
      this.assert(qx.lang.Type.isRegExp(re) || qx.lang.Type.isString(re), "The parameter 're' must be a string or a regular expression.");
      str.search(re) >= 0 || this.__bs(msg || "", "The String '", str, "' does not match the regular expression '", re.toString(), "'!");
    },
    /**
     * Assert that the number of arguments is within the given range
     *
     * @param args {arguments} The <code>arguments<code> variable of a function
     * @param minCount {Integer} Minimal number of arguments
     * @param maxCount {Integer} Maximum number of arguments
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertArgumentsCount : function(args, minCount, maxCount, msg){

      var argCount = args.length;
      (argCount >= minCount && argCount <= maxCount) || this.__bs(msg || "", "Wrong number of arguments given. Expected '", minCount, "' to '", maxCount, "' arguments but found '", argCount, "' arguments.");
    },
    /**
     * Assert that an event is fired.
     *
     * @param obj {Object} The object on which the event should be fired.
     * @param event {String} The event which should be fired.
     * @param invokeFunc {Function} The function which will be invoked and which
     *   fires the event.
     * @param listenerFunc {Function?null} The function which will be invoked in the
     *   listener. The function receives one parameter which is the event.
     * @param msg {String?""} Message to be shows if the assertion fails.
     */
    assertEventFired : function(obj, event, invokeFunc, listenerFunc, msg){

      var called = false;
      var listener = function(e){

        if(listenerFunc){

          listenerFunc.call(obj, e);
        };
        called = true;
      };
      var id;
      try{

        id = obj.addListener(event, listener, obj);
        invokeFunc.call(obj);
      } catch(ex) {

        throw ex;
      }finally{

        try{

          obj.removeListenerById(id);
        } catch(ex) {
        };
      };
      called === true || this.__bs(msg || "", "Event (", event, ") not fired.");
    },
    /**
     * Assert that an event is not fired.
     *
     * @param obj {Object} The object on which the event should be fired.
     * @param event {String} The event which should be fired.
     * @param invokeFunc {Function} The function which will be invoked and which
     *   should not fire the event.
     * @param msg {String} Message to be shows if the assertion fails.
     */
    assertEventNotFired : function(obj, event, invokeFunc, msg){

      var called = false;
      var listener = function(e){

        called = true;
      };
      var id = obj.addListener(event, listener, obj);
      invokeFunc.call();
      called === false || this.__bs(msg || "", "Event (", event, ") was fired.");
      obj.removeListenerById(id);
    },
    /**
     * Asserts that the callback raises a matching exception.
     *
     * @param callback {Function} function to check
     * @param exception {Error?Error} Expected constructor of the exception.
     *   The assertion fails if the raised exception is not an instance of the
     *   parameter.
     * @param re {String|RegExp} The assertion fails if the error message does
     *   not match this parameter
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertException : function(callback, exception, re, msg){

      var exception = exception || Error;
      var error;
      try{

        this.__br = false;
        callback();
      } catch(ex) {

        error = ex;
      }finally{

        this.__br = true;
      };
      if(error == null){

        this.__bs(msg || "", "The function did not raise an exception!");
      };
      error instanceof exception || this.__bs(msg || "", "The raised exception does not have the expected type! ", exception, " != ", error);
      if(re){

        this.assertMatch(error.toString(), re, msg);
      };
    },
    /**
     * Assert that the value is an item in the given array.
     *
     * @param value {var} Value to check
     * @param array {Array} List of valid values
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertInArray : function(value, array, msg){

      array.indexOf(value) !== -1 || this.__bs(msg || "", "The value '", value, "' must have any of the values defined in the array '", array, "'");
    },
    /**
     * Assert that both array have identical array items.
     *
     * @param expected {Array} The expected array
     * @param found {Array} The found array
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertArrayEquals : function(expected, found, msg){

      this.assertArray(expected, msg);
      this.assertArray(found, msg);
      msg = msg || "Expected [" + expected.join(", ") + "], but found [" + found.join(", ") + "]";
      if(expected.length !== found.length){

        this.fail(msg, true);
      };
      for(var i = 0;i < expected.length;i++){

        if(expected[i] !== found[i]){

          this.fail(msg, true);
        };
      };
    },
    /**
     * Assert that the value is a key in the given map.
     *
     * @param value {var} Value to check
     * @param map {Map} Map, where the keys represent the valid values
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertKeyInMap : function(value, map, msg){

      map[value] !== undefined || this.__bs(msg || "", "The value '", value, "' must must be a key of the map '", map, "'");
    },
    /**
     * Assert that the value is a function.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertFunction : function(value, msg){

      qx.lang.Type.isFunction(value) || this.__bs(msg || "", "Expected value to be typeof function but found ", value, "!");
    },
    /**
     * Assert that the value is a string.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertString : function(value, msg){

      qx.lang.Type.isString(value) || this.__bs(msg || "", "Expected value to be a string but found ", value, "!");
    },
    /**
     * Assert that the value is a boolean.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertBoolean : function(value, msg){

      qx.lang.Type.isBoolean(value) || this.__bs(msg || "", "Expected value to be a boolean but found ", value, "!");
    },
    /**
     * Assert that the value is a number.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNumber : function(value, msg){

      (qx.lang.Type.isNumber(value) && isFinite(value)) || this.__bs(msg || "", "Expected value to be a number but found ", value, "!");
    },
    /**
     * Assert that the value is a number >= 0.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertPositiveNumber : function(value, msg){

      (qx.lang.Type.isNumber(value) && isFinite(value) && value >= 0) || this.__bs(msg || "", "Expected value to be a number >= 0 but found ", value, "!");
    },
    /**
     * Assert that the value is an integer.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertInteger : function(value, msg){

      (qx.lang.Type.isNumber(value) && isFinite(value) && value % 1 === 0) || this.__bs(msg || "", "Expected value to be an integer but found ", value, "!");
    },
    /**
     * Assert that the value is an integer >= 0.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertPositiveInteger : function(value, msg){

      var condition = (qx.lang.Type.isNumber(value) && isFinite(value) && value % 1 === 0 && value >= 0);
      condition || this.__bs(msg || "", "Expected value to be an integer >= 0 but found ", value, "!");
    },
    /**
     * Assert that the value is inside the given range.
     *
     * @param value {var} Value to check
     * @param min {Number} lower bound
     * @param max {Number} upper bound
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertInRange : function(value, min, max, msg){

      (value >= min && value <= max) || this.__bs(msg || "", qx.lang.String.format("Expected value '%1' to be in the range '%2'..'%3'!", [value, min, max]));
    },
    /**
     * Assert that the value is an object.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertObject : function(value, msg){

      var condition = value !== null && (qx.lang.Type.isObject(value) || typeof value === "object");
      condition || this.__bs(msg || "", "Expected value to be typeof object but found ", (value), "!");
    },
    /**
     * Assert that the value is an array.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertArray : function(value, msg){

      qx.lang.Type.isArray(value) || this.__bs(msg || "", "Expected value to be an array but found ", value, "!");
    },
    /**
     * Assert that the value is a map either created using <code>new Object</code>
     * or by using the object literal notation <code>{ ... }</code>.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertMap : function(value, msg){

      qx.lang.Type.isObject(value) || this.__bs(msg || "", "Expected value to be a map but found ", value, "!");
    },
    /**
    * Assert that the value is a regular expression.
    *
    * @param value {var} Value to check
    * @param msg {String} Message to be shown if the assertion fails.
    */
    assertRegExp : function(value, msg){

      qx.lang.Type.isRegExp(value) || this.__bs(msg || "", "Expected value to be a regular expression but found ", value, "!");
    },
    /**
     * Assert that the value has the given type using the <code>typeof</code>
     * operator. Because the type is not always what it is supposed to be it is
     * better to use more explicit checks like {@link #assertString} or
     * {@link #assertArray}.
     *
     * @param value {var} Value to check
     * @param type {String} expected type of the value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertType : function(value, type, msg){

      this.assertString(type, "Invalid argument 'type'");
      typeof (value) === type || this.__bs(msg || "", "Expected value to be typeof '", type, "' but found ", value, "!");
    },
    /**
     * Assert that the value is an instance of the given class.
     *
     * @param value {var} Value to check
     * @param clazz {Class} The value must be an instance of this class
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertInstance : function(value, clazz, msg){

      var className = clazz.classname || clazz + "";
      value instanceof clazz || this.__bs(msg || "", "Expected value to be instanceof '", className, "' but found ", value, "!");
    },
    /**
     * Assert that the value implements the given interface.
     *
     * @param value {var} Value to check
     * @param iface {Class} The value must implement this interface
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertInterface : function(value, iface, msg){

      qx.Class.implementsInterface(value, iface) || this.__bs(msg || "", "Expected object '", value, "' to implement the interface '", iface, "'!");
    },
    /**
     * Assert that the value represents the given CSS color value. This method
     * parses the color strings and compares the RGB values. It is able to
     * parse values supported by {@link qx.util.ColorUtil#stringToRgb}.
     *
     *  @param expected {String} The expected color
     *  @param value {String} The value to check
     *  @param msg {String} Message to be shown if the assertion fails.
     */
    assertCssColor : function(expected, value, msg){

      var ColorUtil = qx.Class.getByName("qx.util.ColorUtil");
      if(!ColorUtil){

        throw new Error("qx.util.ColorUtil not available! Your code must have a dependency on 'qx.util.ColorUtil'");
      };
      var expectedRgb = ColorUtil.stringToRgb(expected);
      try{

        var valueRgb = ColorUtil.stringToRgb(value);
      } catch(ex) {

        this.__bs(msg || "", "Expected value to be the CSS color '", expected, "' (rgb(", expectedRgb.join(","), ")), but found value '", value, "', which cannot be converted to a CSS color!");
      };
      var condition = expectedRgb[0] == valueRgb[0] && expectedRgb[1] == valueRgb[1] && expectedRgb[2] == valueRgb[2];
      condition || this.__bs(msg || "", "Expected value to be the CSS color '", expectedRgb, "' (rgb(", expectedRgb.join(","), ")), but found value '", value, "' (rgb(", valueRgb.join(","), "))!");
    },
    /**
     * Assert that the value is a DOM element.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertElement : function(value, msg){

      // see qx.dom.Node.isElement
      !!(value && value.nodeType === 1) || this.__bs(msg || "", "Expected value to be a DOM element but found  '", value, "'!");
    },
    /**
     * Assert that the value is an instance of {@link qx.core.Object}.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertQxObject : function(value, msg){

      this.__bu(value, "qx.core.Object") || this.__bs(msg || "", "Expected value to be a qooxdoo object but found ", value, "!");
    },
    /**
     * Assert that the value is an instance of {@link qx.ui.core.Widget}.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertQxWidget : function(value, msg){

      this.__bu(value, "qx.ui.core.Widget") || this.__bs(msg || "", "Expected value to be a qooxdoo widget but found ", value, "!");
    },
    /**
     * Internal helper for checking the instance of a qooxdoo object using the
     * classname.
     *
     * @param object {var} The object to check.
     * @param classname {String} The classname of the class as string.
     * @return {Boolean} <code>true</code> if the object is an instance of the
     * class
     */
    __bu : function(object, classname){

      if(!object){

        return false;
      };
      var clazz = object.constructor;
      while(clazz){

        if(clazz.classname === classname){

          return true;
        };
        clazz = clazz.superclass;
      };
      return false;
    }
  }
});

/* ************************************************************************

  qooxdoo - the new era of web development

  http://qooxdoo.org

  Copyright:
    2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

  License:
    LGPL: http://www.gnu.org/licenses/lgpl.html
    EPL: http://www.eclipse.org/org/documents/epl-v10.php
    See the LICENSE file in the project's top-level directory for details.

  Authors:
    * Fabian Jakobs (fjakobs)
    * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * This class is the common super class for all error classes in qooxdoo.
 *
 * It has a comment and a fail message as members. The toString method returns
 * the comment and the fail message separated by a colon.
 */
qx.Class.define("qx.type.BaseError", {
  extend : Error,
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  /**
   * @param comment {String} Comment passed to the assertion call
   * @param failMessage {String} Fail message provided by the assertion
   */
  construct : function(comment, failMessage){

    var inst = Error.call(this, failMessage);
    // map stack trace properties since they're not added by Error's constructor
    if(inst.stack){

      this.stack = inst.stack;
    };
    if(inst.stacktrace){

      this.stacktrace = inst.stacktrace;
    };
    this.__bv = comment || "";
    // opera 10 crashes if the message is an empty string!!!?!?!
    this.message = failMessage || qx.type.BaseError.DEFAULTMESSAGE;
  },
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  statics : {
    DEFAULTMESSAGE : "error"
  },
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members : {
    __bw : null,
    __bv : null,
    /** @type {String} Fail message provided by the assertion */
    message : null,
    /**
     * Comment passed to the assertion call
     *
     * @return {String} The comment passed to the assertion call
     */
    getComment : function(){

      return this.__bv;
    },
    /**
     * Get the error message
     *
     * @return {String} The error message
     */
    toString : function(){

      return this.__bv + (this.message ? ": " + this.message : "");
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */
/**
 * Assertion errors are thrown if an assertion in {@link qx.core.Assert}
 * fails.
 */
qx.Class.define("qx.core.AssertionError", {
  extend : qx.type.BaseError,
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  /**
   * @param comment {String} Comment passed to the assertion call
   * @param failMessage {String} Fail message provided by the assertion
   */
  construct : function(comment, failMessage){

    qx.type.BaseError.call(this, comment, failMessage);
    this.__bx = qx.dev.StackTrace.getStackTrace();
  },
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members : {
    __bx : null,
    /**
     * Stack trace of the error
     *
     * @return {String[]} The stack trace of the location the exception was thrown
     */
    getStackTrace : function(){

      return this.__bx;
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */
/**
 * Methods to get information about the JavaScript call stack.
 *
 * @require(qx.lang.normalize.String)
 * @ignore(qx.bom.client.EcmaScript.*)
 * @ignore(qx.Class.*)
 */
qx.Bootstrap.define("qx.dev.StackTrace", {
  statics : {
    /**
     * Optional user-defined function to convert source file names into readable
     * class names. Will be called with the source file name extracted from the
     * browser's stack trace information as the only argument. The returned
     * string is used in the output of {@link #getStackTraceFromError}
     */
    FILENAME_TO_CLASSNAME : null,
    /**
     * Optional user-defined formatting function for stack trace information.
     * Will be called by with an array of strings representing the calls in the
     * stack trace. {@link #getStackTraceFromError} will return the output of
     * this function. Must return an array of strings.
     */
    FORMAT_STACKTRACE : null,
    /**
     * Get a stack trace of the current position in the code.
     *
     * Browser compatibility:
     * <ul>
     *   <li>In new versions of Gecko, WebKit and Opera, the output of
     *   {@link #getStackTraceFromError} and {@link #getStackTraceFromCaller} is
     *   combined to generate the richest trace, including line numbers.</li>
     *   <li>For Internet Explorer (and other engines that do not provide stack
     *    traces), {@link #getStackTraceFromCaller} is used</li>
     * </ul>
     *
     * @return {String[]} Stack trace of the current position in the code. Each line in the array
     *     represents one call in the stack trace.
     */
    getStackTrace : function(){

      var trace = [];
      try{

        throw new Error();
      } catch(ex) {

        if(qx.dev.StackTrace.hasEnvironmentCheck && qx.core.Environment.get("ecmascript.error.stacktrace")){

          var errorTrace = qx.dev.StackTrace.getStackTraceFromError(ex);
          var callerTrace = qx.dev.StackTrace.getStackTraceFromCaller(arguments);
          qx.lang.Array.removeAt(errorTrace, 0);
          trace = callerTrace.length > errorTrace.length ? callerTrace : errorTrace;
          for(var i = 0;i < Math.min(callerTrace.length, errorTrace.length);i++){

            var callerCall = callerTrace[i];
            if(callerCall.indexOf("anonymous") >= 0){

              continue;
            };
            var methodName = null;
            var callerArr = callerCall.split(".");
            var mO = /(.*?)\(/.exec(callerArr[callerArr.length - 1]);
            if(mO && mO.length == 2){

              methodName = mO[1];
              callerArr.pop();
            };
            if(callerArr[callerArr.length - 1] == "prototype"){

              callerArr.pop();
            };
            var callerClassName = callerArr.join(".");
            var errorCall = errorTrace[i];
            var errorArr = errorCall.split(":");
            var errorClassName = errorArr[0];
            var lineNumber = errorArr[1];
            var columnNumber;
            if(errorArr[2]){

              columnNumber = errorArr[2];
            };
            var className = null;
            if(qx.Class && qx.Class.getByName(errorClassName)){

              className = errorClassName;
            } else {

              className = callerClassName;
            };
            var line = className;
            if(methodName){

              line += "." + methodName;
            };
            line += ":" + lineNumber;
            if(columnNumber){

              line += ":" + columnNumber;
            };
            trace[i] = line;
          };
        } else {

          trace = this.getStackTraceFromCaller(arguments);
        };
      };
      return trace;
    },
    /**
     * Get a stack trace from the arguments special variable using the
     * <code>caller</code> property.
     *
     * This methods returns class/mixin and function names of each step
     * in the call stack.
     *
     * Recursion is not supported.
     *
     * @param args {arguments} arguments variable.
     * @return {String[]} Stack trace of caller of the function the arguments variable belongs to.
     *     Each line in the array represents one call in the stack trace.
     * @signature function(args)
     */
    getStackTraceFromCaller : function(args){

      var trace = [];
      var fcn = qx.lang.Function.getCaller(args);
      var knownFunction = {
      };
      while(fcn){

        var fcnName = qx.lang.Function.getName(fcn);
        trace.push(fcnName);
        try{

          fcn = fcn.caller;
        } catch(ex) {

          break;
        };
        if(!fcn){

          break;
        };
        // avoid infinite recursion
        var hash = qx.core.ObjectRegistry.toHashCode(fcn);
        if(knownFunction[hash]){

          trace.push("...");
          break;
        };
        knownFunction[hash] = fcn;
      };
      return trace;
    },
    /**
     * Try to get a stack trace from an Error object. Mozilla sets the field
     * <code>stack</code> for Error objects thrown using <code>throw new Error()</code>.
     * From this field it is possible to get a stack trace from the position
     * the exception was thrown at.
     *
     * This will get the JavaScript file names and the line numbers of each call.
     * The file names are converted into qooxdoo class names if possible (customizable
     * via {@link #FILENAME_TO_CLASSNAME}).
     *
     * The stack trace can be custom formatted using {@link #FORMAT_STACKTRACE}.
     *
     * This works reliably in Gecko-based browsers. Later Opera versions and
     * Chrome also provide a useful stack trace. For Safari, only the class or
     * file name and line number where the error occurred are returned.
     * IE 6/7/8/9 does not attach any stack information to error objects so an
     * empty array is returned.
     *
     * @param error {Error} Error exception instance.
     * @return {String[]} Stack trace of the exception. Each line in the array
     *     represents one call in the stack trace.
     */
    getStackTraceFromError : function(error){

      var trace = [];
      var lineRe,hit,className,lineNumber,columnNumber,fileName,url;
      var traceProp = qx.dev.StackTrace.hasEnvironmentCheck ? qx.core.Environment.get("ecmascript.error.stacktrace") : null;
      if(traceProp === "stack"){

        if(!error.stack){

          return trace;
        };
        // Gecko style, e.g. "()@http://localhost:8080/webcomponent-test-SNAPSHOT/webcomponent/js/com/ptvag/webcomponent/common/log/Logger:253"
        lineRe = /@(.+):(\d+)$/gm;
        while((hit = lineRe.exec(error.stack)) != null){

          url = hit[1];
          lineNumber = hit[2];
          className = this.__by(url);
          trace.push(className + ":" + lineNumber);
        };
        if(trace.length > 0){

          return this.__bA(trace);
        };
        /*
         * Chrome trace info comes in two flavors:
         * at [jsObject].function (fileUrl:line:char)
         * at fileUrl:line:char
         */
        lineRe = /at (.*)/gm;
        var fileReParens = /\((.*?)(:[^\/].*)\)/;
        var fileRe = /(.*?)(:[^\/].*)/;
        while((hit = lineRe.exec(error.stack)) != null){

          var fileMatch = fileReParens.exec(hit[1]);
          if(!fileMatch){

            fileMatch = fileRe.exec(hit[1]);
          };
          if(fileMatch){

            className = this.__by(fileMatch[1]);
            trace.push(className + fileMatch[2]);
          } else {

            trace.push(hit[1]);
          };
        };
      } else if(traceProp === "stacktrace"){

        // Opera
        var stacktrace = error.stacktrace;
        if(!stacktrace){

          return trace;
        };
        if(stacktrace.indexOf("Error created at") >= 0){

          stacktrace = stacktrace.split("Error created at")[0];
        };
        // new Opera style (10.6+)
        lineRe = /line\ (\d+?),\ column\ (\d+?)\ in\ (?:.*?)\ in\ (.*?):[^\/]/gm;
        while((hit = lineRe.exec(stacktrace)) != null){

          lineNumber = hit[1];
          columnNumber = hit[2];
          url = hit[3];
          className = this.__by(url);
          trace.push(className + ":" + lineNumber + ":" + columnNumber);
        };
        if(trace.length > 0){

          return this.__bA(trace);
        };
        // older Opera style
        lineRe = /Line\ (\d+?)\ of\ linked\ script\ (.*?)$/gm;
        while((hit = lineRe.exec(stacktrace)) != null){

          lineNumber = hit[1];
          url = hit[2];
          className = this.__by(url);
          trace.push(className + ":" + lineNumber);
        };
      } else if(error.message && error.message.indexOf("Backtrace:") >= 0){

        // Some old Opera versions append the trace to the message property
        var traceString = error.message.split("Backtrace:")[1].trim();
        var lines = traceString.split("\n");
        for(var i = 0;i < lines.length;i++){

          var reResult = lines[i].match(/\s*Line ([0-9]+) of.* (\S.*)/);
          if(reResult && reResult.length >= 2){

            lineNumber = reResult[1];
            fileName = this.__by(reResult[2]);
            trace.push(fileName + ":" + lineNumber);
          };
        };
      } else if(error.sourceURL && error.line){

        // Safari
        trace.push(this.__by(error.sourceURL) + ":" + error.line);
      };;;
      return this.__bA(trace);
    },
    /**
     * Converts the URL of a JavaScript file to a class name using either a
     * user-defined ({@link #FILENAME_TO_CLASSNAME}) or default
     * ({@link #__fileNameToClassNameDefault}) converter
     *
     * @param fileName {String} URL of the JavaScript file
     * @return {String} Result of the conversion
     */
    __by : function(fileName){

      if(typeof qx.dev.StackTrace.FILENAME_TO_CLASSNAME == "function"){

        var convertedName = qx.dev.StackTrace.FILENAME_TO_CLASSNAME(fileName);
        if(qx.core.Environment.get("qx.debug") && !qx.lang.Type.isString(convertedName)){

          throw new Error("FILENAME_TO_CLASSNAME must return a string!");
        };
        return convertedName;
      };
      return qx.dev.StackTrace.__bz(fileName);
    },
    /**
     * Converts the URL of a JavaScript file to a class name if the file is
     * named using the qooxdoo naming conventions.
     *
     * @param fileName {String} URL of the JavaScript file
     * @return {String} class name of the file if conversion was possible.
     * Otherwise the fileName is returned unmodified.
     */
    __bz : function(fileName){

      var scriptDir = "/source/class/";
      var jsPos = fileName.indexOf(scriptDir);
      var paramPos = fileName.indexOf("?");
      if(paramPos >= 0){

        fileName = fileName.substring(0, paramPos);
      };
      var className = (jsPos == -1) ? fileName : fileName.substring(jsPos + scriptDir.length).replace(/\//g, ".").replace(/\.js$/, "");
      return className;
    },
    /**
     * Runs the given stack trace array through the formatter function
     * ({@link #FORMAT_STACKTRACE}) if available and returns it. Otherwise, the
     * original array is returned
     *
     * @param trace {String[]} Stack trace information
     * @return {String[]} Formatted stack trace info
     */
    __bA : function(trace){

      if(typeof qx.dev.StackTrace.FORMAT_STACKTRACE == "function"){

        trace = qx.dev.StackTrace.FORMAT_STACKTRACE(trace);
        // Can't use qx.core.Assert here since it throws an AssertionError which
        // calls getStackTrace in its constructor, leading to infinite recursion
        if(qx.core.Environment.get("qx.debug") && !qx.lang.Type.isArray(trace)){

          throw new Error("FORMAT_STACKTRACE must return an array of strings!");
        };
      };
      return trace;
    }
  },
  defer : function(statics){

    // This is necessary to avoid an infinite loop when logging the absence
    // of the "ecmascript.error.stacktrace" environment key.
    statics.hasEnvironmentCheck = qx.bom.client.EcmaScript && qx.bom.client.EcmaScript.getStackTrace;
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

   ======================================================================

   This class contains code based on the following work:

   * jQuery
     http://jquery.com
     Version 1.3.1

     Copyright:
       2009 John Resig

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

************************************************************************ */
/**
 * Static helper functions for arrays with a lot of often used convenience
 * methods like <code>remove</code> or <code>contains</code>.
 *
 * The native JavaScript Array is not modified by this class. However,
 * there are modifications to the native Array in {@link qx.lang.normalize.Array} for
 * browsers that do not support certain JavaScript features natively .
 *
 * @ignore(qx.data)
 * @ignore(qx.data.IListData)
 * @ignore(qx.Class.*)
 * @require(qx.lang.normalize.Date)
 */
qx.Bootstrap.define("qx.lang.Array", {
  statics : {
    /**
     * Converts an array like object to any other array like
     * object.
     *
     * Attention: The returned array may be same
     * instance as the incoming one if the constructor is identical!
     *
     * @param object {var} any array-like object
     * @param constructor {Function} constructor of the new instance
     * @param offset {Integer?0} position to start from
     * @return {Array} the converted array
     */
    cast : function(object, constructor, offset){

      if(object.constructor === constructor){

        return object;
      };
      if(qx.data && qx.data.IListData){

        if(qx.Class && qx.Class.hasInterface(object, qx.data.IListData)){

          var object = object.toArray();
        };
      };
      // Create from given constructor
      var ret = new constructor;
      // Some collections in mshtml are not able to be sliced.
      // These lines are a special workaround for this client.
      if((qx.core.Environment.get("engine.name") == "mshtml")){

        if(object.item){

          for(var i = offset || 0,l = object.length;i < l;i++){

            ret.push(object[i]);
          };
          return ret;
        };
      };
      // Copy over items
      if(Object.prototype.toString.call(object) === "[object Array]" && offset == null){

        ret.push.apply(ret, object);
      } else {

        ret.push.apply(ret, Array.prototype.slice.call(object, offset || 0));
      };
      return ret;
    },
    /**
     * Convert an arguments object into an array.
     *
     * @param args {arguments} arguments object
     * @param offset {Integer?0} position to start from
     * @return {Array} a newly created array (copy) with the content of the arguments object.
     */
    fromArguments : function(args, offset){

      return Array.prototype.slice.call(args, offset || 0);
    },
    /**
     * Convert a (node) collection into an array
     *
     * @param coll {var} node collection
     * @return {Array} a newly created array (copy) with the content of the node collection.
     */
    fromCollection : function(coll){

      // The native Array.slice cannot be used with some Array-like objects
      // including NodeLists in older IEs
      if((qx.core.Environment.get("engine.name") == "mshtml")){

        if(coll.item){

          var arr = [];
          for(var i = 0,l = coll.length;i < l;i++){

            arr[i] = coll[i];
          };
          return arr;
        };
      };
      return Array.prototype.slice.call(coll, 0);
    },
    /**
     * Expand shorthand definition to a four element list.
     * This is an utility function for padding/margin and all other shorthand handling.
     *
     * @param input {Array} arr with one to four elements
     * @return {Array} an arr with four elements
     */
    fromShortHand : function(input){

      var len = input.length;
      var result = qx.lang.Array.clone(input);
      // Copy Values (according to the length)
      switch(len){case 1:
      result[1] = result[2] = result[3] = result[0];
      break;case 2:
      result[2] = result[0];// no break here
      case 3:
      result[3] = result[1];};
      // Return list with 4 items
      return result;
    },
    /**
     * Return a copy of the given array
     *
     * @param arr {Array} the array to copy
     * @return {Array} copy of the array
     */
    clone : function(arr){

      return arr.concat();
    },
    /**
     * Insert an element at a given position into the array
     *
     * @param arr {Array} the array
     * @param obj {var} the element to insert
     * @param i {Integer} position where to insert the element into the array
     * @return {Array} the array
     */
    insertAt : function(arr, obj, i){

      arr.splice(i, 0, obj);
      return arr;
    },
    /**
     * Insert an element into the array before a given second element.
     *
     * @param arr {Array} the array
     * @param obj {var} object to be inserted
     * @param obj2 {var} insert obj1 before this object
     * @return {Array} the array
     */
    insertBefore : function(arr, obj, obj2){

      var i = arr.indexOf(obj2);
      if(i == -1){

        arr.push(obj);
      } else {

        arr.splice(i, 0, obj);
      };
      return arr;
    },
    /**
     * Insert an element into the array after a given second element.
     *
     * @param arr {Array} the array
     * @param obj {var} object to be inserted
     * @param obj2 {var} insert obj1 after this object
     * @return {Array} the array
     */
    insertAfter : function(arr, obj, obj2){

      var i = arr.indexOf(obj2);
      if(i == -1 || i == (arr.length - 1)){

        arr.push(obj);
      } else {

        arr.splice(i + 1, 0, obj);
      };
      return arr;
    },
    /**
     * Remove an element from the array at the given index
     *
     * @param arr {Array} the array
     * @param i {Integer} index of the element to be removed
     * @return {var} The removed element.
     */
    removeAt : function(arr, i){

      return arr.splice(i, 1)[0];
    },
    /**
     * Remove all elements from the array
     *
     * @param arr {Array} the array
     * @return {Array} empty array
     */
    removeAll : function(arr){

      arr.length = 0;
      return this;
    },
    /**
     * Append the elements of an array to the array
     *
     * @param arr1 {Array} the array
     * @param arr2 {Array} the elements of this array will be appended to other one
     * @return {Array} The modified array.
     * @throws {Error} if one of the arguments is not an array
     */
    append : function(arr1, arr2){

      // this check is important because opera throws an uncatchable error if apply is called without
      // an arr as second argument.
      if(qx.core.Environment.get("qx.debug")){

        qx.core.Assert && qx.core.Assert.assertArray(arr1, "The first parameter must be an array.");
        qx.core.Assert && qx.core.Assert.assertArray(arr2, "The second parameter must be an array.");
      };
      Array.prototype.push.apply(arr1, arr2);
      return arr1;
    },
    /**
     * Modifies the first array as it removes all elements
     * which are listed in the second array as well.
     *
     * @param arr1 {Array} the array
     * @param arr2 {Array} the elements of this array will be excluded from the other one
     * @return {Array} The modified array.
     * @throws {Error} if one of the arguments is not an array
     */
    exclude : function(arr1, arr2){

      // this check is important because opera throws an uncatchable error if apply is called without
      // an arr as second argument.
      if(qx.core.Environment.get("qx.debug")){

        qx.core.Assert && qx.core.Assert.assertArray(arr1, "The first parameter must be an array.");
        qx.core.Assert && qx.core.Assert.assertArray(arr2, "The second parameter must be an array.");
      };
      for(var i = 0,il = arr2.length,index;i < il;i++){

        index = arr1.indexOf(arr2[i]);
        if(index != -1){

          arr1.splice(index, 1);
        };
      };
      return arr1;
    },
    /**
     * Remove an element from the array.
     *
     * @param arr {Array} the array
     * @param obj {var} element to be removed from the array
     * @return {var} the removed element
     */
    remove : function(arr, obj){

      var i = arr.indexOf(obj);
      if(i != -1){

        arr.splice(i, 1);
        return obj;
      };
    },
    /**
     * Whether the array contains the given element
     *
     * @param arr {Array} the array
     * @param obj {var} object to look for
     * @return {Boolean} whether the arr contains the element
     */
    contains : function(arr, obj){

      return arr.indexOf(obj) !== -1;
    },
    /**
     * Check whether the two arrays have the same content. Checks only the
     * equality of the arrays' content.
     *
     * @param arr1 {Array} first array
     * @param arr2 {Array} second array
     * @return {Boolean} Whether the two arrays are equal
     */
    equals : function(arr1, arr2){

      var length = arr1.length;
      if(length !== arr2.length){

        return false;
      };
      for(var i = 0;i < length;i++){

        if(arr1[i] !== arr2[i]){

          return false;
        };
      };
      return true;
    },
    /**
     * Returns the sum of all values in the given array. Supports
     * numeric values only.
     *
     * @param arr {Number[]} Array to process
     * @return {Number} The sum of all values.
     */
    sum : function(arr){

      var result = 0;
      for(var i = 0,l = arr.length;i < l;i++){

        result += arr[i];
      };
      return result;
    },
    /**
     * Returns the highest value in the given array. Supports
     * numeric values only.
     *
     * @param arr {Number[]} Array to process
     * @return {Number | null} The highest of all values or undefined if array is empty.
     */
    max : function(arr){

      if(qx.core.Environment.get("qx.debug")){

        qx.core.Assert && qx.core.Assert.assertArray(arr, "Parameter must be an array.");
      };
      var i,len = arr.length,result = arr[0];
      for(i = 1;i < len;i++){

        if(arr[i] > result){

          result = arr[i];
        };
      };
      return result === undefined ? null : result;
    },
    /**
     * Returns the lowest value in the given array. Supports
     * numeric values only.
     *
     * @param arr {Number[]} Array to process
     * @return {Number | null} The lowest of all values or undefined if array is empty.
     */
    min : function(arr){

      if(qx.core.Environment.get("qx.debug")){

        qx.core.Assert && qx.core.Assert.assertArray(arr, "Parameter must be an array.");
      };
      var i,len = arr.length,result = arr[0];
      for(i = 1;i < len;i++){

        if(arr[i] < result){

          result = arr[i];
        };
      };
      return result === undefined ? null : result;
    },
    /**
     * Recreates an array which is free of all duplicate elements from the original.
     *
     * This method does not modify the original array!
     *
     * Keep in mind that this methods deletes undefined indexes.
     *
     * @param arr {Array} Incoming array
     * @return {Array} Returns a copy with no duplicates
     */
    unique : function(arr){

      var ret = [],doneStrings = {
      },doneNumbers = {
      },doneObjects = {
      };
      var value,count = 0;
      var key = "qx" + Date.now();
      var hasNull = false,hasFalse = false,hasTrue = false;
      // Rebuild array and omit duplicates
      for(var i = 0,len = arr.length;i < len;i++){

        value = arr[i];
        // Differ between null, primitives and reference types
        if(value === null){

          if(!hasNull){

            hasNull = true;
            ret.push(value);
          };
        } else if(value === undefined){
        } else if(value === false){

          if(!hasFalse){

            hasFalse = true;
            ret.push(value);
          };
        } else if(value === true){

          if(!hasTrue){

            hasTrue = true;
            ret.push(value);
          };
        } else if(typeof value === "string"){

          if(!doneStrings[value]){

            doneStrings[value] = 1;
            ret.push(value);
          };
        } else if(typeof value === "number"){

          if(!doneNumbers[value]){

            doneNumbers[value] = 1;
            ret.push(value);
          };
        } else {

          var hash = value[key];
          if(hash == null){

            hash = value[key] = count++;
          };
          if(!doneObjects[hash]){

            doneObjects[hash] = value;
            ret.push(value);
          };
        };;;;;
      };
      // Clear object hashs
      for(var hash in doneObjects){

        try{

          delete doneObjects[hash][key];
        } catch(ex) {

          try{

            doneObjects[hash][key] = null;
          } catch(ex1) {

            throw new Error("Cannot clean-up map entry doneObjects[" + hash + "][" + key + "]");
          };
        };
      };
      return ret;
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Martin Wittemann (martinwittemann)

   ======================================================================

   This class contains code from:

     Copyright:
       2011 Pocket Widget S.L., Spain, http://www.pocketwidget.com

     License:
       LGPL: http://www.gnu.org/licenses/lgpl.html
       EPL: http://www.eclipse.org/org/documents/epl-v10.php

     Authors:
       * Javier Martinez Villacampa

************************************************************************ */
/**
 * This class comes with all relevant information regarding
 * the client's engine.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Engine", {
  // General: http://en.wikipedia.org/wiki/Browser_timeline
  // Webkit: https://developer.apple.com/internet/safari/uamatrix.html
  // Firefox: http://en.wikipedia.org/wiki/History_of_Mozilla_Firefox
  // Maple: http://www.scribd.com/doc/46675822/2011-SDK2-0-Maple-Browser-Specification-V1-00
  statics : {
    /**
     * Returns the version of the engine.
     *
     * @return {String} The version number of the current engine.
     * @internal
     */
    getVersion : function(){

      var agent = window.navigator.userAgent;
      var version = "";
      if(qx.bom.client.Engine.__bB()){

        // Opera has a special versioning scheme, where the second part is combined
        // e.g. 8.54 which should be handled like 8.5.4 to be compatible to the
        // common versioning system used by other browsers
        if(/Opera[\s\/]([0-9]+)\.([0-9])([0-9]*)/.test(agent)){

          // opera >= 10 has as a first verison 9.80 and adds the proper version
          // in a separate "Version/" postfix
          // http://my.opera.com/chooseopera/blog/2009/05/29/changes-in-operas-user-agent-string-format
          if(agent.indexOf("Version/") != -1){

            var match = agent.match(/Version\/(\d+)\.(\d+)/);
            // ignore the first match, its the whole version string
            version = match[1] + "." + match[2].charAt(0) + "." + match[2].substring(1, match[2].length);
          } else {

            version = RegExp.$1 + "." + RegExp.$2;
            if(RegExp.$3 != ""){

              version += "." + RegExp.$3;
            };
          };
        };
      } else if(qx.bom.client.Engine.__bC()){

        if(/AppleWebKit\/([^ ]+)/.test(agent)){

          version = RegExp.$1;
          // We need to filter these invalid characters
          var invalidCharacter = RegExp("[^\\.0-9]").exec(version);
          if(invalidCharacter){

            version = version.slice(0, invalidCharacter.index);
          };
        };
      } else if(qx.bom.client.Engine.__bE() || qx.bom.client.Engine.__bD()){

        // Parse "rv" section in user agent string
        if(/rv\:([^\);]+)(\)|;)/.test(agent)){

          version = RegExp.$1;
        };
      } else if(qx.bom.client.Engine.__bF()){

        var isTrident = /Trident\/([^\);]+)(\)|;)/.test(agent);
        if(/MSIE\s+([^\);]+)(\)|;)/.test(agent)){

          version = RegExp.$1;
          // If the IE8 or IE9 is running in the compatibility mode, the MSIE value
          // is set to an older version, but we need the correct version. The only
          // way is to compare the trident version.
          if(version < 8 && isTrident){

            if(RegExp.$1 == "4.0"){

              version = "8.0";
            } else if(RegExp.$1 == "5.0"){

              version = "9.0";
            };
          };
        } else if(isTrident){

          // IE 11 dropped the "MSIE" string
          var match = /\brv\:(\d+?\.\d+?)\b/.exec(agent);
          if(match){

            version = match[1];
          };
        };
      } else {

        var failFunction = window.qxFail;
        if(failFunction && typeof failFunction === "function"){

          version = failFunction().FULLVERSION;
        } else {

          version = "1.9.0.0";
          qx.Bootstrap.warn("Unsupported client: " + agent + "! Assumed gecko version 1.9.0.0 (Firefox 3.0).");
        };
      };;;
      return version;
    },
    /**
     * Returns the name of the engine.
     *
     * @return {String} The name of the current engine.
     * @internal
     */
    getName : function(){

      var name;
      if(qx.bom.client.Engine.__bB()){

        name = "opera";
      } else if(qx.bom.client.Engine.__bC()){

        name = "webkit";
      } else if(qx.bom.client.Engine.__bE() || qx.bom.client.Engine.__bD()){

        name = "gecko";
      } else if(qx.bom.client.Engine.__bF()){

        name = "mshtml";
      } else {

        // check for the fallback
        var failFunction = window.qxFail;
        if(failFunction && typeof failFunction === "function"){

          name = failFunction().NAME;
        } else {

          name = "gecko";
          qx.Bootstrap.warn("Unsupported client: " + window.navigator.userAgent + "! Assumed gecko version 1.9.0.0 (Firefox 3.0).");
        };
      };;;
      return name;
    },
    /**
     * Internal helper for checking for opera (presto powered).
     *
     * Note that with opera >= 15 their engine switched to blink, so
     * things like "window.opera" don't work anymore or changed (e.g. user agent).
     *
     * @return {Boolean} true, if its opera (presto powered).
     */
    __bB : function(){

      return window.opera && Object.prototype.toString.call(window.opera) == "[object Opera]";
    },
    /**
     * Internal helper for checking for webkit.
     * @return {Boolean} true, if its webkit.
     */
    __bC : function(){

      return window.navigator.userAgent.indexOf("AppleWebKit/") != -1;
    },
    /**
     * Internal helper for checking for Maple .
     * Maple is used in Samsung SMART TV 2010-2011 models. It's based on Gecko
     * engine 1.8.1.11.
     * @return {Boolean} true, if its maple.
     */
    __bD : function(){

      return window.navigator.userAgent.indexOf("Maple") != -1;
    },
    /**
     * Internal helper for checking for gecko.
     * @return {Boolean} true, if its gecko.
     */
    __bE : function(){

      return window.controllers && window.navigator.product === "Gecko" && window.navigator.userAgent.indexOf("Maple") == -1 && window.navigator.userAgent.indexOf("Trident") == -1;
    },
    /**
     * Internal helper to check for MSHTML.
     * @return {Boolean} true, if its MSHTML.
     */
    __bF : function(){

      return window.navigator.cpuClass && (/MSIE\s+([^\);]+)(\)|;)/.test(window.navigator.userAgent) || /Trident\/\d+?\.\d+?/.test(window.navigator.userAgent));
    }
  },
  defer : function(statics){

    qx.core.Environment.add("engine.version", statics.getVersion);
    qx.core.Environment.add("engine.name", statics.getName);
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

   ======================================================================

   This class contains code based on the following work:

   * Mootools
     http://mootools.net
     Version 1.1.1

     Copyright:
       2007 Valerio Proietti

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

************************************************************************ */
/**
 * Collection of helper methods operating on functions.
 *
 * @ignore(qx.core.Object)
 * @require(qx.lang.Array)
 */
qx.Bootstrap.define("qx.lang.Function", {
  statics : {
    /**
     * Extract the caller of a function from the arguments variable.
     * This will not work in Opera < 9.6.
     *
     * @param args {arguments} The local arguments variable
     * @return {Function} A reference to the calling function or "undefined" if caller is not supported.
     */
    getCaller : function(args){

      return args.caller ? args.caller.callee : args.callee.caller;
    },
    /**
     * Try to get a sensible textual description of a function object.
     * This may be the class/mixin and method name of a function
     * or at least the signature of the function.
     *
     * @param fcn {Function} function the get the name for.
     * @return {String} Name of the function.
     */
    getName : function(fcn){

      if(fcn.displayName){

        return fcn.displayName;
      };
      if(fcn.$$original || fcn.wrapper || fcn.classname){

        return fcn.classname + ".constructor()";
      };
      if(fcn.$$mixin){

        //members
        for(var key in fcn.$$mixin.$$members){

          if(fcn.$$mixin.$$members[key] == fcn){

            return fcn.$$mixin.name + ".prototype." + key + "()";
          };
        };
        // statics
        for(var key in fcn.$$mixin){

          if(fcn.$$mixin[key] == fcn){

            return fcn.$$mixin.name + "." + key + "()";
          };
        };
      };
      if(fcn.self){

        var clazz = fcn.self.constructor;
        if(clazz){

          // members
          for(var key in clazz.prototype){

            if(clazz.prototype[key] == fcn){

              return clazz.classname + ".prototype." + key + "()";
            };
          };
          // statics
          for(var key in clazz){

            if(clazz[key] == fcn){

              return clazz.classname + "." + key + "()";
            };
          };
        };
      };
      var fcnReResult = fcn.toString().match(/function\s*(\w*)\s*\(.*/);
      if(fcnReResult && fcnReResult.length >= 1 && fcnReResult[1]){

        return fcnReResult[1] + "()";
      };
      return 'anonymous()';
    },
    /**
     * Evaluates JavaScript code globally
     *
     * @lint ignoreDeprecated(eval)
     *
     * @param data {String} JavaScript commands
     * @return {var} Result of the execution
     */
    globalEval : function(data){

      if(window.execScript){

        return window.execScript(data);
      } else {

        return eval.call(window, data);
      };
    },
    /**
     * Base function for creating functional closures which is used by most other methods here.
     *
     * *Syntax*
     *
     * <pre class='javascript'>var createdFunction = qx.lang.Function.create(myFunction, [options]);</pre>
     *
     * @param func {Function} Original function to wrap
     * @param options {Map?} Map of options
     * <ul>
     * <li><strong>self</strong>: The object that the "this" of the function will refer to. Default is the same as the wrapper function is called.</li>
     * <li><strong>args</strong>: An array of arguments that will be passed as arguments to the function when called.
     *     Default is no custom arguments; the function will receive the standard arguments when called.</li>
     * <li><strong>delay</strong>: If set, the returned function will delay the actual execution by this amount of milliseconds and return a timer handle when called.
     *     Default is no delay.</li>
     * <li><strong>periodical</strong>: If set the returned function will periodically perform the actual execution with this specified interval
     *      and return a timer handle when called. Default is no periodical execution.</li>
     * <li><strong>attempt</strong>: If set to true, the returned function will try to execute and return either the results or false on error. Default is false.</li>
     * </ul>
     *
     * @return {Function} Wrapped function
     */
    create : function(func, options){

      if(qx.core.Environment.get("qx.debug")){

        qx.core.Assert && qx.core.Assert.assertFunction(func, "Invalid parameter 'func'.");
      };
      // Nothing to be done when there are no options.
      if(!options){

        return func;
      };
      // Check for at least one attribute.
      if(!(options.self || options.args || options.delay != null || options.periodical != null || options.attempt)){

        return func;
      };
      return function(event){

        if(qx.core.Environment.get("qx.debug")){

          if(qx.core.Object && options.self && qx.Bootstrap.isObject(options.self) && options.self.isDisposed && qx.Bootstrap.isFunction(options.self.isDisposed)){

            qx.core.Assert && qx.core.Assert.assertFalse(options.self.isDisposed(), "Trying to call a bound function with a disposed object as context: " + options.self.toString() + " :: " + qx.lang.Function.getName(func));
          };
        };
        // Convert (and copy) incoming arguments
        var args = qx.lang.Array.fromArguments(arguments);
        // Prepend static arguments
        if(options.args){

          args = options.args.concat(args);
        };
        if(options.delay || options.periodical){

          var returns = function(){

            return func.apply(options.self || this, args);
          };
          if(qx.core.Environment.get("qx.globalErrorHandling")){

            returns = qx.event.GlobalError.observeMethod(returns);
          };
          if(options.delay){

            return window.setTimeout(returns, options.delay);
          };
          if(options.periodical){

            return window.setInterval(returns, options.periodical);
          };
        } else if(options.attempt){

          var ret = false;
          try{

            ret = func.apply(options.self || this, args);
          } catch(ex) {
          };
          return ret;
        } else {

          return func.apply(options.self || this, args);
        };
      };
    },
    /**
     * Returns a function whose "this" is altered.
     *
     *
     * *Native way*
     *
     * This is also a feature of JavaScript 1.8.5 and will be supplied
     * by modern browsers. Including {@link qx.lang.normalize.Function}
     * will supply a cross browser normalization of the native
     * implementation. We like to encourage you to use the native function!
     *
     *
     * *Syntax*
     *
     * <pre class='javascript'>qx.lang.Function.bind(myFunction, [self, [varargs...]]);</pre>
     *
     * *Example*
     *
     * <pre class='javascript'>
     * function myFunction()
     * {
     *   this.setStyle('color', 'red');
     *   // note that 'this' here refers to myFunction, not an element
     *   // we'll need to bind this function to the element we want to alter
     * };
     *
     * var myBoundFunction = qx.lang.Function.bind(myFunction, myElement);
     * myBoundFunction(); // this will make the element myElement red.
     * </pre>
     *
     * If you find yourself using this static method a lot, you may be
     * interested in the bindTo() method in the mixin qx.core.MBindTo.
     *
     * @see qx.core.MBindTo
     *
     * @param func {Function} Original function to wrap
     * @param self {Object ? null} The object that the "this" of the function will refer to.
     * @param varargs {arguments ? null} The arguments to pass to the function.
     * @return {Function} The bound function.
     */
    bind : function(func, self, varargs){

      return this.create(func, {
        self : self,
        args : arguments.length > 2 ? qx.lang.Array.fromArguments(arguments, 2) : null
      });
    },
    /**
     * Returns a function whose arguments are pre-configured.
     *
     * *Syntax*
     *
     * <pre class='javascript'>qx.lang.Function.curry(myFunction, [varargs...]);</pre>
     *
     * *Example*
     *
     * <pre class='javascript'>
     * function myFunction(elem) {
     *   elem.setStyle('color', 'red');
     * };
     *
     * var myBoundFunction = qx.lang.Function.curry(myFunction, myElement);
     * myBoundFunction(); // this will make the element myElement red.
     * </pre>
     *
     * @param func {Function} Original function to wrap
     * @param varargs {arguments} The arguments to pass to the function.
     * @return {var} The pre-configured function.
     */
    curry : function(func, varargs){

      return this.create(func, {
        args : arguments.length > 1 ? qx.lang.Array.fromArguments(arguments, 1) : null
      });
    },
    /**
     * Returns a function which could be used as a listener for a native event callback.
     *
     * *Syntax*
     *
     * <pre class='javascript'>qx.lang.Function.listener(myFunction, [self, [varargs...]]);</pre>
     *
     * @param func {Function} Original function to wrap
     * @param self {Object ? null} The object that the "this" of the function will refer to.
     * @param varargs {arguments ? null} The arguments to pass to the function.
     * @return {var} The bound function.
     */
    listener : function(func, self, varargs){

      if(arguments.length < 3){

        return function(event){

          // Directly execute, but force first parameter to be the event object.
          return func.call(self || this, event || window.event);
        };
      } else {

        var optargs = qx.lang.Array.fromArguments(arguments, 2);
        return function(event){

          var args = [event || window.event];
          // Append static arguments
          args.push.apply(args, optargs);
          // Finally execute original method
          func.apply(self || this, args);
        };
      };
    },
    /**
     * Tries to execute the function.
     *
     * *Syntax*
     *
     * <pre class='javascript'>var result = qx.lang.Function.attempt(myFunction, [self, [varargs...]]);</pre>
     *
     * *Example*
     *
     * <pre class='javascript'>
     * var myObject = {
     *   'cow': 'moo!'
     * };
     *
     * var myFunction = function()
     * {
     *   for(var i = 0; i < arguments.length; i++) {
     *     if(!this[arguments[i]]) throw('doh!');
     *   }
     * };
     *
     * var result = qx.lang.Function.attempt(myFunction, myObject, 'pig', 'cow'); // false
     * </pre>
     *
     * @param func {Function} Original function to wrap
     * @param self {Object ? null} The object that the "this" of the function will refer to.
     * @param varargs {arguments ? null} The arguments to pass to the function.
     * @return {Boolean|var} <code>false</code> if an exception is thrown, else the function's return.
     */
    attempt : function(func, self, varargs){

      return this.create(func, {
        self : self,
        attempt : true,
        args : arguments.length > 2 ? qx.lang.Array.fromArguments(arguments, 2) : null
      })();
    },
    /**
     * Delays the execution of a function by a specified duration.
     *
     * *Syntax*
     *
     * <pre class='javascript'>var timeoutID = qx.lang.Function.delay(myFunction, [delay, [self, [varargs...]]]);</pre>
     *
     * *Example*
     *
     * <pre class='javascript'>
     * var myFunction = function(){ alert('moo! Element id is: ' + this.id); };
     * //wait 50 milliseconds, then call myFunction and bind myElement to it
     * qx.lang.Function.delay(myFunction, 50, myElement); // alerts: 'moo! Element id is: ... '
     *
     * // An anonymous function, example
     * qx.lang.Function.delay(function(){ alert('one second later...'); }, 1000); //wait a second and alert
     * </pre>
     *
     * @param func {Function} Original function to wrap
     * @param delay {Integer} The duration to wait (in milliseconds).
     * @param self {Object ? null} The object that the "this" of the function will refer to.
     * @param varargs {arguments ? null} The arguments to pass to the function.
     * @return {Integer} The JavaScript Timeout ID (useful for clearing delays).
     */
    delay : function(func, delay, self, varargs){

      return this.create(func, {
        delay : delay,
        self : self,
        args : arguments.length > 3 ? qx.lang.Array.fromArguments(arguments, 3) : null
      })();
    },
    /**
     * Executes a function in the specified intervals of time
     *
     * *Syntax*
     *
     * <pre class='javascript'>var intervalID = qx.lang.Function.periodical(myFunction, [period, [self, [varargs...]]]);</pre>
     *
     * *Example*
     *
     * <pre class='javascript'>
     * var Site = { counter: 0 };
     * var addCount = function(){ this.counter++; };
     * qx.lang.Function.periodical(addCount, 1000, Site); // will add the number of seconds at the Site
     * </pre>
     *
     * @param func {Function} Original function to wrap
     * @param interval {Integer} The duration of the intervals between executions.
     * @param self {Object ? null} The object that the "this" of the function will refer to.
     * @param varargs {arguments ? null} The arguments to pass to the function.
     * @return {Integer} The Interval ID (useful for clearing a periodical).
     */
    periodical : function(func, interval, self, varargs){

      return this.create(func, {
        periodical : interval,
        self : self,
        args : arguments.length > 3 ? qx.lang.Array.fromArguments(arguments, 3) : null
      })();
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * The GlobalError class stores a reference to a global error handler function.
 *
 *  This function is called for each uncatched JavaScript exception. To enable
 *  global error handling the setting <code>qx.globalErrorHandling</code> must
 *  be enabled and an error handler must be registered.
 *  Further each JavaScript "entry point" must be wrapped with a call to
 *  {@link qx.event.GlobalError#observeMethod}.
 *
 * @ignore(qx.core, qx.core.Environment)
 */
qx.Bootstrap.define("qx.event.GlobalError", {
  statics : {
    __bG : null,
    __bH : null,
    __bI : null,
    /**
     * Little helper to check if the global error handling is enabled.
     * @return {Boolean} <code>true</code>, if it is enabled.
     */
    __bJ : function(){

      if(qx.core && qx.core.Environment){

        return qx.core.Environment.get("qx.globalErrorHandling");
      } else {

        return !!qx.Bootstrap.getEnvironmentSetting("qx.globalErrorHandling");
      };
    },
    /**
     * Set the global fallback error handler
     *
     * @param callback {Function} The error handler. The first argument is the
     *    exception, which caused the error
     * @param context {Object} The "this" context of the callback function
     */
    setErrorHandler : function(callback, context){

      this.__bG = callback || null;
      this.__bI = context || window;
      if(this.__bJ()){

        // wrap the original onerror
        if(callback && window.onerror){

          var wrappedHandler = qx.Bootstrap.bind(this.__bK, this);
          if(this.__bH == null){

            this.__bH = window.onerror;
          };
          var self = this;
          window.onerror = function(msg, uri, lineNumber){

            self.__bH(msg, uri, lineNumber);
            wrappedHandler(msg, uri, lineNumber);
          };
        };
        if(callback && !window.onerror){

          window.onerror = qx.Bootstrap.bind(this.__bK, this);
        };
        // reset
        if(this.__bG == null){

          if(this.__bH != null){

            window.onerror = this.__bH;
            this.__bH = null;
          } else {

            window.onerror = null;
          };
        };
      };
    },
    /**
     * Catches all errors of the <code>window.onerror</code> handler
     * and passes an {@link qx.core.WindowError} object to the error
     * handling.
     *
     * @param msg {String} browser error message
     * @param uri {String} uri to errornous script
     * @param lineNumber {Integer} line number of error
     */
    __bK : function(msg, uri, lineNumber){

      if(this.__bG){

        this.handleError(new qx.core.WindowError(msg, uri, lineNumber));
      };
    },
    /**
     * Wraps a method with error handling code. Only methods, which are called
     * directly by the browser (e.g. event handler) should be wrapped.
     *
     * @param method {Function} method to wrap
     * @return {Function} The function wrapped with error handling code
     */
    observeMethod : function(method){

      if(this.__bJ()){

        var self = this;
        return function(){

          if(!self.__bG){

            return method.apply(this, arguments);
          };
          try{

            return method.apply(this, arguments);
          } catch(ex) {

            self.handleError(new qx.core.GlobalError(ex, arguments));
          };
        };
      } else {

        return method;
      };
    },
    /**
     * Delegates every given exception to the registered error handler
     *
     * @param ex {qx.core.WindowError|Error} Exception to delegate
     */
    handleError : function(ex){

      if(this.__bG){

        this.__bG.call(this.__bI, ex);
      };
    }
  },
  defer : function(statics){

    // only use the environment class if already loaded
    if(qx.core && qx.core.Environment){

      qx.core.Environment.add("qx.globalErrorHandling", true);
    } else {

      qx.Bootstrap.setEnvironmentSetting("qx.globalErrorHandling", true);
    };
    statics.setErrorHandler(null, null);
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */
/**
 * This exception is thrown by the {@link qx.event.GlobalError} handler if a
 * <code>window.onerror</code> event occurs in the browser.
 */
qx.Bootstrap.define("qx.core.WindowError", {
  extend : Error,
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  /**
   * @param failMessage {String} The error message
   * @param uri {String} URI where error was raised
   * @param lineNumber {Integer} The line number where the error was raised
   */
  construct : function(failMessage, uri, lineNumber){

    var inst = Error.call(this, failMessage);
    // map stack trace properties since they're not added by Error's constructor
    if(inst.stack){

      this.stack = inst.stack;
    };
    if(inst.stacktrace){

      this.stacktrace = inst.stacktrace;
    };
    this.__bL = failMessage;
    this.__bM = uri || "";
    this.__bN = lineNumber === undefined ? -1 : lineNumber;
  },
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members : {
    __bL : null,
    __bM : null,
    __bN : null,
    /**
     * Returns the error message.
     *
     * @return {String} error message
     */
    toString : function(){

      return this.__bL;
    },
    /**
     * Get the URI where error was raised
     *
     * @return {String} URI where error was raised
     */
    getUri : function(){

      return this.__bM;
    },
    /**
     * Get the line number where the error was raised
     *
     * @return {Integer} The line number where the error was raised
     */
    getLineNumber : function(){

      return this.__bN;
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Michael Haitz (mhaitz)

************************************************************************ */
/**
 * This exception is thrown by the {@link qx.event.GlobalError} handler if a
 * observed method throws an exception.
 */
qx.Bootstrap.define("qx.core.GlobalError", {
  extend : Error,
  /**
   * @param exc {Error} source exception
   * @param args {Array} arguments
   */
  construct : function(exc, args){

    // Do not use the Environment class to keep the minimal
    // package size small [BUG #5068]
    if(qx.Bootstrap.DEBUG){

      qx.core.Assert.assertNotUndefined(exc);
    };
    this.__bL = "GlobalError: " + (exc && exc.message ? exc.message : exc);
    var inst = Error.call(this, this.__bL);
    // map stack trace properties since they're not added by Error's constructor
    if(inst.stack){

      this.stack = inst.stack;
    };
    if(inst.stacktrace){

      this.stacktrace = inst.stacktrace;
    };
    this.__bO = args;
    this.__bP = exc;
  },
  members : {
    __bP : null,
    __bO : null,
    __bL : null,
    /**
     * Returns the error message.
     *
     * @return {String} error message
     */
    toString : function(){

      return this.__bL;
    },
    /**
     * Returns the arguments which are
     *
     * @return {Object} arguments
     */
    getArguments : function(){

      return this.__bO;
    },
    /**
     * Get the source exception
     *
     * @return {Error} source exception
     */
    getSourceException : function(){

      return this.__bP;
    }
  },
  destruct : function(){

    this.__bP = null;
    this.__bO = null;
    this.__bL = null;
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */
/**
 * Registration for all instances of qooxdoo classes. Mainly
 * used to manage them for the final shutdown sequence and to
 * use weak references when connecting widgets to DOM nodes etc.
 *
 * @ignore(qx.dev, qx.dev.Debug.*)
 */
qx.Bootstrap.define("qx.core.ObjectRegistry", {
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  statics : {
    /** @type {Boolean} Whether the application is in the shutdown phase */
    inShutDown : false,
    /** @type {Map} Internal data structure to store objects */
    __k : {
    },
    /** @type {Integer} Next new hash code. */
    __bQ : 0,
    /** @type {Array} List of all free hash codes */
    __bR : [],
    /** @type {String} Post id for hash code creation. */
    __bS : "",
    /** @type {Map} Object hashes to stack traces (for dispose profiling only) */
    __bT : {
    },
    /**
     * Registers an object into the database. This adds a hashcode
     * to the object (if not already done before) and stores it under
     * this hashcode. You can access this object later using the hashcode
     * by calling {@link #fromHashCode}.
     *
     * All registered objects are automatically disposed on application
     * shutdown. Each registered object must at least have a method
     * called <code>dispose</code>.
     *
     * @param obj {Object} Any object with a dispose() method
     */
    register : function(obj){

      var registry = this.__k;
      if(!registry){

        return;
      };
      var hash = obj.$$hash;
      if(hash == null){

        // Create new hash code
        var cache = this.__bR;
        if(cache.length > 0 && !qx.core.Environment.get("qx.debug.dispose")){

          hash = cache.pop();
        } else {

          hash = (this.__bQ++) + this.__bS;
        };
        // Store hash code
        obj.$$hash = hash;
        if(qx.core.Environment.get("qx.debug.dispose")){

          if(qx.dev && qx.dev.Debug && qx.dev.Debug.disposeProfilingActive){

            this.__bT[hash] = qx.dev.StackTrace.getStackTrace();
          };
        };
      };
      if(qx.core.Environment.get("qx.debug")){

        if(!obj.dispose){

          throw new Error("Invalid object: " + obj);
        };
      };
      registry[hash] = obj;
    },
    /**
     * Removes the given object from the database.
     *
     * @param obj {Object} Any previously registered object
     */
    unregister : function(obj){

      var hash = obj.$$hash;
      if(hash == null){

        return;
      };
      var registry = this.__k;
      if(registry && registry[hash]){

        delete registry[hash];
        this.__bR.push(hash);
      };
      // Delete the hash code
      try{

        delete obj.$$hash;
      } catch(ex) {

        // IE has trouble directly removing the hash
        // but it's ok with using removeAttribute
        if(obj.removeAttribute){

          obj.removeAttribute("$$hash");
        };
      };
    },
    /**
     * Returns an unique identifier for the given object. If such an identifier
     * does not yet exist, create it.
     *
     * @param obj {Object} the object to get the hashcode for
     * @return {String} unique identifier for the given object
     */
    toHashCode : function(obj){

      if(qx.core.Environment.get("qx.debug")){

        if(obj == null){

          throw new Error("Invalid object: " + obj);
        };
      };
      var hash = obj.$$hash;
      if(hash != null){

        return hash;
      };
      // Create new hash code
      var cache = this.__bR;
      if(cache.length > 0){

        hash = cache.pop();
      } else {

        hash = (this.__bQ++) + this.__bS;
      };
      // Store
      return obj.$$hash = hash;
    },
    /**
     * Clears the unique identifier on the given object.
     *
     * @param obj {Object} the object to clear the hashcode for
     */
    clearHashCode : function(obj){

      if(qx.core.Environment.get("qx.debug")){

        if(obj == null){

          throw new Error("Invalid object: " + obj);
        };
      };
      var hash = obj.$$hash;
      if(hash != null){

        this.__bR.push(hash);
        // Delete the hash code
        try{

          delete obj.$$hash;
        } catch(ex) {

          // IE has trouble directly removing the hash
          // but it's ok with using removeAttribute
          if(obj.removeAttribute){

            obj.removeAttribute("$$hash");
          };
        };
      };
    },
    /**
     * Get an object instance by its hash code as returned by {@link #toHashCode}.
     * If the object is already disposed or the hashCode is invalid,
     * <code>null</code> is returned.
     *
     * @param hash {String} The object's hash code.
     * @return {qx.core.Object} The corresponding object or <code>null</code>.
     */
    fromHashCode : function(hash){

      return this.__k[hash] || null;
    },
    /**
     * Disposing all registered object and cleaning up registry. This is
     * automatically executed at application shutdown.
     *
     */
    shutdown : function(){

      this.inShutDown = true;
      var registry = this.__k;
      var hashes = [];
      for(var hash in registry){

        hashes.push(hash);
      };
      // sort the objects! Remove the objecs created at startup
      // as late as possible
      hashes.sort(function(a, b){

        return parseInt(b, 10) - parseInt(a, 10);
      });
      var obj,i = 0,l = hashes.length;
      while(true){

        try{

          for(;i < l;i++){

            hash = hashes[i];
            obj = registry[hash];
            if(obj && obj.dispose){

              obj.dispose();
            };
          };
        } catch(ex) {

          qx.Bootstrap.error(this, "Could not dispose object " + obj.toString() + ": " + ex, ex);
          if(i !== l){

            i++;
            continue;
          };
        };
        break;
      };
      qx.Bootstrap.debug(this, "Disposed " + l + " objects");
      delete this.__k;
    },
    /**
     * Returns the object registry.
     *
     * @return {Object} The registry
     */
    getRegistry : function(){

      return this.__k;
    },
    /**
     * Returns the next hash code that will be used
     *
     * @return {Integer} The next hash code
     * @internal
     */
    getNextHash : function(){

      return this.__bQ;
    },
    /**
     * Returns the postfix that identifies the current iframe
     *
     * @return {Integer} The next hash code
     * @internal
     */
    getPostId : function(){

      return this.__bS;
    },
    /**
     * Returns the map of stack traces recorded when objects are registered
     * (for dispose profiling)
     * @return {Map} Map: object hash codes to stack traces
     * @internal
     */
    getStackTraces : function(){

      return this.__bT;
    }
  },
  defer : function(statics){

    if(window && window.top){

      var frames = window.top.frames;
      for(var i = 0;i < frames.length;i++){

        if(frames[i] === window){

          statics.__bS = "-" + (i + 1);
          return;
        };
      };
    };
    statics.__bS = "-0";
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Richard Sternagel (rsternagel)

   ======================================================================

   This class contains code from:

   * JSON 3 (v3.2.5)

     Code:
       https://github.com/bestiejs/json3

     Copyright:
       (c) 2012-2013, Kit Cambridge

     License:
       MIT: https://raw.github.com/bestiejs/json3/gh-pages/LICENSE

   ----------------------------------------------------------------------

    Copyright (c) 2012-2013 Kit Cambridge.
    http://kitcambridge.be/

    Permission is hereby granted, free of charge, to any person obtaining a copy of
    this software and associated documentation files (the "Software"), to deal in
    the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
    of the Software, and to permit persons to whom the Software is furnished to do
    so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

************************************************************************ */
/**
 * Exposes (potentially polyfilled or patched) window.JSON to qooxdoo
 * (enabled by <a href="https://github.com/bestiejs/json3">JSON 3</a>).
 */
qx.Bootstrap.define("qx.lang.Json", {
  statics : {
    /**
     * This method produces a JSON text from a JavaScript value.
     *
     * When an object value is found, if the object contains a toJSON
     * method, its toJSON method will be called and the result will be
     * stringified. A toJSON method does not serialize: it returns the
     * value represented by the name/value pair that should be serialized,
     * or undefined if nothing should be serialized. The toJSON method
     * will be passed the key associated with the value, and this will be
     * bound to the object holding the key.
     *
     * For example, this would serialize Dates as ISO strings.
     *
     * <pre class="javascript">
     *     Date.prototype.toJSON = function (key) {
     *         function f(n) {
     *             // Format integers to have at least two digits.
     *             return n < 10 ? '0' + n : n;
     *         }
     *
     *         return this.getUTCFullYear()   + '-' +
     *              f(this.getUTCMonth() + 1) + '-' +
     *              f(this.getUTCDate())      + 'T' +
     *              f(this.getUTCHours())     + ':' +
     *              f(this.getUTCMinutes())   + ':' +
     *              f(this.getUTCSeconds())   + 'Z';
     *     };
     * </pre>
     *
     * You can provide an optional replacer method. It will be passed the
     * key and value of each member, with this bound to the containing
     * object. The value that is returned from your method will be
     * serialized. If your method returns undefined, then the member will
     * be excluded from the serialization.
     *
     * If the replacer parameter is an array of strings, then it will be
     * used to select the members to be serialized. It filters the results
     * such that only members with keys listed in the replacer array are
     * stringified.
     *
     * Values that do not have JSON representations, such as undefined or
     * functions, will not be serialized. Such values in objects will be
     * dropped; in arrays they will be replaced with null. You can use
     * a replacer function to replace those with JSON values.
     * JSON.stringify(undefined) returns undefined.
     *
     * The optional space parameter produces a stringification of the
     * value that is filled with line breaks and indentation to make it
     * easier to read.
     *
     * If the space parameter is a non-empty string, then that string will
     * be used for indentation. If the space parameter is a number, then
     * the indentation will be that many spaces.
     *
     * Example:
     *
     * <pre class="javascript">
     * text = JSON.stringify(['e', {pluribus: 'unum'}]);
     * // text is '["e",{"pluribus":"unum"}]'
     *
     *
     * text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
     * // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'
     *
     * text = JSON.stringify([new Date()], function (key, value) {
     *     return this[key] instanceof Date ?
     *         'Date(' + this[key] + ')' : value;
     * });
     * // text is '["Date(---current time---)"]'
     * </pre>
     *
     * @signature function(value, replacer, space)
     *
     * @param value {var} any JavaScript value, usually an object or array.
     *
     * @param replacer {Function?} an optional parameter that determines how
     *    object values are stringified for objects. It can be a function or an
     *    array of strings.
     *
     * @param space {String?} an optional parameter that specifies the
     *    indentation of nested structures. If it is omitted, the text will
     *    be packed without extra whitespace. If it is a number, it will specify
     *    the number of spaces to indent at each level. If it is a string
     *    (such as '\t' or '&nbsp;'), it contains the characters used to indent
     *    at each level.
     *
     * @return {String} The JSON string of the value
     */
    stringify : null,
    // will be set after the polyfill
    /**
     * This method parses a JSON text to produce an object or array.
     * It can throw a SyntaxError exception.
     *
     * The optional reviver parameter is a function that can filter and
     * transform the results. It receives each of the keys and values,
     * and its return value is used instead of the original value.
     * If it returns what it received, then the structure is not modified.
     * If it returns undefined then the member is deleted.
     *
     * Example:
     *
     * <pre class="javascript">
     * // Parse the text. Values that look like ISO date strings will
     * // be converted to Date objects.
     *
     * myData = JSON.parse(text, function (key, value)
     * {
     *   if (typeof value === 'string')
     *   {
     *     var a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
     *     if (a) {
     *       return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]));
     *     }
     *   }
     *   return value;
     * });
     *
     * myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
     *     var d;
     *     if (typeof value === 'string' &&
     *             value.slice(0, 5) === 'Date(' &&
     *             value.slice(-1) === ')') {
     *         d = new Date(value.slice(5, -1));
     *         if (d) {
     *             return d;
     *         }
     *     }
     *     return value;
     * });
     * </pre>
     *
     * @signature function(text, reviver)
     *
     * @param text {String} JSON string to parse
     *
     * @param reviver {Function?} Optional reviver function to filter and
     *    transform the results
     *
     * @return {Object} The parsed JSON object
     */
    parse : null
  }
});
/*! JSON v3.2.5 | http://bestiejs.github.io/json3 | Copyright 2012-2013, Kit Cambridge | http://kit.mit-license.org */
/**
 * @ignore(define.*, exports)
 * @lint ignoreNoLoopBlock()
 */
(function(window){

  // Convenience aliases.
  var getClass = {
  }.toString,isProperty,forEach,undef;
  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = typeof define === "function" && define.amd,JSON3 = typeof exports == "object" && exports;
  if(JSON3 || isLoader){

    if(typeof JSON == "object" && JSON){

      // Delegate to the native `stringify` and `parse` implementations in
      // asynchronous module loaders and CommonJS environments.
      if(JSON3){

        JSON3.stringify = JSON.stringify;
        JSON3.parse = JSON.parse;
      } else {

        JSON3 = JSON;
      };
    } else if(isLoader){

      JSON3 = window.JSON = {
      };
    };
  } else {

    // Export for web browsers and JavaScript engines.
    JSON3 = window.JSON || (window.JSON = {
    });
  };
  // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
  var isExtended = new Date(-3509827334573292);
  try{

    // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
    // results for certain dates in Opera >= 10.53.
    isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 && // Safari < 2.0.2 stores the internal millisecond time value correctly,
    // but clips the values returned by the date methods to the range of
    // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
    isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
  } catch(exception) {
  };
  // Internal: Determines whether the native `JSON.stringify` and `parse`
  // implementations are spec-compliant. Based on work by Ken Snyder.
  function has(name){

    if(name == "bug-string-char-index"){

      // IE <= 7 doesn't support accessing string characters using square
      // bracket notation. IE 8 only supports this for primitives.
      return "a"[0] != "a";
    };
    var value,serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}',isAll = name == "json";
    if(isAll || name == "json-stringify" || name == "json-parse"){

      // Test `JSON.stringify`.
      if(name == "json-stringify" || isAll){

        var stringify = JSON3.stringify,stringifySupported = typeof stringify == "function" && isExtended;
        if(stringifySupported){

          // A test function object with a custom `toJSON` method.
          (value = function(){

            return 1;
          }).toJSON = value;
          try{

            stringifySupported = // Firefox 3.1b1 and b2 serialize string, number, and boolean
            // primitives as object literals.
            stringify(0) === "0" && // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
            // literals.
            stringify(new Number()) === "0" && stringify(new String()) == '""' && // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
            // does not define a canonical JSON representation (this applies to
            // objects with `toJSON` properties as well, *unless* they are nested
            // within an object or array).
            stringify(getClass) === undef && // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
            // FF 3.1b3 pass this test.
            stringify(undef) === undef && // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
            // respectively, if the value is omitted entirely.
            stringify() === undef && // FF 3.1b1, 2 throw an error if the given value is not a number,
            // string, array, object, Boolean, or `null` literal. This applies to
            // objects with custom `toJSON` methods as well, unless they are nested
            // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
            // methods entirely.
            stringify(value) === "1" && stringify([value]) == "[1]" && // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
            // `"[null]"`.
            stringify([undef]) == "[null]" && // YUI 3.0.0b1 fails to serialize `null` literals.
            stringify(null) == "null" && // FF 3.1b1, 2 halts serialization if an array contains a function:
            // `[1, true, getClass, 1]` serializes as "[1,true,],". These versions
            // of Firefox also allow trailing commas in JSON objects and arrays.
            // FF 3.1b3 elides non-JSON values from objects and arrays, unless they
            // define custom `toJSON` methods.
            stringify([undef, getClass, null]) == "[null,null,null]" && // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
            // where character escape codes are expected (e.g., `\b` => `\u0008`).
            stringify({
              "a" : [value, true, false, null, "\x00\b\n\f\r\t"]
            }) == serialized && // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
            stringify(null, value) === "1" && stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" && // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
            // serialize extended years.
            stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' && // The milliseconds are optional in ES 5, but required in 5.1.
            stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' && // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
            // four-digit years instead of six-digit years. Credits: @Yaffle.
            stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' && // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
            // values less than 1000. Credits: @Yaffle.
            stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
          } catch(exception) {

            stringifySupported = false;
          };
        };
        if(!isAll){

          return stringifySupported;
        };
      };
      // Test `JSON.parse`.
      if(name == "json-parse" || isAll){

        var parse = JSON3.parse;
        if(typeof parse == "function"){

          try{

            // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
            // Conforming implementations should also coerce the initial argument to
            // a string prior to parsing.
            if(parse("0") === 0 && !parse(false)){

              // Simple parsing test.
              value = parse(serialized);
              var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
              if(parseSupported){

                try{

                  // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                  parseSupported = !parse('"\t"');
                } catch(exception) {
                };
                if(parseSupported){

                  try{

                    // FF 4.0 and 4.0.1 allow leading `+` signs, and leading and
                    // trailing decimal points. FF 4.0, 4.0.1, and IE 9-10 also
                    // allow certain octal literals.
                    parseSupported = parse("01") !== 1;
                  } catch(exception) {
                  };
                };
              };
            };
          } catch(exception) {

            parseSupported = false;
          };
        };
        if(!isAll){

          return parseSupported;
        };
      };
      return stringifySupported && parseSupported;
    };
  };
  if(!has("json")){

    // Common `[[Class]]` name aliases.
    var functionClass = "[object Function]";
    var dateClass = "[object Date]";
    var numberClass = "[object Number]";
    var stringClass = "[object String]";
    var arrayClass = "[object Array]";
    var booleanClass = "[object Boolean]";
    // Detect incomplete support for accessing string characters by index.
    var charIndexBuggy = has("bug-string-char-index");
    // Define additional utility methods if the `Date` methods are buggy.
    if(!isExtended){

      var floor = Math.floor;
      // A mapping between the months of the year and the number of days between
      // January 1st and the first of the respective month.
      var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
      // Internal: Calculates the number of days between the Unix epoch and the
      // first day of the given month.
      var getDay = function(year, month){

        return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
      };
    };
    // Internal: Determines if a property is a direct property of the given
    // object. Delegates to the native `Object#hasOwnProperty` method.
    if(!(isProperty = {
    }.hasOwnProperty)){

      isProperty = function(property){

        var members = {
        },constructor;
        if((members.__bU = null, members.__bU = {
          // The *proto* property cannot be set multiple times in recent
          // versions of Firefox and SeaMonkey.
          "toString" : 1
        }, members).toString != getClass){

          // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
          // supports the mutable *proto* property.
          isProperty = function(property){

            // Capture and break the object's prototype chain (see section 8.6.2
            // of the ES 5.1 spec). The parenthesized expression prevents an
            // unsafe transformation by the Closure Compiler.
            var original = this.__bU,result = property in (this.__bU = null, this);
            // Restore the original prototype chain.
            this.__bU = original;
            return result;
          };
        } else {

          // Capture a reference to the top-level `Object` constructor.
          constructor = members.constructor;
          // Use the `constructor` property to simulate `Object#hasOwnProperty` in
          // other environments.
          isProperty = function(property){

            var parent = (this.constructor || constructor).prototype;
            return property in this && !(property in parent && this[property] === parent[property]);
          };
        };
        members = null;
        return isProperty.call(this, property);
      };
    };
    // Internal: A set of primitive types used by `isHostType`.
    var PrimitiveTypes = {
      'boolean' : 1,
      'number' : 1,
      'string' : 1,
      'undefined' : 1
    };
    // Internal: Determines if the given object `property` value is a
    // non-primitive.
    var isHostType = function(object, property){

      var type = typeof object[property];
      return type == 'object' ? !!object[property] : !PrimitiveTypes[type];
    };
    // Internal: Normalizes the `for...in` iteration algorithm across
    // environments. Each enumerated key is yielded to a `callback` function.
    forEach = function(object, callback){

      var size = 0,Properties,members,property,forEach;
      // Tests for bugs in the current environment's `for...in` algorithm. The
      // `valueOf` property inherits the non-enumerable flag from
      // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
      (Properties = function(){

        this.valueOf = 0;
      }).prototype.valueOf = 0;
      // Iterate over a new instance of the `Properties` class.
      members = new Properties();
      for(property in members){

        // Ignore all properties inherited from `Object.prototype`.
        if(isProperty.call(members, property)){

          size++;
        };
      };
      Properties = members = null;
      // Normalize the iteration algorithm.
      if(!size){

        // A list of non-enumerable properties inherited from `Object.prototype`.
        members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
        // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
        // properties.
        forEach = function(object, callback){

          var isFunction = getClass.call(object) == functionClass,property,length;
          var hasProperty = !isFunction && typeof object.constructor != 'function' && isHostType(object, 'hasOwnProperty') ? object.hasOwnProperty : isProperty;
          for(property in object){

            // Gecko <= 1.0 enumerates the `prototype` property of functions under
            // certain conditions; IE does not.
            if(!(isFunction && property == "prototype") && hasProperty.call(object, property)){

              callback(property);
            };
          };
          // Manually invoke the callback for each non-enumerable property.
          for(length = members.length;property = members[--length];hasProperty.call(object, property) && callback(property));
        };
      } else if(size == 2){

        // Safari <= 2.0.4 enumerates shadowed properties twice.
        forEach = function(object, callback){

          // Create a set of iterated properties.
          var members = {
          },isFunction = getClass.call(object) == functionClass,property;
          for(property in object){

            // Store each property name to prevent double enumeration. The
            // `prototype` property of functions is not enumerated due to cross-
            // environment inconsistencies.
            if(!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)){

              callback(property);
            };
          };
        };
      } else {

        // No bugs detected; use the standard `for...in` algorithm.
        forEach = function(object, callback){

          var isFunction = getClass.call(object) == functionClass,property,isConstructor;
          for(property in object){

            if(!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")){

              callback(property);
            };
          };
          // Manually invoke the callback for the `constructor` property due to
          // cross-environment inconsistencies.
          if(isConstructor || isProperty.call(object, (property = "constructor"))){

            callback(property);
          };
        };
      };
      return forEach(object, callback);
    };
    // Public: Serializes a JavaScript `value` as a JSON string. The optional
    // `filter` argument may specify either a function that alters how object and
    // array members are serialized, or an array of strings and numbers that
    // indicates which properties should be serialized. The optional `width`
    // argument may be either a string or number that specifies the indentation
    // level of the output.
    if(!has("json-stringify")){

      // Internal: A map of control characters and their escaped equivalents.
      var Escapes = {
        '92' : "\\\\",
        '34' : '\\"',
        '8' : "\\b",
        '12' : "\\f",
        '10' : "\\n",
        '13' : "\\r",
        '9' : "\\t"
      };
      // Internal: Converts `value` into a zero-padded string such that its
      // length is at least equal to `width`. The `width` must be <= 6.
      var leadingZeroes = "000000";
      var toPaddedString = function(width, value){

        // The `|| 0` expression is necessary to work around a bug in
        // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
        return (leadingZeroes + (value || 0)).slice(-width);
      };
      // Internal: Double-quotes a string `value`, replacing all ASCII control
      // characters (characters with code unit values between 0 and 31) with
      // their escaped equivalents. This is an implementation of the
      // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
      var unicodePrefix = "\\u00";
      var quote = function(value){

        var result = '"',index = 0,length = value.length,isLarge = length > 10 && charIndexBuggy,symbols;
        if(isLarge){

          symbols = value.split("");
        };
        for(;index < length;index++){

          var charCode = value.charCodeAt(index);
          // If the character is a control character, append its Unicode or
          // shorthand escape sequence; otherwise, append the character as-is.
          switch(charCode){case 8:case 9:case 10:case 12:case 13:case 34:case 92:
          result += Escapes[charCode];
          break;default:
          if(charCode < 32){

            result += unicodePrefix + toPaddedString(2, charCode.toString(16));
            break;
          };
          result += isLarge ? symbols[index] : charIndexBuggy ? value.charAt(index) : value[index];};
        };
        return result + '"';
      };
      // Internal: Recursively serializes an object. Implements the
      // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
      var serialize = function(property, object, callback, properties, whitespace, indentation, stack){

        var value = object[property],className,year,month,date,time,hours,minutes,seconds,milliseconds,results,element,index,length,prefix,hasMembers,result;
        try{

          // Necessary for host object support.
          value = object[property];
        } catch(exception) {
        };
        if(typeof value == "object" && value){

          className = getClass.call(value);
          if(className == dateClass && !isProperty.call(value, "toJSON")){

            if(value > -1 / 0 && value < 1 / 0){

              // Dates are serialized according to the `Date#toJSON` method
              // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
              // for the ISO 8601 date time string format.
              if(getDay){

                // Manually compute the year, month, date, hours, minutes,
                // seconds, and milliseconds if the `getUTC*` methods are
                // buggy. Adapted from @Yaffle's `date-shim` project.
                date = floor(value / 864e5);
                for(year = floor(date / 365.2425) + 1970 - 1;getDay(year + 1, 0) <= date;year++);
                for(month = floor((date - getDay(year, 0)) / 30.42);getDay(year, month + 1) <= date;month++);
                date = 1 + date - getDay(year, month);
                // The `time` value specifies the time within the day (see ES
                // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                // to compute `A modulo B`, as the `%` operator does not
                // correspond to the `modulo` operation for negative numbers.
                time = (value % 864e5 + 864e5) % 864e5;
                // The hours, minutes, seconds, and milliseconds are obtained by
                // decomposing the time within the day. See section 15.9.1.10.
                hours = floor(time / 36e5) % 24;
                minutes = floor(time / 6e4) % 60;
                seconds = floor(time / 1e3) % 60;
                milliseconds = time % 1e3;
              } else {

                year = value.getUTCFullYear();
                month = value.getUTCMonth();
                date = value.getUTCDate();
                hours = value.getUTCHours();
                minutes = value.getUTCMinutes();
                seconds = value.getUTCSeconds();
                milliseconds = value.getUTCMilliseconds();
              };
              // Serialize extended years correctly.
              value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) + "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) + // Months, dates, hours, minutes, and seconds should have two
              // digits; milliseconds should have three.
              "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) + // Milliseconds are optional in ES 5.0, but required in 5.1.
              "." + toPaddedString(3, milliseconds) + "Z";
            } else {

              value = null;
            };
          } else if(typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))){

            // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
            // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
            // ignores all `toJSON` methods on these objects unless they are
            // defined directly on an instance.
            value = value.toJSON(property);
          };
        };
        if(callback){

          // If a replacement function was provided, call it to obtain the value
          // for serialization.
          value = callback.call(object, property, value);
        };
        if(value === null){

          return "null";
        };
        className = getClass.call(value);
        if(className == booleanClass){

          // Booleans are represented literally.
          return "" + value;
        } else if(className == numberClass){

          // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
          // `"null"`.
          return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
        } else if(className == stringClass){

          // Strings are double-quoted and escaped.
          return quote("" + value);
        };;
        // Recursively serialize objects and arrays.
        if(typeof value == "object"){

          // Check for cyclic structures. This is a linear search; performance
          // is inversely proportional to the number of unique nested objects.
          for(length = stack.length;length--;){

            if(stack[length] === value){

              // Cyclic structures cannot be serialized by `JSON.stringify`.
              throw TypeError();
            };
          };
          // Add the object to the stack of traversed objects.
          stack.push(value);
          results = [];
          // Save the current indentation level and indent one additional level.
          prefix = indentation;
          indentation += whitespace;
          if(className == arrayClass){

            // Recursively serialize array elements.
            for(index = 0,length = value.length;index < length;hasMembers || (hasMembers = true),index++){

              element = serialize(index, value, callback, properties, whitespace, indentation, stack);
              results.push(element === undef ? "null" : element);
            };
            result = hasMembers ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
          } else {

            // Recursively serialize object members. Members are selected from
            // either a user-specified list of property names, or the object
            // itself.
            forEach(properties || value, function(property){

              var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
              if(element !== undef){

                // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                // is not the empty string, let `member` {quote(property) + ":"}
                // be the concatenation of `member` and the `space` character."
                // The "`space` character" refers to the literal space
                // character, not the `space` {width} argument provided to
                // `JSON.stringify`.
                results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
              };
              hasMembers || (hasMembers = true);
            });
            result = hasMembers ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
          };
          // Remove the object from the traversed object stack.
          stack.pop();
          return result;
        };
      };
      // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
      JSON3.stringify = function(source, filter, width){

        var whitespace,callback,properties;
        if(typeof filter == "function" || typeof filter == "object" && filter){

          if(getClass.call(filter) == functionClass){

            callback = filter;
          } else if(getClass.call(filter) == arrayClass){

            // Convert the property names array into a makeshift set.
            properties = {
            };
            for(var index = 0,length = filter.length,value;index < length;value = filter[index++],((getClass.call(value) == stringClass || getClass.call(value) == numberClass) && (properties[value] = 1)));
          };
        };
        if(width){

          if(getClass.call(width) == numberClass){

            // Convert the `width` to an integer and create a string containing
            // `width` number of space characters.
            if((width -= width % 1) > 0){

              for(whitespace = "",width > 10 && (width = 10);whitespace.length < width;whitespace += " ");
            };
          } else if(getClass.call(width) == stringClass){

            whitespace = width.length <= 10 ? width : width.slice(0, 10);
          };
        };
        // Opera <= 7.54u2 discards the values associated with empty string keys
        // (`""`) only if they are used directly within an object member list
        // (e.g., `!("" in { "": 1})`).
        return serialize("", (value = {
        }, value[""] = source, value), callback, properties, whitespace, "", []);
      };
    };
    // Public: Parses a JSON source string.
    if(!has("json-parse")){

      var fromCharCode = String.fromCharCode;
      // Internal: A map of escaped control characters and their unescaped
      // equivalents.
      var Unescapes = {
        '92' : "\\",
        '34' : '"',
        '47' : "/",
        '98' : "\b",
        '116' : "\t",
        '110' : "\n",
        '102' : "\f",
        '114' : "\r"
      };
      // Internal: Stores the parser state.
      var Index,Source;
      // Internal: Resets the parser state and throws a `SyntaxError`.
      var abort = function(){

        Index = Source = null;
        throw SyntaxError();
      };
      // Internal: Returns the next token, or `"$"` if the parser has reached
      // the end of the source string. A token may be a string, number, `null`
      // literal, or Boolean literal.
      var lex = function(){

        var source = Source,length = source.length,value,begin,position,isSigned,charCode;
        while(Index < length){

          charCode = source.charCodeAt(Index);
          switch(charCode){case 9:case 10:case 13:case 32:
          // Skip whitespace tokens, including tabs, carriage returns, line
          // feeds, and space characters.
          Index++;
          break;case 123:case 125:case 91:case 93:case 58:case 44:
          // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
          // the current position.
          value = charIndexBuggy ? source.charAt(Index) : source[Index];
          Index++;
          return value;case 34:
          // `"` delimits a JSON string; advance to the next character and
          // begin parsing the string. String tokens are prefixed with the
          // sentinel `@` character to distinguish them from punctuators and
          // end-of-string tokens.
          for(value = "@",Index++;Index < length;){

            charCode = source.charCodeAt(Index);
            if(charCode < 32){

              // Unescaped ASCII control characters (those with a code unit
              // less than the space character) are not permitted.
              abort();
            } else if(charCode == 92){

              // A reverse solidus (`\`) marks the beginning of an escaped
              // control character (including `"`, `\`, and `/`) or Unicode
              // escape sequence.
              charCode = source.charCodeAt(++Index);
              switch(charCode){case 92:case 34:case 47:case 98:case 116:case 110:case 102:case 114:
              // Revive escaped control characters.
              value += Unescapes[charCode];
              Index++;
              break;case 117:
              // `\u` marks the beginning of a Unicode escape sequence.
              // Advance to the first character and validate the
              // four-digit code point.
              begin = ++Index;
              for(position = Index + 4;Index < position;Index++){

                charCode = source.charCodeAt(Index);
                // A valid sequence comprises four hexdigits (case-
                // insensitive) that form a single hexadecimal value.
                if(!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)){

                  // Invalid Unicode escape sequence.
                  abort();
                };
              };
              // Revive the escaped character.
              value += fromCharCode("0x" + source.slice(begin, Index));
              break;default:
              // Invalid escape sequence.
              abort();};
            } else {

              if(charCode == 34){

                // An unescaped double-quote character marks the end of the
                // string.
                break;
              };
              charCode = source.charCodeAt(Index);
              begin = Index;
              // Optimize for the common case where a string is valid.
              while(charCode >= 32 && charCode != 92 && charCode != 34){

                charCode = source.charCodeAt(++Index);
              };
              // Append the string as-is.
              value += source.slice(begin, Index);
            };
          };
          if(source.charCodeAt(Index) == 34){

            // Advance to the next character and return the revived string.
            Index++;
            return value;
          };
          // Unterminated string.
          abort();default:
          // Parse numbers and literals.
          begin = Index;
          // Advance past the negative sign, if one is specified.
          if(charCode == 45){

            isSigned = true;
            charCode = source.charCodeAt(++Index);
          };
          // Parse an integer or floating-point value.
          if(charCode >= 48 && charCode <= 57){

            // Leading zeroes are interpreted as octal literals.
            if(charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)){

              // Illegal octal literal.
              abort();
            };
            isSigned = false;
            // Parse the integer component.
            for(;Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57);Index++);
            // Floats cannot contain a leading decimal point; however, this
            // case is already accounted for by the parser.
            if(source.charCodeAt(Index) == 46){

              position = ++Index;
              // Parse the decimal component.
              for(;position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57);position++);
              if(position == Index){

                // Illegal trailing decimal.
                abort();
              };
              Index = position;
            };
            // Parse exponents. The `e` denoting the exponent is
            // case-insensitive.
            charCode = source.charCodeAt(Index);
            if(charCode == 101 || charCode == 69){

              charCode = source.charCodeAt(++Index);
              // Skip past the sign following the exponent, if one is
              // specified.
              if(charCode == 43 || charCode == 45){

                Index++;
              };
              // Parse the exponential component.
              for(position = Index;position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57);position++);
              if(position == Index){

                // Illegal empty exponent.
                abort();
              };
              Index = position;
            };
            // Coerce the parsed value to a JavaScript number.
            return +source.slice(begin, Index);
          };
          // A negative sign may only precede numbers.
          if(isSigned){

            abort();
          };
          // `true`, `false`, and `null` literals.
          if(source.slice(Index, Index + 4) == "true"){

            Index += 4;
            return true;
          } else if(source.slice(Index, Index + 5) == "false"){

            Index += 5;
            return false;
          } else if(source.slice(Index, Index + 4) == "null"){

            Index += 4;
            return null;
          };;
          // Unrecognized token.
          abort();};
        };
        // Return the sentinel `$` character if the parser has reached the end
        // of the source string.
        return "$";
      };
      // Internal: Parses a JSON `value` token.
      var get = function(value){

        var results,hasMembers;
        if(value == "$"){

          // Unexpected end of input.
          abort();
        };
        if(typeof value == "string"){

          if((charIndexBuggy ? value.charAt(0) : value[0]) == "@"){

            // Remove the sentinel `@` character.
            return value.slice(1);
          };
          // Parse object and array literals.
          if(value == "["){

            // Parses a JSON array, returning a new JavaScript array.
            results = [];
            for(;;hasMembers || (hasMembers = true)){

              value = lex();
              // A closing square bracket marks the end of the array literal.
              if(value == "]"){

                break;
              };
              // If the array literal contains elements, the current token
              // should be a comma separating the previous element from the
              // next.
              if(hasMembers){

                if(value == ","){

                  value = lex();
                  if(value == "]"){

                    // Unexpected trailing `,` in array literal.
                    abort();
                  };
                } else {

                  // A `,` must separate each array element.
                  abort();
                };
              };
              // Elisions and leading commas are not permitted.
              if(value == ","){

                abort();
              };
              results.push(get(value));
            };
            return results;
          } else if(value == "{"){

            // Parses a JSON object, returning a new JavaScript object.
            results = {
            };
            for(;;hasMembers || (hasMembers = true)){

              value = lex();
              // A closing curly brace marks the end of the object literal.
              if(value == "}"){

                break;
              };
              // If the object literal contains members, the current token
              // should be a comma separator.
              if(hasMembers){

                if(value == ","){

                  value = lex();
                  if(value == "}"){

                    // Unexpected trailing `,` in object literal.
                    abort();
                  };
                } else {

                  // A `,` must separate each object member.
                  abort();
                };
              };
              // Leading commas are not permitted, object property names must be
              // double-quoted strings, and a `:` must separate each property
              // name and value.
              if(value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":"){

                abort();
              };
              results[value.slice(1)] = get(lex());
            };
            return results;
          };
          // Unexpected token encountered.
          abort();
        };
        return value;
      };
      // Internal: Updates a traversed object member.
      var update = function(source, property, callback){

        var element = walk(source, property, callback);
        if(element === undef){

          delete source[property];
        } else {

          source[property] = element;
        };
      };
      // Internal: Recursively traverses a parsed JSON object, invoking the
      // `callback` function for each value. This is an implementation of the
      // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
      var walk = function(source, property, callback){

        var value = source[property],length;
        if(typeof value == "object" && value){

          // `forEach` can't be used to traverse an array in Opera <= 8.54
          // because its `Object#hasOwnProperty` implementation returns `false`
          // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
          if(getClass.call(value) == arrayClass){

            for(length = value.length;length--;){

              update(value, length, callback);
            };
          } else {

            forEach(value, function(property){

              update(value, property, callback);
            });
          };
        };
        return callback.call(source, property, value);
      };
      // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
      JSON3.parse = function(source, callback){

        var result,value;
        Index = 0;
        Source = "" + source;
        result = get(lex());
        // If a JSON string contains multiple tokens, it is invalid.
        if(lex() != "$"){

          abort();
        };
        // Reset the parser state.
        Index = Source = null;
        return callback && getClass.call(callback) == functionClass ? walk((value = {
        }, value[""] = result, value), "", callback) : result;
      };
    };
  };
  // Export for asynchronous module loaders.
  if(isLoader){

    define(function(){

      return JSON3;
    });
  };
}(this));
// End of original code.
// Finally expose (polyfilled) window.JSON as qx.lang.Json.JSON
qx.lang.Json.stringify = window.JSON.stringify;
qx.lang.Json.parse = window.JSON.parse;

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

   ======================================================================

   This class contains code based on the following work:

   * Mootools
     http://mootools.net/
     Version 1.1.1

     Copyright:
       (c) 2007 Valerio Proietti

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

   and

   * XRegExp
   http://xregexp.com/
   Version 1.5

   Copyright:
       (c) 2006-2007, Steven Levithan <http://stevenlevithan.com>

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Steven Levithan

************************************************************************ */
/**
 * String helper functions
 *
 * The native JavaScript String is not modified by this class. However,
 * there are modifications to the native String in {@link qx.lang.normalize.String} for
 * browsers that do not support certain features.
 *
 * @require(qx.lang.normalize.String)
 */
qx.Bootstrap.define("qx.lang.String", {
  statics : {
    /**
     * Unicode letters.  they are taken from Steve Levithan's excellent XRegExp library [http://xregexp.com/addons/unicode/unicode-base.js]
     */
    __bV : "0041-005A0061-007A00AA00B500BA00C0-00D600D8-00F600F8-02C102C6-02D102E0-02E402EC02EE0370-037403760377037A-037D03860388-038A038C038E-03A103A3-03F503F7-0481048A-05250531-055605590561-058705D0-05EA05F0-05F20621-064A066E066F0671-06D306D506E506E606EE06EF06FA-06FC06FF07100712-072F074D-07A507B107CA-07EA07F407F507FA0800-0815081A082408280904-0939093D09500958-0961097109720979-097F0985-098C098F09900993-09A809AA-09B009B209B6-09B909BD09CE09DC09DD09DF-09E109F009F10A05-0A0A0A0F0A100A13-0A280A2A-0A300A320A330A350A360A380A390A59-0A5C0A5E0A72-0A740A85-0A8D0A8F-0A910A93-0AA80AAA-0AB00AB20AB30AB5-0AB90ABD0AD00AE00AE10B05-0B0C0B0F0B100B13-0B280B2A-0B300B320B330B35-0B390B3D0B5C0B5D0B5F-0B610B710B830B85-0B8A0B8E-0B900B92-0B950B990B9A0B9C0B9E0B9F0BA30BA40BA8-0BAA0BAE-0BB90BD00C05-0C0C0C0E-0C100C12-0C280C2A-0C330C35-0C390C3D0C580C590C600C610C85-0C8C0C8E-0C900C92-0CA80CAA-0CB30CB5-0CB90CBD0CDE0CE00CE10D05-0D0C0D0E-0D100D12-0D280D2A-0D390D3D0D600D610D7A-0D7F0D85-0D960D9A-0DB10DB3-0DBB0DBD0DC0-0DC60E01-0E300E320E330E40-0E460E810E820E840E870E880E8A0E8D0E94-0E970E99-0E9F0EA1-0EA30EA50EA70EAA0EAB0EAD-0EB00EB20EB30EBD0EC0-0EC40EC60EDC0EDD0F000F40-0F470F49-0F6C0F88-0F8B1000-102A103F1050-1055105A-105D106110651066106E-10701075-1081108E10A0-10C510D0-10FA10FC1100-1248124A-124D1250-12561258125A-125D1260-1288128A-128D1290-12B012B2-12B512B8-12BE12C012C2-12C512C8-12D612D8-13101312-13151318-135A1380-138F13A0-13F41401-166C166F-167F1681-169A16A0-16EA1700-170C170E-17111720-17311740-17511760-176C176E-17701780-17B317D717DC1820-18771880-18A818AA18B0-18F51900-191C1950-196D1970-19741980-19AB19C1-19C71A00-1A161A20-1A541AA71B05-1B331B45-1B4B1B83-1BA01BAE1BAF1C00-1C231C4D-1C4F1C5A-1C7D1CE9-1CEC1CEE-1CF11D00-1DBF1E00-1F151F18-1F1D1F20-1F451F48-1F4D1F50-1F571F591F5B1F5D1F5F-1F7D1F80-1FB41FB6-1FBC1FBE1FC2-1FC41FC6-1FCC1FD0-1FD31FD6-1FDB1FE0-1FEC1FF2-1FF41FF6-1FFC2071207F2090-209421022107210A-211321152119-211D212421262128212A-212D212F-2139213C-213F2145-2149214E218321842C00-2C2E2C30-2C5E2C60-2CE42CEB-2CEE2D00-2D252D30-2D652D6F2D80-2D962DA0-2DA62DA8-2DAE2DB0-2DB62DB8-2DBE2DC0-2DC62DC8-2DCE2DD0-2DD62DD8-2DDE2E2F300530063031-3035303B303C3041-3096309D-309F30A1-30FA30FC-30FF3105-312D3131-318E31A0-31B731F0-31FF3400-4DB54E00-9FCBA000-A48CA4D0-A4FDA500-A60CA610-A61FA62AA62BA640-A65FA662-A66EA67F-A697A6A0-A6E5A717-A71FA722-A788A78BA78CA7FB-A801A803-A805A807-A80AA80C-A822A840-A873A882-A8B3A8F2-A8F7A8FBA90A-A925A930-A946A960-A97CA984-A9B2A9CFAA00-AA28AA40-AA42AA44-AA4BAA60-AA76AA7AAA80-AAAFAAB1AAB5AAB6AAB9-AABDAAC0AAC2AADB-AADDABC0-ABE2AC00-D7A3D7B0-D7C6D7CB-D7FBF900-FA2DFA30-FA6DFA70-FAD9FB00-FB06FB13-FB17FB1DFB1F-FB28FB2A-FB36FB38-FB3CFB3EFB40FB41FB43FB44FB46-FBB1FBD3-FD3DFD50-FD8FFD92-FDC7FDF0-FDFBFE70-FE74FE76-FEFCFF21-FF3AFF41-FF5AFF66-FFBEFFC2-FFC7FFCA-FFCFFFD2-FFD7FFDA-FFDC",
    /**
     * A RegExp that matches the first letter in a word - unicode aware
     */
    __bW : null,
    /**
     * @type {Map} Cache for often used string operations [camelCasing and hyphenation]
     * e.g. marginTop => margin-top
     */
    __bX : {
    },
    /**
     * Converts a hyphenated string (separated by '-') to camel case.
     *
     * Example:
     * <pre class='javascript'>qx.lang.String.camelCase("I-like-cookies"); //returns "ILikeCookies"</pre>
     *
     * @param str {String} hyphenated string
     * @return {String} camelcase string
     */
    camelCase : function(str){

      var result = this.__bX[str];
      if(!result){

        result = str.replace(/\-([a-z])/g, function(match, chr){

          return chr.toUpperCase();
        });
        if(str.indexOf("-") >= 0){

          this.__bX[str] = result;
        };
      };
      return result;
    },
    /**
     * Converts a camelcased string to a hyphenated (separated by '-') string.
     *
     * Example:
     * <pre class='javascript'>qx.lang.String.hyphenate("weLikeCookies"); //returns "we-like-cookies"</pre>
     *
     * @param str {String} camelcased string
     * @return {String} hyphenated string
     */
    hyphenate : function(str){

      var result = this.__bX[str];
      if(!result){

        result = str.replace(/[A-Z]/g, function(match){

          return ('-' + match.charAt(0).toLowerCase());
        });
        if(str.indexOf("-") == -1){

          this.__bX[str] = result;
        };
      };
      return result;
    },
    /**
     * Converts a string to camel case.
     *
     * Example:
     * <pre class='javascript'>qx.lang.String.camelCase("i like cookies"); //returns "I Like Cookies"</pre>
     *
     * @param str {String} any string
     * @return {String} capitalized string
     */
    capitalize : function(str){

      if(this.__bW === null){

        var unicodeEscapePrefix = '\\u';
        this.__bW = new RegExp("(^|[^" + this.__bV.replace(/[0-9A-F]{4}/g, function(match){

          return unicodeEscapePrefix + match;
        }) + "])[" + this.__bV.replace(/[0-9A-F]{4}/g, function(match){

          return unicodeEscapePrefix + match;
        }) + "]", "g");
      };
      return str.replace(this.__bW, function(match){

        return match.toUpperCase();
      });
    },
    /**
     * Removes all extraneous whitespace from a string and trims it
     *
     * Example:
     *
     * <code>
     * qx.lang.String.clean(" i      like     cookies      \n\n");
     * </code>
     *
     * Returns "i like cookies"
     *
     * @param str {String} the string to clean up
     * @return {String} Cleaned up string
     */
    clean : function(str){

      return str.replace(/\s+/g, ' ').trim();
    },
    /**
     * removes white space from the left side of a string
     *
     * @param str {String} the string to trim
     * @return {String} the trimmed string
     */
    trimLeft : function(str){

      return str.replace(/^\s+/, "");
    },
    /**
     * removes white space from the right side of a string
     *
     * @param str {String} the string to trim
     * @return {String} the trimmed string
     */
    trimRight : function(str){

      return str.replace(/\s+$/, "");
    },
    /**
     * Check whether the string starts with the given substring
     *
     * @param fullstr {String} the string to search in
     * @param substr {String} the substring to look for
     * @return {Boolean} whether the string starts with the given substring
     */
    startsWith : function(fullstr, substr){

      return fullstr.indexOf(substr) === 0;
    },
    /**
     * Check whether the string ends with the given substring
     *
     * @param fullstr {String} the string to search in
     * @param substr {String} the substring to look for
     * @return {Boolean} whether the string ends with the given substring
     */
    endsWith : function(fullstr, substr){

      return fullstr.substring(fullstr.length - substr.length, fullstr.length) === substr;
    },
    /**
     * Returns a string, which repeats a string 'length' times
     *
     * @param str {String} string used to repeat
     * @param times {Integer} the number of repetitions
     * @return {String} repeated string
     */
    repeat : function(str, times){

      return str.length > 0 ? new Array(times + 1).join(str) : "";
    },
    /**
     * Pad a string up to a given length. Padding characters are added to the left of the string.
     *
     * @param str {String} the string to pad
     * @param length {Integer} the final length of the string
     * @param ch {String} character used to fill up the string
     * @return {String} padded string
     */
    pad : function(str, length, ch){

      var padLength = length - str.length;
      if(padLength > 0){

        if(typeof ch === "undefined"){

          ch = "0";
        };
        return this.repeat(ch, padLength) + str;
      } else {

        return str;
      };
    },
    /**
     * Convert the first character of the string to upper case.
     *
     * @signature function(str)
     * @param str {String} the string
     * @return {String} the string with an upper case first character
     */
    firstUp : qx.Bootstrap.firstUp,
    /**
     * Convert the first character of the string to lower case.
     *
     * @signature function(str)
     * @param str {String} the string
     * @return {String} the string with a lower case first character
     */
    firstLow : qx.Bootstrap.firstLow,
    /**
     * Check whether the string contains a given substring
     *
     * @param str {String} the string
     * @param substring {String} substring to search for
     * @return {Boolean} whether the string contains the substring
     */
    contains : function(str, substring){

      return str.indexOf(substring) != -1;
    },
    /**
     * Print a list of arguments using a format string
     * In the format string occurrences of %n are replaced by the n'th element of the args list.
     * Example:
     * <pre class='javascript'>qx.lang.String.format("Hello %1, my name is %2", ["Egon", "Franz"]) == "Hello Egon, my name is Franz"</pre>
     *
     * @param pattern {String} format string
     * @param args {Array} array of arguments to insert into the format string
     * @return {String} the formatted string
     */
    format : function(pattern, args){

      var str = pattern;
      var i = args.length;
      while(i--){

        // be sure to always use a string for replacement.
        str = str.replace(new RegExp("%" + (i + 1), "g"), args[i] + "");
      };
      return str;
    },
    /**
     * Escapes all chars that have a special meaning in regular expressions
     *
     * @param str {String} the string where to escape the chars.
     * @return {String} the string with the escaped chars.
     */
    escapeRegexpChars : function(str){

      return str.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
    },
    /**
     * Converts a string to an array of characters.
     * <pre>"hello" => [ "h", "e", "l", "l", "o" ];</pre>
     *
     * @param str {String} the string which should be split
     * @return {Array} the result array of characters
     */
    toArray : function(str){

      return str.split(/\B|\b/g);
    },
    /**
     * Remove HTML/XML tags from a string
     * Example:
     * <pre class='javascript'>qx.lang.String.stripTags("&lt;h1>Hello&lt;/h1>") == "Hello"</pre>
     *
     * @param str {String} string containing tags
     * @return {String} the string with stripped tags
     */
    stripTags : function(str){

      return str.replace(/<\/?[^>]+>/gi, "");
    },
    /**
     * Strips <script> tags including its content from the given string.
     *
     * @param str {String} string containing tags
     * @param exec {Boolean?false} Whether the filtered code should be executed
     * @return {String} The filtered string
     */
    stripScripts : function(str, exec){

      var scripts = "";
      var text = str.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function(){

        scripts += arguments[1] + '\n';
        return "";
      });
      if(exec === true){

        qx.lang.Function.globalEval(scripts);
      };
      return text;
    },
    /**
     * Quotes the given string.
     * @param str {String} String to quote.
     * @return {String} The quoted string.
     */
    quote : function(str){

      return '"' + str.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"") + '"';
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * This interface defines a data structure compatible with the data binding
 * controllers.
 * It defines a minimum of functionality which the controller need to work.
 */
qx.Interface.define("qx.data.IListData", {
  events : {
    /**
     * The change event which will be fired if there is a change in the data
     * structure.The data should contain a map with three key value pairs:
     * <li>start: The start index of the change.</li>
     * <li>end: The end index of the change.</li>
     * <li>type: The type of the change as a String. This can be 'add',
     * 'remove' or 'order'</li>
     * <li>item: The item which has been changed.</li>
     */
    "change" : "qx.event.type.Data",
    /**
     * The changeLength event will be fired every time the length of the
     * data structure changes.
     */
    "changeLength" : "qx.event.type.Event"
  },
  members : {
    /**
     * Returns the item at the given index
     *
     * @param index {Number} The index requested of the data element.
     *
     * @return {var} The element at the given index.
     */
    getItem : function(index){
    },
    /**
     * Sets the given item at the given position in the data structure. A
     * change event has to be fired.
     *
     * @param index {Number} The index of the data element.
     * @param item {var} The new item to set.
     */
    setItem : function(index, item){
    },
    /**
     * Method to remove and add new element to the data. For every remove or
     * add a change event should be fired.
     *
     * @param startIndex {Integer} The index where the splice should start
     * @param amount {Integer} Defines number of element which will be removed
     *   at the given position.
     * @param varargs {var} All following parameters will be added at the given
     *   position to the array.
     * @return {qx.data.Array} An array containing the removed elements.
     */
    splice : function(startIndex, amount, varargs){
    },
    /**
     * Check if the given item is in the current data structure.
     *
     * @param item {var} The item which is possibly in the data structure.
     * @return {Boolean} true, if the array contains the given item.
     */
    contains : function(item){
    },
    /**
     * Returns the current length of the data structure.
     *
     * @return {Number} The current length of the data structure.
     */
    getLength : function(){
    },
    /**
     * Returns the list data as native array.
     *
     * @return {Array} The native array.
     */
    toArray : function(){
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * A validation Error which should be thrown if a validation fails.
 */
qx.Class.define("qx.core.ValidationError", {
  extend : qx.type.BaseError
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Carsten Lergenmueller (carstenl)
     * Fabian Jakobs (fjakobs)

************************************************************************ */
/**
 * An memory container which stores arbitrary data up to a maximum number of
 * entries. When new entries come in an the maximum is reached, the oldest
 * entries are deleted.
 *
 * A mark feature also exists which can be used to remember a point in time.
 * When retrieving entriues, it is possible to get only those entries
 * after the marked time. This is useful if data from the buffer is extracted
 * and processed. Whenever this happens, a mark() call can be used so that the
 * next extraction will only get new data.
 */
qx.Bootstrap.define("qx.util.RingBuffer", {
  extend : Object,
  /**
   * Constructor.
   *
   * @param maxEntries {Integer ? 50} Maximum number of entries in the buffer
   */
  construct : function(maxEntries){

    this.setMaxEntries(maxEntries || 50);
  },
  members : {
    //Next slot in ringbuffer to use
    __bY : 0,
    //Number of elements in ring buffer
    __ca : 0,
    //Was a mark set?
    __cb : false,
    //How many elements were stored since setting of mark?
    __cc : 0,
    //ring buffer
    __cd : null,
    //Maximum number of messages to store. Could be converted to a qx property.
    __ce : null,
    /**
     * Set the maximum number of messages to hold. If null the number of
     * messages is not limited.
     *
     * Warning: Changing this property will clear the events logged so far.
     *
     * @param maxEntries {Integer} the maximum number of messages to hold
     */
    setMaxEntries : function(maxEntries){

      this.__ce = maxEntries;
      this.clear();
    },
    /**
     * Get the maximum number of entries to hold
     *
     * @return {Integer}
     */
    getMaxEntries : function(){

      return this.__ce;
    },
    /**
     * Adds a single entry
     *
     * @param entry {var} The data to store
     */
    addEntry : function(entry){

      this.__cd[this.__bY] = entry;
      this.__bY = this.__cf(this.__bY, 1);
      //Count # of stored entries
      var max = this.getMaxEntries();
      if(this.__ca < max){

        this.__ca++;
      };
      //Count # of stored elements since last mark call
      if(this.__cb && (this.__cc < max)){

        this.__cc++;
      };
    },
    /**
     * Remembers the current position in the ring buffer
     *
     */
    mark : function(){

      this.__cb = true;
      this.__cc = 0;
    },
    /**
     * Removes the current mark position
     */
    clearMark : function(){

      this.__cb = false;
    },
    /**
     * Returns all stored entries. Mark is ignored.
     *
     * @return {Array} array of stored entries
     */
    getAllEntries : function(){

      return this.getEntries(this.getMaxEntries(), false);
    },
    /**
     * Returns entries which have been added previously.
     *
     * @param count {Integer} The number of entries to retrieve. If there are
     *    more entries than the given count, the oldest ones will not be returned.
     *
     * @param startingFromMark {Boolean ? false} If true, only entries since
     *   the last call to mark() will be returned
     * @return {Array} array of stored entries
     */
    getEntries : function(count, startingFromMark){

      //Trim count so it does not exceed ringbuffer size
      if(count > this.__ca){

        count = this.__ca;
      };
      // Trim count so it does not exceed last call to mark (if mark was called
      // and startingFromMark was true)
      if(startingFromMark && this.__cb && (count > this.__cc)){

        count = this.__cc;
      };
      if(count > 0){

        var indexOfYoungestElementInHistory = this.__cf(this.__bY, -1);
        var startIndex = this.__cf(indexOfYoungestElementInHistory, -count + 1);
        var result;
        if(startIndex <= indexOfYoungestElementInHistory){

          //Requested segment not wrapping around ringbuffer boundary, get in one run
          result = this.__cd.slice(startIndex, indexOfYoungestElementInHistory + 1);
        } else {

          //Requested segment wrapping around ringbuffer boundary, get two parts & concat
          result = this.__cd.slice(startIndex, this.__ca).concat(this.__cd.slice(0, indexOfYoungestElementInHistory + 1));
        };
      } else {

        result = [];
      };
      return result;
    },
    /**
     * Clears all entries
     */
    clear : function(){

      this.__cd = new Array(this.getMaxEntries());
      this.__ca = 0;
      this.__cc = 0;
      this.__bY = 0;
    },
    /**
     * Adds a number to an ringbuffer index. Does a modulus calculation,
     * i. e. if the index leaves the ringbuffer space it will wrap around to
     * the other end of the ringbuffer.
     *
     * @param idx {Number} The current index.
     * @param addMe {Number} The number to add.
     * @return {Number} The new index
     */
    __cf : function(idx, addMe){

      var max = this.getMaxEntries();
      var result = (idx + addMe) % max;
      //If negative, wrap up into the ringbuffer space
      if(result < 0){

        result += max;
      };
      return result;
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Carsten Lergenmueller (carstenl)
     * Fabian Jakobs (fjakobs)

************************************************************************ */
/**
 * An appender that writes all messages to a memory container. The messages
 * can be retrieved later, f. i. when an error dialog pops up and the question
 * arises what actions have caused the error.
 *
 * A mark feature also exists which can be used to remember a point in time.
 * When retrieving log events, it is possible to get only those events
 * after the marked time. This is useful if data from the buffer is extracted
 * and f. i. sent to a logging system. Whenever this happens, a mark() call
 * can be used so that the next extraction will only get new data.
 */
qx.Bootstrap.define("qx.log.appender.RingBuffer", {
  extend : qx.util.RingBuffer,
  /**
   * @param maxMessages {Integer?50} Maximum number of messages in the buffer
   */
  construct : function(maxMessages){

    this.setMaxMessages(maxMessages || 50);
  },
  members : {
    /**
     * Set the maximum number of messages to hold. If null the number of
     * messages is not limited.
     *
     * Warning: Changing this property will clear the events logged so far.
     *
     * @param maxMessages {Integer} the maximum number of messages to hold
     */
    setMaxMessages : function(maxMessages){

      this.setMaxEntries(maxMessages);
    },
    /**
     * Get the maximum number of messages to hold
     *
     * @return {Integer} the maximum number of messages
     */
    getMaxMessages : function(){

      return this.getMaxEntries();
    },
    /**
     * Processes a single log entry
     *
     * @param entry {Map} The entry to process
     */
    process : function(entry){

      this.addEntry(entry);
    },
    /**
     * Returns all stored log events
     *
     * @return {Array} array of stored log events
     */
    getAllLogEvents : function(){

      return this.getAllEntries();
    },
    /**
     * Returns log events which have been logged previously.
     *
     * @param count {Integer} The number of events to retrieve. If there are
     *    more events than the given count, the oldest ones will not be returned.
     *
     * @param startingFromMark {Boolean ? false} If true, only entries since the last call to mark()
     *                                           will be returned
     * @return {Array} array of stored log events
     */
    retrieveLogEvents : function(count, startingFromMark){

      return this.getEntries(count, startingFromMark);
    },
    /**
     * Clears the log history
     */
    clearHistory : function(){

      this.clear();
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */
/**
 * Main qooxdoo logging class.
 *
 * Used as central logging feature by qx.core.Object.
 *
 * Extremely modular and lightweight to support logging at bootstrap and
 * at shutdown as well.
 *
 * * Supports dynamic appenders to push the output to the user
 * * Supports buffering of the last 50 messages (configurable)
 * * Supports different debug levels ("debug", "info", "warn" or "error")
 * * Simple data serialization for incoming messages
 *
 * @require(qx.dev.StackTrace)
 */
qx.Bootstrap.define("qx.log.Logger", {
  statics : {
    /*
    ---------------------------------------------------------------------------
      CONFIGURATION
    ---------------------------------------------------------------------------
    */
    __cg : "debug",
    /**
     * Configures the minimum log level required for new messages.
     *
     * @param value {String} One of "debug", "info", "warn" or "error".
     */
    setLevel : function(value){

      this.__cg = value;
    },
    /**
     * Returns the currently configured minimum log level required for new
     * messages.
     *
     * @return {Integer} Debug level
     */
    getLevel : function(){

      return this.__cg;
    },
    /**
     * Configures the number of messages to be kept in the buffer.
     *
     * @param value {Integer} Any positive integer
     */
    setTreshold : function(value){

      this.__cj.setMaxMessages(value);
    },
    /**
     * Returns the currently configured number of messages to be kept in the
     * buffer.
     *
     * @return {Integer} Treshold value
     */
    getTreshold : function(){

      return this.__cj.getMaxMessages();
    },
    /*
    ---------------------------------------------------------------------------
      APPENDER MANAGEMENT
    ---------------------------------------------------------------------------
    */
    /** @type {Map} Map of all known appenders by ID */
    __ch : {
    },
    /** @type {Integer} Last free appender ID */
    __ci : 0,
    /**
     * Registers the given appender and inserts the last cached messages.
     *
     * @param appender {Class} A static appender class supporting at
     *   least a <code>process()</code> method to handle incoming messages.
     */
    register : function(appender){

      if(appender.$$id){

        return;
      };
      // Register appender
      var id = this.__ci++;
      this.__ch[id] = appender;
      appender.$$id = id;
      var levels = this.__ck;
      // Insert previous messages
      var entries = this.__cj.getAllLogEvents();
      for(var i = 0,l = entries.length;i < l;i++){

        if(levels[entries[i].level] >= levels[this.__cg]){

          appender.process(entries[i]);
        };
      };
    },
    /**
     * Unregisters the given appender
     *
     * @param appender {Class} A static appender class
     */
    unregister : function(appender){

      var id = appender.$$id;
      if(id == null){

        return;
      };
      delete this.__ch[id];
      delete appender.$$id;
    },
    /*
    ---------------------------------------------------------------------------
      USER METHODS
    ---------------------------------------------------------------------------
    */
    /**
     * Sending a message at level "debug" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     */
    debug : function(object, message){

      qx.log.Logger.__cl("debug", arguments);
    },
    /**
     * Sending a message at level "info" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     */
    info : function(object, message){

      qx.log.Logger.__cl("info", arguments);
    },
    /**
     * Sending a message at level "warn" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     */
    warn : function(object, message){

      qx.log.Logger.__cl("warn", arguments);
    },
    /**
     * Sending a message at level "error" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     */
    error : function(object, message){

      qx.log.Logger.__cl("error", arguments);
    },
    /**
     * Prints the current stack trace at level "info"
     *
     * @param object {Object?} Contextual object (either instance or static class)
     */
    trace : function(object){

      var trace = qx.dev.StackTrace.getStackTrace();
      qx.log.Logger.__cl("info", [(typeof object !== "undefined" ? [object].concat(trace) : trace).join("\n")]);
    },
    /**
     * Prints a method deprecation warning and a stack trace if the setting
     * <code>qx.debug</code> is set to <code>true</code>.
     *
     * @param fcn {Function} reference to the deprecated function. This is
     *     arguments.callee if the calling method is to be deprecated.
     * @param msg {String?} Optional message to be printed.
     */
    deprecatedMethodWarning : function(fcn, msg){

      if(qx.core.Environment.get("qx.debug")){

        var functionName = qx.lang.Function.getName(fcn);
        this.warn("The method '" + functionName + "' is deprecated: " + (msg || "Please consult the API documentation of this method for alternatives."));
        this.trace();
      };
    },
    /**
     * Prints a class deprecation warning and a stack trace if the setting
     * <code>qx.debug</code> is set to <code>true</code>.
     *
     * @param clazz {Class} reference to the deprecated class.
     * @param msg {String?} Optional message to be printed.
     */
    deprecatedClassWarning : function(clazz, msg){

      if(qx.core.Environment.get("qx.debug")){

        var className = clazz.classname || "unknown";
        this.warn("The class '" + className + "' is deprecated: " + (msg || "Please consult the API documentation of this class for alternatives."));
        this.trace();
      };
    },
    /**
     * Prints an event deprecation warning and a stack trace if the setting
     * <code>qx.debug</code> is set to <code>true</code>.
     *
     * @param clazz {Class} reference to the deprecated class.
     * @param event {String} deprecated event name.
     * @param msg {String?} Optional message to be printed.
     */
    deprecatedEventWarning : function(clazz, event, msg){

      if(qx.core.Environment.get("qx.debug")){

        var className = clazz.self ? clazz.self.classname : "unknown";
        this.warn("The event '" + (event || "unknown") + "' from class '" + className + "' is deprecated: " + (msg || "Please consult the API documentation of this class for alternatives."));
        this.trace();
      };
    },
    /**
     * Prints a mixin deprecation warning and a stack trace if the setting
     * <code>qx.debug</code> is set to <code>true</code>.
     *
     * @param clazz {Class} reference to the deprecated mixin.
     * @param msg {String?} Optional message to be printed.
     */
    deprecatedMixinWarning : function(clazz, msg){

      if(qx.core.Environment.get("qx.debug")){

        var mixinName = clazz ? clazz.name : "unknown";
        this.warn("The mixin '" + mixinName + "' is deprecated: " + (msg || "Please consult the API documentation of this class for alternatives."));
        this.trace();
      };
    },
    /**
     * Prints a constant deprecation warning and a stacktrace if the setting
     * <code>qx.debug</code> is set to <code>true</code> AND the browser supports
     * __defineGetter__!
     *
     * @param clazz {Class} The class the constant is attached to.
     * @param constant {String} The name of the constant as string.
     * @param msg {String} Optional message to be printed.
     */
    deprecatedConstantWarning : function(clazz, constant, msg){

      if(qx.core.Environment.get("qx.debug")){

        // check if __defineGetter__ is available
        if(clazz.__defineGetter__){

          var self = this;
          var constantValue = clazz[constant];
          clazz.__defineGetter__(constant, function(){

            self.warn("The constant '" + constant + "' is deprecated: " + (msg || "Please consult the API documentation for alternatives."));
            self.trace();
            return constantValue;
          });
        };
      };
    },
    /**
     * Prints a deprecation waring and a stacktrace when a subclass overrides
     * the passed method name. The deprecation is only printed if the setting
     * <code>qx.debug</code> is set to <code>true</code>.
     *
     *
     * @param object {qx.core.Object} Instance to check for overriding.
     * @param baseclass {Class} The baseclass as starting point.
     * @param methodName {String} The method name which is deprecated for overriding.
     * @param msg {String?} Optional message to be printed.
     */
    deprecateMethodOverriding : function(object, baseclass, methodName, msg){

      if(qx.core.Environment.get("qx.debug")){

        var clazz = object.constructor;
        while(clazz.classname !== baseclass.classname){

          if(clazz.prototype.hasOwnProperty(methodName)){

            this.warn("The method '" + qx.lang.Function.getName(object[methodName]) + "' overrides a deprecated method: " + (msg || "Please consult the API documentation for alternatives."));
            this.trace();
            break;
          };
          clazz = clazz.superclass;
        };
      };
    },
    /**
     * Deletes the current buffer. Does not influence message handling of the
     * connected appenders.
     *
     */
    clear : function(){

      this.__cj.clearHistory();
    },
    /*
    ---------------------------------------------------------------------------
      INTERNAL LOGGING IMPLEMENTATION
    ---------------------------------------------------------------------------
    */
    /** @type {qx.log.appender.RingBuffer} Message buffer of previously fired messages. */
    __cj : new qx.log.appender.RingBuffer(50),
    /** @type {Map} Numeric translation of log levels */
    __ck : {
      debug : 0,
      info : 1,
      warn : 2,
      error : 3
    },
    /**
     * Internal logging main routine.
     *
     * @param level {String} One of "debug", "info", "warn" or "error"
     * @param args {Array} List of other arguments, where the first is
     *   taken as the context object.
     */
    __cl : function(level, args){

      // Filter according to level
      var levels = this.__ck;
      if(levels[level] < levels[this.__cg]){

        return;
      };
      // Serialize and cache
      var object = args.length < 2 ? null : args[0];
      var start = object ? 1 : 0;
      var items = [];
      for(var i = start,l = args.length;i < l;i++){

        items.push(this.__cn(args[i], true));
      };
      // Build entry
      var time = new Date;
      var entry = {
        time : time,
        offset : time - qx.Bootstrap.LOADSTART,
        level : level,
        items : items,
        // store window to allow cross frame logging
        win : window
      };
      // Add relation fields
      if(object){

        // Do not explicitly check for instanceof qx.core.Object, in order not
        // to introduce an unwanted load-time dependency
        if(object.$$hash !== undefined){

          entry.object = object.$$hash;
        } else if(object.$$type){

          entry.clazz = object;
        } else if(object.constructor){

          entry.clazz = object.constructor;
        };;
      };
      this.__cj.process(entry);
      // Send to appenders
      var appender = this.__ch;
      for(var id in appender){

        appender[id].process(entry);
      };
    },
    /**
     * Detects the type of the variable given.
     *
     * @param value {var} Incoming value
     * @return {String} Type of the incoming value. Possible values:
     *   "undefined", "null", "boolean", "number", "string",
     *   "function", "array", "error", "map",
     *   "class", "instance", "node", "stringify", "unknown"
     */
    __cm : function(value){

      if(value === undefined){

        return "undefined";
      } else if(value === null){

        return "null";
      };
      if(value.$$type){

        return "class";
      };
      var type = typeof value;
      if(type === "function" || type == "string" || type === "number" || type === "boolean"){

        return type;
      } else if(type === "object"){

        if(value.nodeType){

          return "node";
        } else if(value instanceof Error || (value.name && value.message)){

          return "error";
        } else if(value.classname){

          return "instance";
        } else if(value instanceof Array){

          return "array";
        } else if(value instanceof Date){

          return "date";
        } else {

          return "map";
        };;;;
      };
      if(value.toString){

        return "stringify";
      };
      return "unknown";
    },
    /**
     * Serializes the incoming value. If it is a singular value, the result is
     * a simple string. For an array or a map the result can also be a
     * serialized string of a limited number of individual items.
     *
     * @param value {var} Incoming value
     * @param deep {Boolean?false} Whether arrays and maps should be
     *    serialized for a limited number of items
     * @return {Map} Contains the keys <code>type</code>, <code>text</code> and
     * <code>trace</code>.
     */
    __cn : function(value, deep){

      var type = this.__cm(value);
      var text = "unknown";
      var trace = [];
      switch(type){case "null":case "undefined":
      text = type;
      break;case "string":case "number":case "boolean":case "date":
      text = value;
      break;case "node":
      if(value.nodeType === 9){

        text = "document";
      } else if(value.nodeType === 3){

        text = "text[" + value.nodeValue + "]";
      } else if(value.nodeType === 1){

        text = value.nodeName.toLowerCase();
        if(value.id){

          text += "#" + value.id;
        };
      } else {

        text = "node";
      };;
      break;case "function":
      text = qx.lang.Function.getName(value) || type;
      break;case "instance":
      text = value.basename + "[" + value.$$hash + "]";
      break;case "class":case "stringify":
      text = value.toString();
      break;case "error":
      trace = qx.dev.StackTrace.getStackTraceFromError(value);
      text = (value.basename ? value.basename + ": " : "") + value.toString();
      break;case "array":
      if(deep){

        text = [];
        for(var i = 0,l = value.length;i < l;i++){

          if(text.length > 20){

            text.push("...(+" + (l - i) + ")");
            break;
          };
          text.push(this.__cn(value[i], false));
        };
      } else {

        text = "[...(" + value.length + ")]";
      };
      break;case "map":
      if(deep){

        var temp;
        // Produce sorted key list
        var sorted = [];
        for(var key in value){

          sorted.push(key);
        };
        sorted.sort();
        // Temporary text list
        text = [];
        for(var i = 0,l = sorted.length;i < l;i++){

          if(text.length > 20){

            text.push("...(+" + (l - i) + ")");
            break;
          };
          // Additional storage of hash-key
          key = sorted[i];
          temp = this.__cn(value[key], false);
          temp.key = key;
          text.push(temp);
        };
      } else {

        var number = 0;
        for(var key in value){

          number++;
        };
        text = "{...(" + number + ")}";
      };
      break;};
      return {
        type : type,
        text : text,
        trace : trace
      };
    }
  },
  defer : function(statics){

    var logs = qx.Bootstrap.$$logs;
    for(var i = 0;i < logs.length;i++){

      statics.__cl(logs[i][0], logs[i][1]);
    };
    qx.Bootstrap.debug = statics.debug;
    qx.Bootstrap.info = statics.info;
    qx.Bootstrap.warn = statics.warn;
    qx.Bootstrap.error = statics.error;
    qx.Bootstrap.trace = statics.trace;
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * This mixin offers the basic logging features offered by {@link qx.log.Logger}.
 */
qx.Mixin.define("qx.core.MLogging", {
  members : {
    /** @type {Class} Pointer to the regular logger class */
    __co : qx.log.Logger,
    /**
     * Logs a debug message.
     *
     * @param varargs {var} The item(s) to log. Any number of arguments is
     * supported. If an argument is not a string, the object dump will be
     * logged.
     */
    debug : function(varargs){

      this.__cp("debug", arguments);
    },
    /**
     * Logs an info message.
     *
     * @param varargs {var} The item(s) to log. Any number of arguments is
     * supported. If an argument is not a string, the object dump will be
     * logged.
     */
    info : function(varargs){

      this.__cp("info", arguments);
    },
    /**
     * Logs a warning message.
     *
     * @param varargs {var} The item(s) to log. Any number of arguments is
     * supported. If an argument is not a string, the object dump will be
     * logged.
     */
    warn : function(varargs){

      this.__cp("warn", arguments);
    },
    /**
     * Logs an error message.
     *
     * @param varargs {var} The item(s) to log. Any number of arguments is
     * supported. If an argument is not a string, the object dump will be
     * logged.
     */
    error : function(varargs){

      this.__cp("error", arguments);
    },
    /**
     * Prints the current stack trace
     *
     */
    trace : function(){

      this.__co.trace(this);
    },
    /**
     * Helper that calls the appropriate logger function with the current object
     * and any number of items.
     *
     * @param level {String} The log level of the message
     * @param varargs {arguments} Arguments list to be logged
     */
    __cp : function(level, varargs){

      var argumentsArray = qx.lang.Array.fromArguments(varargs);
      argumentsArray.unshift(this);
      this.__co[level].apply(this.__co, argumentsArray);
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */
/**
 * Basic node creation and type detection
 */
qx.Bootstrap.define("qx.dom.Node", {
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  statics : {
    /*
    ---------------------------------------------------------------------------
      NODE TYPES
    ---------------------------------------------------------------------------
    */
    /**
     * @type {Map} Node type:
     *
     * * ELEMENT
     * * ATTRIBUTE
     * * TEXT
     * * CDATA_SECTION
     * * ENTITY_REFERENCE
     * * ENTITY
     * * PROCESSING_INSTRUCTION
     * * COMMENT
     * * DOCUMENT
     * * DOCUMENT_TYPE
     * * DOCUMENT_FRAGMENT
     * * NOTATION
     */
    ELEMENT : 1,
    ATTRIBUTE : 2,
    TEXT : 3,
    CDATA_SECTION : 4,
    ENTITY_REFERENCE : 5,
    ENTITY : 6,
    PROCESSING_INSTRUCTION : 7,
    COMMENT : 8,
    DOCUMENT : 9,
    DOCUMENT_TYPE : 10,
    DOCUMENT_FRAGMENT : 11,
    NOTATION : 12,
    /*
    ---------------------------------------------------------------------------
      DOCUMENT ACCESS
    ---------------------------------------------------------------------------
    */
    /**
     * Returns the owner document of the given node
     *
     * @param node {Node|Document|Window} the node which should be tested
     * @return {Document|null} The document of the given DOM node
     */
    getDocument : function(node){

      return node.nodeType === this.DOCUMENT ? node : // is document already
      node.ownerDocument || // is DOM node
      node.document;
    },
    /**
     * Returns the DOM2 <code>defaultView</code> (window).
     *
     * @param node {Node|Document|Window} node to inspect
     * @return {Window} the <code>defaultView</code> of the given node
     */
    getWindow : function(node){

      // is a window already
      if(node.nodeType == null){

        return node;
      };
      // jump to document
      if(node.nodeType !== this.DOCUMENT){

        node = node.ownerDocument;
      };
      // jump to window
      return node.defaultView || node.parentWindow;
    },
    /**
     * Returns the document element. (Logical root node)
     *
     * This is a convenience attribute that allows direct access to the child
     * node that is the root element of the document. For HTML documents,
     * this is the element with the tagName "HTML".
     *
     * @param node {Node|Document|Window} node to inspect
     * @return {Element} document element of the given node
     */
    getDocumentElement : function(node){

      return this.getDocument(node).documentElement;
    },
    /**
     * Returns the body element. (Visual root node)
     *
     * This normally only makes sense for HTML documents. It returns
     * the content area of the HTML document.
     *
     * @param node {Node|Document|Window} node to inspect
     * @return {Element} document body of the given node
     */
    getBodyElement : function(node){

      return this.getDocument(node).body;
    },
    /*
    ---------------------------------------------------------------------------
      TYPE TESTS
    ---------------------------------------------------------------------------
    */
    /**
     * Whether the given object is a DOM node
     *
     * @param node {Node} the node which should be tested
     * @return {Boolean} true if the node is a DOM node
     */
    isNode : function(node){

      return !!(node && node.nodeType != null);
    },
    /**
     * Whether the given object is a DOM element node
     *
     * @param node {Node} the node which should be tested
     * @return {Boolean} true if the node is a DOM element
     */
    isElement : function(node){

      return !!(node && node.nodeType === this.ELEMENT);
    },
    /**
     * Whether the given object is a DOM document node
     *
     * @param node {Node} the node which should be tested
     * @return {Boolean} true when the node is a DOM document
     */
    isDocument : function(node){

      return !!(node && node.nodeType === this.DOCUMENT);
    },
    /**
     * Whether the given object is a DOM text node
     *
     * @param node {Node} the node which should be tested
     * @return {Boolean} true if the node is a DOM text node
     */
    isText : function(node){

      return !!(node && node.nodeType === this.TEXT);
    },
    /**
     * Check whether the given object is a browser window object.
     *
     * @param obj {Object} the object which should be tested
     * @return {Boolean} true if the object is a window object
     */
    isWindow : function(obj){

      return !!(obj && obj.history && obj.location && obj.document);
    },
    /**
     * Whether the node has the given node name
     *
     * @param node {Node} the node
     * @param nodeName {String} the node name to check for
     * @return {Boolean} Whether the node has the given node name
     */
    isNodeName : function(node, nodeName){

      if(!nodeName || !node || !node.nodeName){

        return false;
      };
      return nodeName.toLowerCase() == qx.dom.Node.getName(node);
    },
    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */
    /**
     * Get the node name as lower case string
     *
     * @param node {Node} the node
     * @return {String} the node name
     */
    getName : function(node){

      if(!node || !node.nodeName){

        return null;
      };
      return node.nodeName.toLowerCase();
    },
    /**
     * Returns the text content of an node where the node may be of node type
     * NODE_ELEMENT, NODE_ATTRIBUTE, NODE_TEXT or NODE_CDATA
     *
     * @param node {Node} the node from where the search should start.
     *     If the node has subnodes the text contents are recursively retreived and joined.
     * @return {String} the joined text content of the given node or null if not appropriate.
     * @signature function(node)
     */
    getText : function(node){

      if(!node || !node.nodeType){

        return null;
      };
      switch(node.nodeType){case 1:
      // NODE_ELEMENT
      var i,a = [],nodes = node.childNodes,length = nodes.length;
      for(i = 0;i < length;i++){

        a[i] = this.getText(nodes[i]);
      };
      return a.join("");case 2:// NODE_ATTRIBUTE
      case 3:// NODE_TEXT
      case 4:
      // CDATA
      return node.nodeValue;};
      return null;
    },
    /**
     * Checks if the given node is a block node
     *
     * @param node {Node} Node
     * @return {Boolean} whether it is a block node
     */
    isBlockNode : function(node){

      if(!qx.dom.Node.isElement(node)){

        return false;
      };
      node = qx.dom.Node.getName(node);
      return /^(body|form|textarea|fieldset|ul|ol|dl|dt|dd|li|div|hr|p|h[1-6]|quote|pre|table|thead|tbody|tfoot|tr|td|th|iframe|address|blockquote)$/.test(node);
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)
     * Alexander Steitz (aback)
     * Christian Hagendorn (chris_schmidt)

   ======================================================================

   This class contains code based on the following work:

   * Juriy Zaytsev
     http://thinkweb2.com/projects/prototype/detecting-event-support-without-browser-sniffing/

     Copyright (c) 2009 Juriy Zaytsev

     Licence:
       BSD: http://github.com/kangax/iseventsupported/blob/master/LICENSE

     ----------------------------------------------------------------------

     http://github.com/kangax/iseventsupported/blob/master/LICENSE

     Copyright (c) 2009 Juriy Zaytsev

     Permission is hereby granted, free of charge, to any person
     obtaining a copy of this software and associated documentation
     files (the "Software"), to deal in the Software without
     restriction, including without limitation the rights to use,
     copy, modify, merge, publish, distribute, sublicense, and/or sell
     copies of the Software, and to permit persons to whom the
     Software is furnished to do so, subject to the following
     conditions:

     The above copyright notice and this permission notice shall be
     included in all copies or substantial portions of the Software.

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
     EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
     OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
     NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
     HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
     WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
     FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
     OTHER DEALINGS IN THE SOFTWARE.

************************************************************************ */
/**
 * Wrapper around native event management capabilities of the browser.
 * This class should not be used directly normally. It's better
 * to use {@link qx.event.Registration} instead.
 */
qx.Bootstrap.define("qx.bom.Event", {
  statics : {
    /**
     * Use the low level browser functionality to attach event listeners
     * to DOM nodes.
     *
     * Use this with caution. This is only thought for event handlers and
     * qualified developers. These are not mem-leak protected!
     *
     * @param target {Object} Any valid native event target
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the function to assign
     * @param useCapture {Boolean ? false} A Boolean value that specifies the event phase to add
     *    the event handler for the capturing phase or the bubbling phase.
     */
    addNativeListener : function(target, type, listener, useCapture){

      if(target.addEventListener){

        target.addEventListener(type, listener, !!useCapture);
      } else if(target.attachEvent){

        target.attachEvent("on" + type, listener);
      } else if(typeof target["on" + type] != "undefined"){

        target["on" + type] = listener;
      } else {

        if(qx.core.Environment.get("qx.debug")){

          qx.log.Logger.warn("No method available to add native listener to " + target);
        };
      };;
    },
    /**
     * Use the low level browser functionality to remove event listeners
     * from DOM nodes.
     *
     * @param target {Object} Any valid native event target
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the function to assign
     * @param useCapture {Boolean ? false} A Boolean value that specifies the event phase to remove
     *    the event handler for the capturing phase or the bubbling phase.
     */
    removeNativeListener : function(target, type, listener, useCapture){

      if(target.removeEventListener){

        target.removeEventListener(type, listener, !!useCapture);
      } else if(target.detachEvent){

        try{

          target.detachEvent("on" + type, listener);
        } catch(e) {

          // IE7 sometimes dispatches "unload" events on protected windows
          // Ignore the "permission denied" errors.
          if(e.number !== -2146828218){

            throw e;
          };
        };
      } else if(typeof target["on" + type] != "undefined"){

        target["on" + type] = null;
      } else {

        if(qx.core.Environment.get("qx.debug")){

          qx.log.Logger.warn("No method available to remove native listener from " + target);
        };
      };;
    },
    /**
     * Returns the target of the event.
     *
     * @param e {Event} Native event object
     * @return {Object} Any valid native event target
     */
    getTarget : function(e){

      return e.target || e.srcElement;
    },
    /**
     * Computes the related target from the native DOM event
     *
     * @param e {Event} Native DOM event object
     * @return {Element} The related target
     */
    getRelatedTarget : function(e){

      if(e.relatedTarget !== undefined){

        // In Firefox the related target of mouse events is sometimes an
        // anonymous div inside of a text area, which raises an exception if
        // the nodeType is read. This is why the try/catch block is needed.
        if((qx.core.Environment.get("engine.name") == "gecko")){

          try{

            e.relatedTarget && e.relatedTarget.nodeType;
          } catch(ex) {

            return null;
          };
        };
        return e.relatedTarget;
      } else if(e.fromElement !== undefined && e.type === "mouseover"){

        return e.fromElement;
      } else if(e.toElement !== undefined){

        return e.toElement;
      } else {

        return null;
      };;
    },
    /**
     * Prevent the native default of the event to be processed.
     *
     * This is useful to stop native keybindings, native selection
     * and other native functionality behind events.
     *
     * @param e {Event} Native event object
     */
    preventDefault : function(e){

      if(e.preventDefault){

        e.preventDefault();
      } else {

        try{

          // this allows us to prevent some key press events in IE.
          // See bug #1049
          e.keyCode = 0;
        } catch(ex) {
        };
        e.returnValue = false;
      };
    },
    /**
     * Stops the propagation of the given event to the parent element.
     *
     * Only useful for events which bubble e.g. mousedown.
     *
     * @param e {Event} Native event object
     */
    stopPropagation : function(e){

      if(e.stopPropagation){

        e.stopPropagation();
      } else {

        e.cancelBubble = true;
      };
    },
    /**
     * Fires a synthetic native event on the given element.
     *
     * @param target {Element} DOM element to fire event on
     * @param type {String} Name of the event to fire
     * @return {Boolean} A value that indicates whether any of the event handlers called {@link #preventDefault}.
     *  <code>true</code> The default action is permitted, <code>false</code> the caller should prevent the default action.
     */
    fire : function(target, type){

      // dispatch for standard first
      if(document.createEvent){

        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(type, true, true);
        return !target.dispatchEvent(evt);
      } else {

        var evt = document.createEventObject();
        return target.fireEvent("on" + type, evt);
      };
    },
    /**
     * Whether the given target supports the given event type.
     *
     * Useful for testing for support of new features like
     * touch events, gesture events, orientation change, on/offline, etc.
     *
     * *NOTE:* This check is *case-insensitive*.
     * <code>supportsEvent(window, "cLicK")</code> will return <code>true</code>
     * but <code>window.addEventListener("cLicK", callback)</code> will fail
     * silently!
     *
     * @param target {var} Any valid target e.g. window, dom node, etc.
     * @param type {String} Type of the event e.g. click, mousedown
     * @return {Boolean} Whether the given event is supported
     */
    supportsEvent : function(target, type){

      // transitionEnd support can not be detected generically for Internet Explorer 10+ [BUG #7875]
      if(type.toLowerCase().indexOf("transitionend") != -1 && qx.core.Environment.get("engine.name") === "mshtml" && qx.core.Environment.get("browser.documentmode") > 9){

        return true;
      };
      // The 'transitionend' event can only be detected on window objects,
      // not DOM elements [BUG #7249]
      if(target != window && type.toLowerCase().indexOf("transitionend") != -1){

        var transitionSupport = qx.core.Environment.get("css.transition");
        return (transitionSupport && transitionSupport["end-event"] == type);
      };
      // Using the lowercase representation is important for the
      // detection of events like 'MSPointer*'. They have to detected
      // using the lower case name of the event.
      var eventName = "on" + type.toLowerCase();
      var supportsEvent = (eventName in target);
      if(!supportsEvent){

        supportsEvent = typeof target[eventName] == "function";
        if(!supportsEvent && target.setAttribute){

          target.setAttribute(eventName, "return;");
          supportsEvent = typeof target[eventName] == "function";
          target.removeAttribute(eventName);
        };
      };
      return supportsEvent;
    },
    /**
     * Returns the (possibly vendor-prefixed) name of the given event type.
     * *NOTE:* Incorrect capitalization of type names will *not* be corrected. See
     * {@link #supportsEvent} for details.
     *
     * @param target {var} Any valid target e.g. window, dom node, etc.
     * @param type {String} Type of the event e.g. click, mousedown
     * @return {String|null} Event name or <code>null</code> if the event is not
     * supported.
     */
    getEventName : function(target, type){

      var pref = [""].concat(qx.bom.Style.VENDOR_PREFIXES);
      for(var i = 0,l = pref.length;i < l;i++){

        var prefix = pref[i].toLowerCase();
        if(qx.bom.Event.supportsEvent(target, prefix + type)){

          return prefix ? prefix + qx.lang.String.firstUp(type) : type;
        };
      };
      return null;
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */
/**
 * Responsible class for everything concerning styles without the need of
 * an element.
 *
 * If you want to query or modify styles of HTML elements,
 * take a look at {@link qx.bom.element.Style}.
 */
qx.Bootstrap.define("qx.bom.Style", {
  statics : {
    /** Vendor-specific style property prefixes */
    VENDOR_PREFIXES : ["Webkit", "Moz", "O", "ms", "Khtml"],
    /**
     * Internal lookup table to map property names to CSS names
     * @internal
     */
    __cq : {
    },
    /**
     * A reference to the native CSS.supports function (supportsCSS in Opera)
     * @internal
     */
    __cr : null,
    /**
     * Takes the name of a style property and returns the name the browser uses
     * for its implementation, which might include a vendor prefix.
     *
     * @param propertyName {String} Style property name to check
     * @return {String|null} The supported property name or <code>null</code> if
     * not supported
     */
    getPropertyName : function(propertyName){

      var style = document.documentElement.style;
      if(style[propertyName] !== undefined){

        return propertyName;
      };
      for(var i = 0,l = this.VENDOR_PREFIXES.length;i < l;i++){

        var prefixedProp = this.VENDOR_PREFIXES[i] + qx.lang.String.firstUp(propertyName);
        if(style[prefixedProp] !== undefined){

          return prefixedProp;
        };
      };
      return null;
    },
    /**
     * Takes the name of a JavaScript style property and returns the
     * corresponding CSS name.
     *
     * The name of the style property is taken as is, i.e. it gets not
     * extended by vendor prefixes. The conversion into the CSS name is
     * done by string manipulation, not involving the DOM.
     *
     * Example:
     * <pre class='javascript'>qx.bom.Style.getCssName("MozTransform"); //returns "-moz-transform"</pre>
     *
     * @param propertyName {String} JavaScript style property
     * @return {String} CSS property
     */
    getCssName : function(propertyName){

      var cssName = this.__cq[propertyName];
      if(!cssName){

        // all vendor prefixes (except for "ms") start with an uppercase letter
        cssName = propertyName.replace(/[A-Z]/g, function(match){

          return ('-' + match.charAt(0).toLowerCase());
        });
        // lowercase "ms" vendor prefix needs special handling
        if((/^ms/.test(cssName))){

          cssName = "-" + cssName;
        };
        this.__cq[propertyName] = cssName;
      };
      return cssName;
    },
    /**
     * Detects CSS support by using the native CSS.supports function or by
     * applying a style to a DOM element of the given type and verifying
     * the result. Also checks for vendor-prefixed variants of the
     * value, e.g. "linear-gradient" -> "-webkit-linear-gradient". Returns the
     * (possibly vendor-prefixed) value if successful or <code>null</code> if
     * the property and/or value are not supported.
     *
     * @param element {Element} element to be used for the detection
     * @param propertyName {String} the style property to be tested
     * @param value {String} style property value to be tested
     * @param prefixed {Boolean?} try to determine the appropriate vendor prefix
     * for the value. Default: <code>true</code>
     * @return {String|null} prefixed style value or <code>null</code> if not supported
     * @internal
     */
    getAppliedStyle : function(element, propertyName, value, prefixed){

      var cssProperty = qx.bom.Style.getCssName(propertyName);
      var win = qx.dom.Node.getWindow(element);
      var vendorPrefixes = (prefixed !== false) ? [null].concat(this.VENDOR_PREFIXES) : [null];
      for(var i = 0,l = vendorPrefixes.length;i < l;i++){

        var supported = false;
        var prefixedVal = vendorPrefixes[i] ? "-" + vendorPrefixes[i].toLowerCase() + "-" + value : value;
        if(qx.bom.Style.__cr){

          supported = qx.bom.Style.__cr.call(win, cssProperty, prefixedVal);
        } else {

          element.style.cssText += cssProperty + ":" + prefixedVal + ";";
          supported = (typeof element.style[propertyName] == "string" && element.style[propertyName] !== "");
        };
        if(supported){

          return prefixedVal;
        };
      };
      return null;
    }
  },
  defer : function(statics){

    if(window.CSS && window.CSS.supports){

      qx.bom.Style.__cr = window.CSS.supports.bind(window.CSS);
    } else if(window.supportsCSS){

      qx.bom.Style.__cr = window.supportsCSS.bind(window);
    };
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Sebastian Fastner (fastner)

************************************************************************ */
/**
 * This class is responsible for checking the operating systems name.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.OperatingSystem", {
  statics : {
    /**
     * Checks for the name of the operating system.
     * @return {String} The name of the operating system.
     * @internal
     */
    getName : function(){

      if(!navigator){

        return "";
      };
      var input = navigator.platform || "";
      var agent = navigator.userAgent || "";
      if(input.indexOf("Windows") != -1 || input.indexOf("Win32") != -1 || input.indexOf("Win64") != -1){

        return "win";
      } else if(input.indexOf("Macintosh") != -1 || input.indexOf("MacPPC") != -1 || input.indexOf("MacIntel") != -1 || input.indexOf("Mac OS X") != -1){

        return "osx";
      } else if(agent.indexOf("RIM Tablet OS") != -1){

        return "rim_tabletos";
      } else if(agent.indexOf("webOS") != -1){

        return "webos";
      } else if(input.indexOf("iPod") != -1 || input.indexOf("iPhone") != -1 || input.indexOf("iPad") != -1){

        return "ios";
      } else if(agent.indexOf("Android") != -1){

        return "android";
      } else if(input.indexOf("Linux") != -1){

        return "linux";
      } else if(input.indexOf("X11") != -1 || input.indexOf("BSD") != -1 || input.indexOf("Darwin") != -1){

        return "unix";
      } else if(input.indexOf("SymbianOS") != -1){

        return "symbian";
      } else if(input.indexOf("BlackBerry") != -1){

        return "blackberry";
      };;;;;;;;;
      // don't know
      return "";
    },
    /** Maps user agent names to system IDs */
    __cs : {
      // Windows
      "Windows NT 6.3" : "8.1",
      "Windows NT 6.2" : "8",
      "Windows NT 6.1" : "7",
      "Windows NT 6.0" : "vista",
      "Windows NT 5.2" : "2003",
      "Windows NT 5.1" : "xp",
      "Windows NT 5.0" : "2000",
      "Windows 2000" : "2000",
      "Windows NT 4.0" : "nt4",
      "Win 9x 4.90" : "me",
      "Windows CE" : "ce",
      "Windows 98" : "98",
      "Win98" : "98",
      "Windows 95" : "95",
      "Win95" : "95",
      // OS X
      "Mac OS X 10_9" : "10.9",
      "Mac OS X 10.9" : "10.9",
      "Mac OS X 10_8" : "10.8",
      "Mac OS X 10.8" : "10.8",
      "Mac OS X 10_7" : "10.7",
      "Mac OS X 10.7" : "10.7",
      "Mac OS X 10_6" : "10.6",
      "Mac OS X 10.6" : "10.6",
      "Mac OS X 10_5" : "10.5",
      "Mac OS X 10.5" : "10.5",
      "Mac OS X 10_4" : "10.4",
      "Mac OS X 10.4" : "10.4",
      "Mac OS X 10_3" : "10.3",
      "Mac OS X 10.3" : "10.3",
      "Mac OS X 10_2" : "10.2",
      "Mac OS X 10.2" : "10.2",
      "Mac OS X 10_1" : "10.1",
      "Mac OS X 10.1" : "10.1",
      "Mac OS X 10_0" : "10.0",
      "Mac OS X 10.0" : "10.0"
    },
    /**
     * Checks for the version of the operating system using the internal map.
     *
     * @internal
     * @return {String} The version as strin or an empty string if the version
     *   could not be detected.
     */
    getVersion : function(){

      var version = qx.bom.client.OperatingSystem.__ct(navigator.userAgent);
      if(version == null){

        version = qx.bom.client.OperatingSystem.__cu(navigator.userAgent);
      };
      if(version != null){

        return version;
      } else {

        return "";
      };
    },
    /**
     * Detect OS version for desktop devices
     * @param userAgent {String} userAgent parameter, needed for detection.
     * @return {String} version number as string or null.
     */
    __ct : function(userAgent){

      var str = [];
      for(var key in qx.bom.client.OperatingSystem.__cs){

        str.push(key);
      };
      var reg = new RegExp("(" + str.join("|").replace(/\./g, "\.") + ")", "g");
      var match = reg.exec(userAgent);
      if(match && match[1]){

        return qx.bom.client.OperatingSystem.__cs[match[1]];
      };
      return null;
    },
    /**
     * Detect OS version for mobile devices
     * @param userAgent {String} userAgent parameter, needed for detection.
     * @return {String} version number as string or null.
     */
    __cu : function(userAgent){

      var android = userAgent.indexOf("Android") != -1;
      var iOs = userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false;
      if(android){

        var androidVersionRegExp = new RegExp(/ Android (\d+(?:\.\d+)+)/i);
        var androidMatch = androidVersionRegExp.exec(userAgent);
        if(androidMatch && androidMatch[1]){

          return androidMatch[1];
        };
      } else if(iOs){

        var iOsVersionRegExp = new RegExp(/(CPU|iPhone|iPod) OS (\d+)_(\d+)(?:_(\d+))*\s+/);
        var iOsMatch = iOsVersionRegExp.exec(userAgent);
        if(iOsMatch && iOsMatch[2] && iOsMatch[3]){

          if(iOsMatch[4]){

            return iOsMatch[2] + "." + iOsMatch[3] + "." + iOsMatch[4];
          } else {

            return iOsMatch[2] + "." + iOsMatch[3];
          };
        };
      };
      return null;
    }
  },
  defer : function(statics){

    qx.core.Environment.add("os.name", statics.getName);
    qx.core.Environment.add("os.version", statics.getVersion);
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)
     * Martin Wittemann (martinwittemann)

   ======================================================================

   This class contains code from:

     Copyright:
       2009 Deutsche Telekom AG, Germany, http://telekom.com

     License:
       LGPL: http://www.gnu.org/licenses/lgpl.html
       EPL: http://www.eclipse.org/org/documents/epl-v10.php

     Authors:
       * Sebastian Werner (wpbasti)

   ======================================================================

   This class contains code from:

     Copyright:
       2011 Pocket Widget S.L., Spain, http://www.pocketwidget.com

     License:
       LGPL: http://www.gnu.org/licenses/lgpl.html
       EPL: http://www.eclipse.org/org/documents/epl-v10.php

     Authors:
       * Javier Martinez Villacampa


************************************************************************ */
/**
 * Basic browser detection for qooxdoo.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @require(qx.bom.client.OperatingSystem#getVersion)
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Browser", {
  statics : {
    /**
     * Checks for the name of the browser and returns it.
     * @return {String} The name of the current browser.
     * @internal
     */
    getName : function(){

      var agent = navigator.userAgent;
      var reg = new RegExp("(" + qx.bom.client.Browser.__cv + ")(/| )([0-9]+\.[0-9])");
      var match = agent.match(reg);
      if(!match){

        return "";
      };
      var name = match[1].toLowerCase();
      var engine = qx.bom.client.Engine.getName();
      if(engine === "webkit"){

        if(name === "android"){

          // Fix Chrome name (for instance wrongly defined in user agent on Android 1.6)
          name = "mobile chrome";
        } else if(agent.indexOf("Mobile Safari") !== -1 || agent.indexOf("Mobile/") !== -1){

          // Fix Safari name
          name = "mobile safari";
        } else if(agent.indexOf(" OPR/") != -1){

          name = "opera";
        };;
      } else if(engine === "mshtml"){

        // IE 11's ua string no longer contains "MSIE" or even "IE"
        if(name === "msie" || name === "trident"){

          name = "ie";
          // Fix IE mobile before Microsoft added IEMobile string
          if(qx.bom.client.OperatingSystem.getVersion() === "ce"){

            name = "iemobile";
          };
        };
      } else if(engine === "opera"){

        if(name === "opera mobi"){

          name = "operamobile";
        } else if(name === "opera mini"){

          name = "operamini";
        };
      } else if(engine === "gecko"){

        if(agent.indexOf("Maple") !== -1){

          name = "maple";
        };
      };;;
      return name;
    },
    /**
     * Determines the version of the current browser.
     * @return {String} The name of the current browser.
     * @internal
     */
    getVersion : function(){

      var agent = navigator.userAgent;
      var reg = new RegExp("(" + qx.bom.client.Browser.__cv + ")(/| )([0-9]+\.[0-9])");
      var match = agent.match(reg);
      if(!match){

        return "";
      };
      var name = match[1].toLowerCase();
      var version = match[3];
      // Support new style version string used by Opera and Safari
      if(agent.match(/Version(\/| )([0-9]+\.[0-9])/)){

        version = RegExp.$2;
      };
      if(qx.bom.client.Engine.getName() == "mshtml"){

        // Use the Engine version, because IE8 and higher change the user agent
        // string to an older version in compatibility mode
        version = qx.bom.client.Engine.getVersion();
        if(name === "msie" && qx.bom.client.OperatingSystem.getVersion() == "ce"){

          // Fix IE mobile before Microsoft added IEMobile string
          version = "5.0";
        };
      };
      if(qx.bom.client.Browser.getName() == "maple"){

        // Fix version detection for Samsung Smart TVs Maple browser from 2010 and 2011 models
        reg = new RegExp("(Maple )([0-9]+\.[0-9]+\.[0-9]*)");
        match = agent.match(reg);
        if(!match){

          return "";
        };
        version = match[2];
      };
      if(qx.bom.client.Engine.getName() == "webkit" || qx.bom.client.Browser.getName() == "opera"){

        if(agent.match(/OPR(\/| )([0-9]+\.[0-9])/)){

          version = RegExp.$2;
        };
      };
      return version;
    },
    /**
     * Returns in which document mode the current document is (only for IE).
     *
     * @internal
     * @return {Number} The mode in which the browser is.
     */
    getDocumentMode : function(){

      if(document.documentMode){

        return document.documentMode;
      };
      return 0;
    },
    /**
     * Check if in quirks mode.
     *
     * @internal
     * @return {Boolean} <code>true</code>, if the environment is in quirks mode
     */
    getQuirksMode : function(){

      if(qx.bom.client.Engine.getName() == "mshtml" && parseFloat(qx.bom.client.Engine.getVersion()) >= 8){

        return qx.bom.client.Engine.DOCUMENT_MODE === 5;
      } else {

        return document.compatMode !== "CSS1Compat";
      };
    },
    /**
     * Internal helper map for picking the right browser names to check.
     */
    __cv : {
      // Safari should be the last one to check, because some other Webkit-based browsers
      // use this identifier together with their own one.
      // "Version" is used in Safari 4 to define the Safari version. After "Safari" they place the
      // Webkit version instead. Silly.
      // Palm Pre uses both Safari (contains Webkit version) and "Version" contains the "Pre" version. But
      // as "Version" is not Safari here, we better detect this as the Pre-Browser version. So place
      // "Pre" in front of both "Version" and "Safari".
      "webkit" : "AdobeAIR|Titanium|Fluid|Chrome|Android|Epiphany|Konqueror|iCab|OmniWeb|Maxthon|Pre|PhantomJS|Mobile Safari|Safari",
      // Better security by keeping Firefox the last one to match
      "gecko" : "prism|Fennec|Camino|Kmeleon|Galeon|Netscape|SeaMonkey|Namoroka|Firefox",
      // No idea what other browsers based on IE's engine
      "mshtml" : "IEMobile|Maxthon|MSIE|Trident",
      // Keep "Opera" the last one to correctly prefer/match the mobile clients
      "opera" : "Opera Mini|Opera Mobi|Opera"
    }[qx.bom.client.Engine.getName()]
  },
  defer : function(statics){

    qx.core.Environment.add("browser.name", statics.getName) , qx.core.Environment.add("browser.version", statics.getVersion) , qx.core.Environment.add("browser.documentmode", statics.getDocumentMode) , qx.core.Environment.add("browser.quirksmode", statics.getQuirksMode);
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */
/**
 * CSS Transition support checks.
 *
 * Spec: http://www.w3.org/TR/css3-transitions/
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.CssTransition", {
  statics : {
    /**
     * Returns the (possibly vendor-prefixed) name of the CSS transition property
     * @return {String|null} transition property name or <code>null</code> if
     * not supported
     * @internal
     */
    getTransitionName : function(){

      return qx.bom.Style.getPropertyName("transition");
    },
    /**
     * Main check method which returns an object if CSS transitions are
     * supported. The object contains the following keys:
     * <ul>
     *  <li><code>name</code> The name of the CSS transition property</li>
     *  <li><code>end-event</code> The name of the end event</li>
     * </ul>
     *
     * @internal
     * @return {Object|null} The described object or <code>null</code> if
     * transitions are not supported.
     */
    getSupport : function(){

      var name = qx.bom.client.CssTransition.getTransitionName();
      if(!name){

        return null;
      };
      var eventName = qx.bom.Event.getEventName(window, "transitionEnd");
      eventName = eventName == "transitionEnd" ? eventName.toLowerCase() : eventName;
      // Detecting the end event's name is not possible in some browsers,
      // so we deduce it from the property name instead.
      if(!eventName){

        eventName = name + (name.indexOf("Trans") > 0 ? "E" : "e") + "nd";
      };
      return {
        name : name,
        "end-event" : eventName
      };
    }
  },
  defer : function(statics){

    qx.core.Environment.add("css.transition", statics.getSupport);
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)

************************************************************************ */
/**
 * Wrapper for browser DOM event handling for each browser window/frame.
 *
 * @require(qx.bom.Event)
 */
qx.Class.define("qx.event.Manager", {
  extend : Object,
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  /**
   * Creates a new instance of the event handler.
   *
   * @param win {Window} The DOM window this manager handles the events for
   * @param registration {qx.event.Registration} The event registration to use
   */
  construct : function(win, registration){

    // Assign window object
    this.__cw = win;
    this.__cx = qx.core.ObjectRegistry.toHashCode(win);
    this.__cy = registration;
    // Register to the page unload event.
    // Only for iframes and other secondary documents.
    if(win.qx !== qx){

      var self = this;
      qx.bom.Event.addNativeListener(win, "unload", qx.event.GlobalError.observeMethod(function(){

        qx.bom.Event.removeNativeListener(win, "unload", arguments.callee);
        self.dispose();
      }));
    };
    // Registry for event listeners
    this.__cz = {
    };
    // The handler and dispatcher instances
    this.__cA = {
    };
    this.__cB = {
    };
    this.__cC = {
    };
  },
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  statics : {
    /** @type {Integer} Last used ID for an event */
    __cD : 0,
    /**
     * Returns an unique ID which may be used in combination with a target and
     * a type to identify an event entry.
     *
     * @return {String} The next free identifier (auto-incremented)
     */
    getNextUniqueId : function(){

      return (this.__cD++) + "";
    }
  },
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members : {
    __cy : null,
    __cz : null,
    __cB : null,
    __cE : null,
    __cA : null,
    __cC : null,
    __cw : null,
    __cx : null,
    /*
    ---------------------------------------------------------------------------
      HELPERS
    ---------------------------------------------------------------------------
    */
    /**
     * Get the window instance the event manager is responsible for
     *
     * @return {Window} DOM window instance
     */
    getWindow : function(){

      return this.__cw;
    },
    /**
     * Get the hashcode of the manager's window
     *
     * @return {String} The window's hashcode
     */
    getWindowId : function(){

      return this.__cx;
    },
    /**
     * Returns an instance of the given handler class for this manager(window).
     *
     * @param clazz {Class} Any class which implements {@link qx.event.IEventHandler}
     * @return {Object} The instance used by this manager
     */
    getHandler : function(clazz){

      var handler = this.__cA[clazz.classname];
      if(handler){

        return handler;
      };
      return this.__cA[clazz.classname] = new clazz(this);
    },
    /**
     * Returns an instance of the given dispatcher class for this manager(window).
     *
     * @param clazz {Class} Any class which implements {@link qx.event.IEventHandler}
     * @return {Object} The instance used by this manager
     */
    getDispatcher : function(clazz){

      var dispatcher = this.__cB[clazz.classname];
      if(dispatcher){

        return dispatcher;
      };
      return this.__cB[clazz.classname] = new clazz(this, this.__cy);
    },
    /*
    ---------------------------------------------------------------------------
      EVENT LISTENER MANAGEMENT
    ---------------------------------------------------------------------------
    */
    /**
     * Get a copy of all event listeners for the given combination
     * of target, event type and phase.
     *
     * This method is especially useful and for event handlers to
     * to query the listeners registered in the manager.
     *
     * @param target {Object} Any valid event target
     * @param type {String} Event type
     * @param capture {Boolean ? false} Whether the listener is for the
     *       capturing phase of the bubbling phase.
     * @return {Array | null} Array of registered event handlers. May return
     *       null when no listener were found.
     */
    getListeners : function(target, type, capture){

      var targetKey = target.$$hash || qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__cz[targetKey];
      if(!targetMap){

        return null;
      };
      var entryKey = type + (capture ? "|capture" : "|bubble");
      var entryList = targetMap[entryKey];
      return entryList ? entryList.concat() : null;
    },
    /**
     * Returns all registered listeners.
     *
     * @internal
     *
     * @return {Map} All registered listeners. The key is the hash code form an object.
     */
    getAllListeners : function(){

      return this.__cz;
    },
    /**
     * Returns a serialized array of all events attached on the given target.
     *
     * @param target {Object} Any valid event target
     * @return {Map[]} Array of maps where everyone contains the keys:
     *   <code>handler</code>, <code>self</code>, <code>type</code> and <code>capture</code>.
     */
    serializeListeners : function(target){

      var targetKey = target.$$hash || qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__cz[targetKey];
      var result = [];
      if(targetMap){

        var indexOf,type,capture,entryList,entry;
        for(var entryKey in targetMap){

          indexOf = entryKey.indexOf("|");
          type = entryKey.substring(0, indexOf);
          capture = entryKey.charAt(indexOf + 1) == "c";
          entryList = targetMap[entryKey];
          for(var i = 0,l = entryList.length;i < l;i++){

            entry = entryList[i];
            result.push({
              self : entry.context,
              handler : entry.handler,
              type : type,
              capture : capture
            });
          };
        };
      };
      return result;
    },
    /**
     * This method might be used to temporally remove all events
     * directly attached to the given target. This do not work
     * have any effect on bubbling events normally.
     *
     * This is mainly thought for detaching events in IE, before
     * cloning them. It also removes all leak scenarios
     * when unloading a document and may be used here as well.
     *
     * @internal
     * @param target {Object} Any valid event target
     * @param enable {Boolean} Whether to enable or disable the events
     */
    toggleAttachedEvents : function(target, enable){

      var targetKey = target.$$hash || qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__cz[targetKey];
      if(targetMap){

        var indexOf,type,capture,entryList;
        for(var entryKey in targetMap){

          indexOf = entryKey.indexOf("|");
          type = entryKey.substring(0, indexOf);
          capture = entryKey.charCodeAt(indexOf + 1) === 99;
          // checking for character "c".
          entryList = targetMap[entryKey];
          if(enable){

            this.__cF(target, type, capture);
          } else {

            this.__cG(target, type, capture);
          };
        };
      };
    },
    /**
     * Check whether there are one or more listeners for an event type
     * registered at the target.
     *
     * @param target {Object} Any valid event target
     * @param type {String} The event type
     * @param capture {Boolean ? false} Whether to check for listeners of
     *         the bubbling or of the capturing phase.
     * @return {Boolean} Whether the target has event listeners of the given type.
     */
    hasListener : function(target, type, capture){

      if(qx.core.Environment.get("qx.debug")){

        if(target == null){

          qx.log.Logger.trace(this);
          throw new Error("Invalid object: " + target);
        };
      };
      var targetKey = target.$$hash || qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__cz[targetKey];
      if(!targetMap){

        return false;
      };
      var entryKey = type + (capture ? "|capture" : "|bubble");
      var entryList = targetMap[entryKey];
      return !!(entryList && entryList.length > 0);
    },
    /**
     * Imports a list of event listeners at once. This only
     * works for newly created elements as it replaces
     * all existing data structures.
     *
     * Works with a map of data. Each entry in this map should be a
     * map again with the keys <code>type</code>, <code>listener</code>,
     * <code>self</code>, <code>capture</code> and an optional <code>unique</code>.
     *
     * The values are identical to the parameters of {@link #addListener}.
     * For details please have a look there.
     *
     * @param target {Object} Any valid event target
     * @param list {Map} A map where every listener has an unique key.
     */
    importListeners : function(target, list){

      if(qx.core.Environment.get("qx.debug")){

        if(target == null){

          qx.log.Logger.trace(this);
          throw new Error("Invalid object: " + target);
        };
      };
      var targetKey = target.$$hash || qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__cz[targetKey] = {
      };
      var clazz = qx.event.Manager;
      for(var listKey in list){

        var item = list[listKey];
        var entryKey = item.type + (item.capture ? "|capture" : "|bubble");
        var entryList = targetMap[entryKey];
        if(!entryList){

          entryList = targetMap[entryKey] = [];
          // This is the first event listener for this type and target
          // Inform the event handler about the new event
          // they perform the event registration at DOM level if needed
          this.__cF(target, item.type, item.capture);
        };
        // Append listener to list
        entryList.push({
          handler : item.listener,
          context : item.self,
          unique : item.unique || (clazz.__cD++) + ""
        });
      };
    },
    /**
     * Add an event listener to any valid target. The event listener is passed an
     * instance of {@link qx.event.type.Event} containing all relevant information
     * about the event as parameter.
     *
     * @param target {Object} Any valid event target
     * @param type {String} Name of the event e.g. "click", "keydown", ...
     * @param listener {Function} Event listener function
     * @param self {Object ? null} Reference to the 'this' variable inside
     *         the event listener. When not given, the corresponding dispatcher
     *         usually falls back to a default, which is the target
     *         by convention. Note this is not a strict requirement, i.e.
     *         custom dispatchers can follow a different strategy.
     * @param capture {Boolean ? false} Whether to attach the event to the
     *         capturing phase or the bubbling phase of the event. The default is
     *         to attach the event handler to the bubbling phase.
     * @return {String} An opaque ID, which can be used to remove the event listener
     *         using the {@link #removeListenerById} method.
     * @throws {Error} if the parameters are wrong
     */
    addListener : function(target, type, listener, self, capture){

      if(qx.core.Environment.get("qx.debug")){

        var msg = "Failed to add event listener for type '" + type + "'" + " to the target '" + target.classname + "': ";
        qx.core.Assert.assertObject(target, msg + "Invalid Target.");
        qx.core.Assert.assertString(type, msg + "Invalid event type.");
        qx.core.Assert.assertFunction(listener, msg + "Invalid callback function");
        if(capture !== undefined){

          qx.core.Assert.assertBoolean(capture, "Invalid capture flag.");
        };
      };
      var targetKey = target.$$hash || qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__cz[targetKey];
      if(!targetMap){

        targetMap = this.__cz[targetKey] = {
        };
      };
      var entryKey = type + (capture ? "|capture" : "|bubble");
      var entryList = targetMap[entryKey];
      if(!entryList){

        entryList = targetMap[entryKey] = [];
      };
      // This is the first event listener for this type and target
      // Inform the event handler about the new event
      // they perform the event registration at DOM level if needed
      if(entryList.length === 0){

        this.__cF(target, type, capture);
      };
      // Append listener to list
      var unique = (qx.event.Manager.__cD++) + "";
      var entry = {
        handler : listener,
        context : self,
        unique : unique
      };
      entryList.push(entry);
      return entryKey + "|" + unique;
    },
    /**
     * Get the event handler class matching the given event target and type
     *
     * @param target {var} The event target
     * @param type {String} The event type
     * @return {qx.event.IEventHandler|null} The best matching event handler or
     *     <code>null</code>.
     */
    findHandler : function(target, type){

      var isDomNode = false,isWindow = false,isObject = false,isDocument = false;
      var key;
      if(target.nodeType === 1){

        isDomNode = true;
        key = "DOM_" + target.tagName.toLowerCase() + "_" + type;
      } else if(target.nodeType === 9){

        isDocument = true;
        key = "DOCUMENT_" + type;
      } else if(target == this.__cw){

        isWindow = true;
        key = "WIN_" + type;
      } else if(target.classname){

        isObject = true;
        key = "QX_" + target.classname + "_" + type;
      } else {

        key = "UNKNOWN_" + target + "_" + type;
      };;;
      var cache = this.__cC;
      if(cache[key]){

        return cache[key];
      };
      var classes = this.__cy.getHandlers();
      var IEventHandler = qx.event.IEventHandler;
      var clazz,instance,supportedTypes,targetCheck;
      for(var i = 0,l = classes.length;i < l;i++){

        clazz = classes[i];
        // shortcut type check
        supportedTypes = clazz.SUPPORTED_TYPES;
        if(supportedTypes && !supportedTypes[type]){

          continue;
        };
        // shortcut target check
        targetCheck = clazz.TARGET_CHECK;
        if(targetCheck){

          // use bitwise & to compare for the bitmask!
          var found = false;
          if(isDomNode && ((targetCheck & IEventHandler.TARGET_DOMNODE) != 0)){

            found = true;
          } else if(isWindow && ((targetCheck & IEventHandler.TARGET_WINDOW) != 0)){

            found = true;
          } else if(isObject && ((targetCheck & IEventHandler.TARGET_OBJECT) != 0)){

            found = true;
          } else if(isDocument && ((targetCheck & IEventHandler.TARGET_DOCUMENT) != 0)){

            found = true;
          };;;
          if(!found){

            continue;
          };
        };
        instance = this.getHandler(classes[i]);
        if(clazz.IGNORE_CAN_HANDLE || instance.canHandleEvent(target, type)){

          cache[key] = instance;
          return instance;
        };
      };
      return null;
    },
    /**
     * This method is called each time an event listener for one of the
     * supported events is added using {qx.event.Manager#addListener}.
     *
     * @param target {Object} Any valid event target
     * @param type {String} event type
     * @param capture {Boolean} Whether to attach the event to the
     *         capturing phase or the bubbling phase of the event.
     * @throws {Error} if there is no handler for the event
     */
    __cF : function(target, type, capture){

      var handler = this.findHandler(target, type);
      if(handler){

        handler.registerEvent(target, type, capture);
        return;
      };
      if(qx.core.Environment.get("qx.debug")){

        qx.log.Logger.warn(this, "There is no event handler for the event '" + type + "' on target '" + target + "'!");
      };
    },
    /**
     * Remove an event listener from an event target.
     *
     * @param target {Object} Any valid event target
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param self {Object ? null} Reference to the 'this' variable inside
     *         the event listener.
     * @param capture {Boolean ? false} Whether to remove the event listener of
     *         the bubbling or of the capturing phase.
     * @return {Boolean} Whether the event was removed successfully (was existend)
     * @throws {Error} if the parameters are wrong
     */
    removeListener : function(target, type, listener, self, capture){

      if(qx.core.Environment.get("qx.debug")){

        var msg = "Failed to remove event listener for type '" + type + "'" + " from the target '" + target.classname + "': ";
        qx.core.Assert.assertObject(target, msg + "Invalid Target.");
        qx.core.Assert.assertString(type, msg + "Invalid event type.");
        qx.core.Assert.assertFunction(listener, msg + "Invalid callback function");
        if(self !== undefined){

          qx.core.Assert.assertObject(self, "Invalid context for callback.");
        };
        if(capture !== undefined){

          qx.core.Assert.assertBoolean(capture, "Invalid capture flag.");
        };
      };
      var targetKey = target.$$hash || qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__cz[targetKey];
      if(!targetMap){

        return false;
      };
      var entryKey = type + (capture ? "|capture" : "|bubble");
      var entryList = targetMap[entryKey];
      if(!entryList){

        return false;
      };
      var entry;
      for(var i = 0,l = entryList.length;i < l;i++){

        entry = entryList[i];
        if(entry.handler === listener && entry.context === self){

          qx.lang.Array.removeAt(entryList, i);
          if(entryList.length == 0){

            this.__cG(target, type, capture);
          };
          return true;
        };
      };
      return false;
    },
    /**
     * Removes an event listener from an event target by an ID returned by
     * {@link #addListener}.
     *
     * @param target {Object} The event target
     * @param id {String} The ID returned by {@link #addListener}
     * @return {Boolean} <code>true</code> if the handler was removed
     */
    removeListenerById : function(target, id){

      if(qx.core.Environment.get("qx.debug")){

        var msg = "Failed to remove event listener for id '" + id + "'" + " from the target '" + target.classname + "': ";
        qx.core.Assert.assertObject(target, msg + "Invalid Target.");
        qx.core.Assert.assertString(id, msg + "Invalid id type.");
      };
      var split = id.split("|");
      var type = split[0];
      var capture = split[1].charCodeAt(0) == 99;
      // detect leading "c"
      var unique = split[2];
      var targetKey = target.$$hash || qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__cz[targetKey];
      if(!targetMap){

        return false;
      };
      var entryKey = type + (capture ? "|capture" : "|bubble");
      var entryList = targetMap[entryKey];
      if(!entryList){

        return false;
      };
      var entry;
      for(var i = 0,l = entryList.length;i < l;i++){

        entry = entryList[i];
        if(entry.unique === unique){

          qx.lang.Array.removeAt(entryList, i);
          if(entryList.length == 0){

            this.__cG(target, type, capture);
          };
          return true;
        };
      };
      return false;
    },
    /**
     * Remove all event listeners, which are attached to the given event target.
     *
     * @param target {Object} The event target to remove all event listeners from.
     * @return {Boolean} Whether the events were existend and were removed successfully.
     */
    removeAllListeners : function(target){

      var targetKey = target.$$hash || qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__cz[targetKey];
      if(!targetMap){

        return false;
      };
      // Deregister from event handlers
      var split,type,capture;
      for(var entryKey in targetMap){

        if(targetMap[entryKey].length > 0){

          // This is quite expensive, see bug #1283
          split = entryKey.split("|");
          type = split[0];
          capture = split[1] === "capture";
          this.__cG(target, type, capture);
        };
      };
      delete this.__cz[targetKey];
      return true;
    },
    /**
     * Internal helper for deleting the internal listener  data structure for
     * the given targetKey.
     *
     * @param targetKey {String} Hash code for the object to delete its
     *   listeners.
     *
     * @internal
     */
    deleteAllListeners : function(targetKey){

      delete this.__cz[targetKey];
    },
    /**
     * This method is called each time the an event listener for one of the
     * supported events is removed by using {qx.event.Manager#removeListener}
     * and no other event listener is listening on this type.
     *
     * @param target {Object} Any valid event target
     * @param type {String} event type
     * @param capture {Boolean} Whether to attach the event to the
     *         capturing phase or the bubbling phase of the event.
     * @throws {Error} if there is no handler for the event
     */
    __cG : function(target, type, capture){

      var handler = this.findHandler(target, type);
      if(handler){

        handler.unregisterEvent(target, type, capture);
        return;
      };
      if(qx.core.Environment.get("qx.debug")){

        qx.log.Logger.warn(this, "There is no event handler for the event '" + type + "' on target '" + target + "'!");
      };
    },
    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCH
    ---------------------------------------------------------------------------
    */
    /**
     * Dispatches an event object using the qooxdoo event handler system. The
     * event will only be visible in event listeners attached using
     * {@link #addListener}. After dispatching the event object will be pooled
     * for later reuse or disposed.
     *
     * @param target {Object} Any valid event target
     * @param event {qx.event.type.Event} The event object to dispatch. The event
     *     object must be obtained using {@link qx.event.Registration#createEvent}
     *     and initialized using {@link qx.event.type.Event#init}.
     * @return {Boolean} whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     * @throws {Error} if there is no dispatcher for the event
     */
    dispatchEvent : function(target, event){

      if(qx.core.Environment.get("qx.debug")){

        var msg = "Could not dispatch event '" + event + "' on target '" + target.classname + "': ";
        qx.core.Assert.assertNotUndefined(target, msg + "Invalid event target.");
        qx.core.Assert.assertNotNull(target, msg + "Invalid event target.");
        qx.core.Assert.assertInstance(event, qx.event.type.Event, msg + "Invalid event object.");
      };
      // Preparations
      var type = event.getType();
      if(!event.getBubbles() && !this.hasListener(target, type)){

        qx.event.Pool.getInstance().poolObject(event);
        return true;
      };
      if(!event.getTarget()){

        event.setTarget(target);
      };
      // Interation data
      var classes = this.__cy.getDispatchers();
      var instance;
      // Loop through the dispatchers
      var dispatched = false;
      for(var i = 0,l = classes.length;i < l;i++){

        instance = this.getDispatcher(classes[i]);
        // Ask if the dispatcher can handle this event
        if(instance.canDispatchEvent(target, event, type)){

          instance.dispatchEvent(target, event, type);
          dispatched = true;
          break;
        };
      };
      if(!dispatched){

        if(qx.core.Environment.get("qx.debug")){

          qx.log.Logger.error(this, "No dispatcher can handle event of type " + type + " on " + target);
        };
        return true;
      };
      // check whether "preventDefault" has been called
      var preventDefault = event.getDefaultPrevented();
      // Release the event instance to the event pool
      qx.event.Pool.getInstance().poolObject(event);
      return !preventDefault;
    },
    /**
     * Dispose the event manager
     */
    dispose : function(){

      // Remove from manager list
      this.__cy.removeManager(this);
      qx.util.DisposeUtil.disposeMap(this, "__cA");
      qx.util.DisposeUtil.disposeMap(this, "__cB");
      // Dispose data fields
      this.__cz = this.__cw = this.__cE = null;
      this.__cy = this.__cC = null;
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */
/**
 * Event handler Interface.
 *
 * All custom event handler like mouse or keyboard event handler must implement
 * this interface.
 */
qx.Interface.define("qx.event.IEventHandler", {
  statics : {
    /** @type {Integer} The event target must be a dom node */
    TARGET_DOMNODE : 1,
    /** @type {Integer} The event target must be a window object */
    TARGET_WINDOW : 2,
    /** @type {Integer} The event target must be a qooxdoo object */
    TARGET_OBJECT : 4,
    /** @type {Integer} The event target must be a document node */
    TARGET_DOCUMENT : 8
  },
  members : {
    /**
     * Whether the event handler can handle events of the given type. If the
     * event handler class has a static variable called <code>IGNORE_CAN_HANDLE</code>
     * with the value <code>true</code> this function is not called. Whether the
     * handler can handle the event is them only determined by the static variables
     * <code>SUPPORTED_TYPES</code> and <code>TARGET_CHECK</code>.
     *
     * @param target {var} The target to, which the event handler should
     *     be attached
     * @param type {String} event type
     * @return {Boolean} Whether the event handler can handle events of the
     *     given type.
     */
    canHandleEvent : function(target, type){
    },
    /**
     * This method is called each time an event listener, for one of the
     * supported events, is added using {@link qx.event.Manager#addListener}.
     *
     * @param target {var} The target to, which the event handler should
     *     be attached
     * @param type {String} event type
     * @param capture {Boolean} Whether to attach the event to the
     *         capturing phase or the bubbling phase of the event.
     */
    registerEvent : function(target, type, capture){
    },
    /**
     * This method is called each time an event listener, for one of the
     * supported events, is removed by using {@link qx.event.Manager#removeListener}
     * and no other event listener is listening on this type.
     *
     * @param target {var} The target from, which the event handler should
     *     be removed
     * @param type {String} event type
     * @param capture {Boolean} Whether to attach the event to the
     *         capturing phase or the bubbling phase of the event.
     */
    unregisterEvent : function(target, type, capture){
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)

************************************************************************ */
/**
 * Wrapper for browser generic event handling.
 *
 * Supported events differ from target to target. Generally the handlers
 * in {@link qx.event.handler} defines the available features.
 *
 * @require(qx.event.Manager)
 * @require(qx.dom.Node)
 * @require(qx.lang.Function)
 */
qx.Class.define("qx.event.Registration", {
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  statics : {
    /**
     * Static list of all instantiated event managers. The key is the qooxdoo
     * hash value of the corresponding window
     */
    __cH : {
    },
    /**
     * Get an instance of the event manager, which can handle events for the
     * given target.
     *
     * @param target {Object} Any valid event target
     * @return {qx.event.Manager} The event manger for the target.
     */
    getManager : function(target){

      if(target == null){

        if(qx.core.Environment.get("qx.debug")){

          qx.log.Logger.error("qx.event.Registration.getManager(null) was called!");
          qx.log.Logger.trace(this);
        };
        target = window;
      } else if(target.nodeType){

        target = qx.dom.Node.getWindow(target);
      } else if(!qx.dom.Node.isWindow(target)){

        target = window;
      };;
      var hash = target.$$hash || qx.core.ObjectRegistry.toHashCode(target);
      var manager = this.__cH[hash];
      if(!manager){

        manager = new qx.event.Manager(target, this);
        this.__cH[hash] = manager;
      };
      return manager;
    },
    /**
     * Removes a manager for a specific window from the list.
     *
     * Normally only used when the manager gets disposed through
     * an unload event of the attached window.
     *
     * @param mgr {qx.event.Manager} The manager to remove
     */
    removeManager : function(mgr){

      var id = mgr.getWindowId();
      delete this.__cH[id];
    },
    /**
     * Add an event listener to a DOM target. The event listener is passed an
     * instance of {@link qx.event.type.Event} containing all relevant information
     * about the event as parameter.
     *
     * @param target {Object} Any valid event target
     * @param type {String} Name of the event e.g. "click", "keydown", ...
     * @param listener {Function} Event listener function
     * @param self {Object ? null} Reference to the 'this' variable inside
     *         the event listener. When not given, the corresponding dispatcher
     *         usually falls back to a default, which is the target
     *         by convention. Note this is not a strict requirement, i.e.
     *         custom dispatchers can follow a different strategy.
     * @param capture {Boolean} Whether to attach the event to the
     *         capturing phase or the bubbling phase of the event. The default is
     *         to attach the event handler to the bubbling phase.
     * @return {var} An opaque id, which can be used to remove the event listener
     *         using the {@link #removeListenerById} method.
     */
    addListener : function(target, type, listener, self, capture){

      return this.getManager(target).addListener(target, type, listener, self, capture);
    },
    /**
     * Remove an event listener from an event target.
     *
     * Note: All registered event listeners will automatically at page unload
     *   so it is not necessary to detach events in the destructor.
     *
     * @param target {Object} The event target
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param self {Object ? null} Reference to the 'this' variable inside
     *         the event listener.
     * @param capture {Boolean} Whether to remove the event listener of
     *    the bubbling or of the capturing phase.
     * @return {Boolean} Whether the event was removed. Return <code>false</code> if
     *    the event was already removed before.
     */
    removeListener : function(target, type, listener, self, capture){

      return this.getManager(target).removeListener(target, type, listener, self, capture);
    },
    /**
     * Removes an event listener from an event target by an id returned by
     * {@link #addListener}
     *
     * @param target {Object} The event target
     * @param id {var} The id returned by {@link #addListener}
     * @return {Boolean} Whether the event was removed. Return <code>false</code> if
     *    the event was already removed before.
     */
    removeListenerById : function(target, id){

      return this.getManager(target).removeListenerById(target, id);
    },
    /**
     * Remove all event listeners, which are attached to the given event target.
     *
     * @param target {Object} The event target to remove all event listeners from.
     * @return {Boolean} Whether the events were existend and were removed successfully.
     */
    removeAllListeners : function(target){

      return this.getManager(target).removeAllListeners(target);
    },
    /**
     * Internal helper for deleting the listeners map used during shutdown.
     *
     * @param target {Object} The event target to delete the internal map for
     *    all event listeners.
     *
     * @internal
     */
    deleteAllListeners : function(target){

      var targetKey = target.$$hash;
      if(targetKey){

        this.getManager(target).deleteAllListeners(targetKey);
      };
    },
    /**
     * Check whether there are one or more listeners for an event type
     * registered at the target.
     *
     * @param target {Object} Any valid event target
     * @param type {String} The event type
     * @param capture {Boolean ? false} Whether to check for listeners of
     *         the bubbling or of the capturing phase.
     * @return {Boolean} Whether the target has event listeners of the given type.
     */
    hasListener : function(target, type, capture){

      return this.getManager(target).hasListener(target, type, capture);
    },
    /**
     * Returns a serialized array of all events attached on the given target.
     *
     * @param target {Object} Any valid event target
     * @return {Map[]} Array of maps where everyone contains the keys:
     *   <code>handler</code>, <code>self</code>, <code>type</code> and <code>capture</code>.
     */
    serializeListeners : function(target){

      return this.getManager(target).serializeListeners(target);
    },
    /**
     * Get an event instance of the given class, which can be dispatched using
     * an event manager. The created events must be initialized using
     * {@link qx.event.type.Event#init}.
     *
     * @param type {String} The type of the event to create
     * @param clazz {Object?qx.event.type.Event} The event class to use
     * @param args {Array?null} Array which will be passed to
     *       the event's init method.
     * @return {qx.event.type.Event} An instance of the given class.
     */
    createEvent : function(type, clazz, args){

      if(qx.core.Environment.get("qx.debug")){

        if(arguments.length > 1 && clazz === undefined){

          throw new Error("Create event of type " + type + " with undefined class. Please use null to explicit fallback to default event type!");
        };
      };
      // Fallback to default
      if(clazz == null){

        clazz = qx.event.type.Event;
      };
      var obj = qx.event.Pool.getInstance().getObject(clazz);
      // Initialize with given arguments
      args ? obj.init.apply(obj, args) : obj.init();
      // Setup the type
      // Note: Native event may setup this later or using init() above
      // using the native information.
      if(type){

        obj.setType(type);
      };
      return obj;
    },
    /**
     * Dispatch an event object on the given target.
     *
     * It is normally better to use {@link #fireEvent} because it uses
     * the event pooling and is quite handy otherwise as well. After dispatching
     * the event object will be pooled for later reuse or disposed.
     *
     * @param target {Object} Any valid event target
     * @param event {qx.event.type.Event} The event object to dispatch. The event
     *       object must be obtained using {@link #createEvent} and initialized
     *       using {@link qx.event.type.Event#init}.
     * @return {Boolean} whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     */
    dispatchEvent : function(target, event){

      return this.getManager(target).dispatchEvent(target, event);
    },
    /**
     * Create an event object and dispatch it on the given target.
     *
     * @param target {Object} Any valid event target
     * @param type {String} Event type to fire
     * @param clazz {Class?qx.event.type.Event} The event class
     * @param args {Array?null} Arguments, which will be passed to
     *       the event's init method.
     * @return {Boolean} whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     * @see #createEvent
     */
    fireEvent : function(target, type, clazz, args){

      if(qx.core.Environment.get("qx.debug")){

        if(arguments.length > 2 && clazz === undefined && args !== undefined){

          throw new Error("Create event of type " + type + " with undefined class. Please use null to explicit fallback to default event type!");
        };
        var msg = "Could not fire event '" + type + "' on target '" + (target ? target.classname : "undefined") + "': ";
        qx.core.Assert.assertNotUndefined(target, msg + "Invalid event target.");
        qx.core.Assert.assertNotNull(target, msg + "Invalid event target.");
      };
      var evt = this.createEvent(type, clazz || null, args);
      return this.getManager(target).dispatchEvent(target, evt);
    },
    /**
     * Create an event object and dispatch it on the given target.
     * The event dispatched with this method does never bubble! Use only if you
     * are sure that bubbling is not required.
     *
     * @param target {Object} Any valid event target
     * @param type {String} Event type to fire
     * @param clazz {Class?qx.event.type.Event} The event class
     * @param args {Array?null} Arguments, which will be passed to
     *       the event's init method.
     * @return {Boolean} whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     * @see #createEvent
     */
    fireNonBubblingEvent : function(target, type, clazz, args){

      if(qx.core.Environment.get("qx.debug")){

        if(arguments.length > 2 && clazz === undefined && args !== undefined){

          throw new Error("Create event of type " + type + " with undefined class. Please use null to explicit fallback to default event type!");
        };
      };
      var mgr = this.getManager(target);
      if(!mgr.hasListener(target, type, false)){

        return true;
      };
      var evt = this.createEvent(type, clazz || null, args);
      return mgr.dispatchEvent(target, evt);
    },
    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER/DISPATCHER PRIORITY
    ---------------------------------------------------------------------------
    */
    /** @type {Integer} Highest priority. Used by handlers and dispatchers. */
    PRIORITY_FIRST : -32000,
    /** @type {Integer} Default priority. Used by handlers and dispatchers. */
    PRIORITY_NORMAL : 0,
    /** @type {Integer} Lowest priority. Used by handlers and dispatchers. */
    PRIORITY_LAST : 32000,
    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER REGISTRATION
    ---------------------------------------------------------------------------
    */
    /** @type {Array} Contains all known event handlers */
    __cA : [],
    /**
     * Register an event handler.
     *
     * @param handler {qx.event.IEventHandler} Event handler to add
     * @throws {Error} if the handler does not have the IEventHandler interface.
     */
    addHandler : function(handler){

      if(qx.core.Environment.get("qx.debug")){

        qx.core.Assert.assertInterface(handler, qx.event.IEventHandler, "Invalid event handler.");
      };
      // Append to list
      this.__cA.push(handler);
      // Re-sort list
      this.__cA.sort(function(a, b){

        return a.PRIORITY - b.PRIORITY;
      });
    },
    /**
     * Get a list of registered event handlers.
     *
     * @return {qx.event.IEventHandler[]} registered event handlers
     */
    getHandlers : function(){

      return this.__cA;
    },
    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCHER REGISTRATION
    ---------------------------------------------------------------------------
    */
    /** @type {Array} Contains all known event dispatchers */
    __cB : [],
    /**
     * Register an event dispatcher.
     *
     * @param dispatcher {qx.event.IEventDispatcher} Event dispatcher to add
     * @param priority {Integer} One of
     * {@link qx.event.Registration#PRIORITY_FIRST},
     * {@link qx.event.Registration#PRIORITY_NORMAL}
     *       or {@link qx.event.Registration#PRIORITY_LAST}.
     * @throws {Error} if the dispatcher does not have the IEventHandler interface.
     */
    addDispatcher : function(dispatcher, priority){

      if(qx.core.Environment.get("qx.debug")){

        qx.core.Assert.assertInterface(dispatcher, qx.event.IEventDispatcher, "Invalid event dispatcher!");
      };
      // Append to list
      this.__cB.push(dispatcher);
      // Re-sort list
      this.__cB.sort(function(a, b){

        return a.PRIORITY - b.PRIORITY;
      });
    },
    /**
     * Get a list of registered event dispatchers.
     *
     * @return {qx.event.IEventDispatcher[]} all registered event dispatcher
     */
    getDispatchers : function(){

      return this.__cB;
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * This mixin offers basic event handling capabilities. It includes the
 * commonly known methods for managing event listeners and firing events.
 *
 * @use(qx.event.dispatch.Direct)
 * @use(qx.event.handler.Object)
 */
qx.Mixin.define("qx.core.MEvent", {
  members : {
    /** @type {Class} Pointer to the regular event registration class */
    __cI : qx.event.Registration,
    /**
     * Add event listener to this object.
     *
     * @param type {String} name of the event type
     * @param listener {Function} event callback function
     * @param self {Object ? null} Reference to the 'this' variable inside
     *         the event listener. When not given, the corresponding dispatcher
     *         usually falls back to a default, which is the target
     *         by convention. Note this is not a strict requirement, i.e.
     *         custom dispatchers can follow a different strategy.
     * @param capture {Boolean ? false} Whether to attach the event to the
     *         capturing phase or the bubbling phase of the event. The default is
     *         to attach the event handler to the bubbling phase.
     * @return {String} An opaque id, which can be used to remove the event listener
     *         using the {@link #removeListenerById} method.
     */
    addListener : function(type, listener, self, capture){

      if(!this.$$disposed){

        return this.__cI.addListener(this, type, listener, self, capture);
      };
      return null;
    },
    /**
     * Add event listener to this object, which is only called once. After the
     * listener is called the event listener gets removed.
     *
     * @param type {String} name of the event type
     * @param listener {Function} event callback function
     * @param self {Object ? window} reference to the 'this' variable inside the callback
     * @param capture {Boolean ? false} Whether to attach the event to the
     *         capturing phase or the bubbling phase of the event. The default is
     *         to attach the event handler to the bubbling phase.
     * @return {String} An opaque id, which can be used to remove the event listener
     *         using the {@link #removeListenerById} method.
     */
    addListenerOnce : function(type, listener, self, capture){

      var callback = function(e){

        this.removeListener(type, listener, this, capture);
        listener.call(self || this, e);
      };
      listener.$$wrapped_callback = callback;
      return this.addListener(type, callback, this, capture);
    },
    /**
     * Remove event listener from this object
     *
     * @param type {String} name of the event type
     * @param listener {Function} event callback function
     * @param self {Object ? null} reference to the 'this' variable inside the callback
     * @param capture {Boolean} Whether to remove the event listener of
     *   the bubbling or of the capturing phase.
     * @return {Boolean} Whether the event was removed successfully (has existed)
     */
    removeListener : function(type, listener, self, capture){

      if(!this.$$disposed){

        // special handling for wrapped once listener
        if(listener.$$wrapped_callback){

          var callback = listener.$$wrapped_callback;
          delete listener.$$wrapped_callback;
          listener = callback;
        };
        return this.__cI.removeListener(this, type, listener, self, capture);
      };
      return false;
    },
    /**
     * Removes an event listener from an event target by an id returned by
     * {@link #addListener}
     *
     * @param id {String} The id returned by {@link #addListener}
     * @return {Boolean} Whether the event was removed successfully (has existed)
     */
    removeListenerById : function(id){

      if(!this.$$disposed){

        return this.__cI.removeListenerById(this, id);
      };
      return false;
    },
    /**
     * Check if there are one or more listeners for an event type.
     *
     * @param type {String} name of the event type
     * @param capture {Boolean ? false} Whether to check for listeners of
     *         the bubbling or of the capturing phase.
     * @return {Boolean} Whether the object has a listener of the given type.
     */
    hasListener : function(type, capture){

      return this.__cI.hasListener(this, type, capture);
    },
    /**
     * Dispatch an event on this object
     *
     * @param evt {qx.event.type.Event} event to dispatch
     * @return {Boolean} Whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     */
    dispatchEvent : function(evt){

      if(!this.$$disposed){

        return this.__cI.dispatchEvent(this, evt);
      };
      return true;
    },
    /**
     * Creates and dispatches an event on this object.
     *
     * @param type {String} Event type to fire
     * @param clazz {Class?qx.event.type.Event} The event class
     * @param args {Array?null} Arguments, which will be passed to
     *       the event's init method.
     * @return {Boolean} Whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     */
    fireEvent : function(type, clazz, args){

      if(!this.$$disposed){

        return this.__cI.fireEvent(this, type, clazz, args);
      };
      return true;
    },
    /**
     * Create an event object and dispatch it on this object.
     * The event dispatched with this method does never bubble! Use only if you
     * are sure that bubbling is not required.
     *
     * @param type {String} Event type to fire
     * @param clazz {Class?qx.event.type.Event} The event class
     * @param args {Array?null} Arguments, which will be passed to
     *       the event's init method.
     * @return {Boolean} Whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     */
    fireNonBubblingEvent : function(type, clazz, args){

      if(!this.$$disposed){

        return this.__cI.fireNonBubblingEvent(this, type, clazz, args);
      };
      return true;
    },
    /**
     * Creates and dispatches an non-bubbling data event on this object.
     *
     * @param type {String} Event type to fire
     * @param data {var} User defined data attached to the event object
     * @param oldData {var?null} The event's old data (optional)
     * @param cancelable {Boolean?false} Whether or not an event can have its default
     *     action prevented. The default action can either be the browser's
     *     default action of a native event (e.g. open the context menu on a
     *     right click) or the default action of a qooxdoo class (e.g. close
     *     the window widget). The default action can be prevented by calling
     *     {@link qx.event.type.Event#preventDefault}
     * @return {Boolean} Whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     */
    fireDataEvent : function(type, data, oldData, cancelable){

      if(!this.$$disposed){

        if(oldData === undefined){

          oldData = null;
        };
        return this.__cI.fireNonBubblingEvent(this, type, qx.event.type.Data, [data, oldData, !!cancelable]);
      };
      return true;
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * This mixin offers the bacis property features which include generic
 * setter, getter and resetter.
 */
qx.Mixin.define("qx.core.MProperty", {
  members : {
    /**
     * Sets multiple properties at once by using a property list or
     * sets one property and its value by the first and second argument.
     * As a fallback, if no generated property setter could be found, a
     * handwritten setter will be searched and invoked if available.
     *
     * @param data {Map | String} a map of property values. The key is the name of the property.
     * @param value {var?} the value, only used when <code>data</code> is a string.
     * @return {Object} this instance.
     * @throws {Error} if a property defined does not exist
     */
    set : function(data, value){

      var setter = qx.core.Property.$$method.set;
      if(qx.Bootstrap.isString(data)){

        if(!this[setter[data]]){

          if(this["set" + qx.Bootstrap.firstUp(data)] != undefined){

            this["set" + qx.Bootstrap.firstUp(data)](value);
            return this;
          };
          throw new Error("No such property: " + data);
        };
        return this[setter[data]](value);
      } else {

        for(var prop in data){

          if(!this[setter[prop]]){

            if(this["set" + qx.Bootstrap.firstUp(prop)] != undefined){

              this["set" + qx.Bootstrap.firstUp(prop)](data[prop]);
              continue;
            };
            throw new Error("No such property: " + prop);
          };
          this[setter[prop]](data[prop]);
        };
        return this;
      };
    },
    /**
     * Returns the value of the given property. If no generated getter could be
     * found, a fallback tries to access a handwritten getter.
     *
     * @param prop {String} Name of the property.
     * @return {var} The value of the value
     * @throws {Error} if a property defined does not exist
     */
    get : function(prop){

      var getter = qx.core.Property.$$method.get;
      if(!this[getter[prop]]){

        if(this["get" + qx.Bootstrap.firstUp(prop)] != undefined){

          return this["get" + qx.Bootstrap.firstUp(prop)]();
        };
        throw new Error("No such property: " + prop);
      };
      return this[getter[prop]]();
    },
    /**
     * Resets the value of the given property. If no generated resetter could be
     * found, a handwritten resetter will be invoked, if available.
     *
     * @param prop {String} Name of the property.
     * @throws {Error} if a property defined does not exist
     */
    reset : function(prop){

      var resetter = qx.core.Property.$$method.reset;
      if(!this[resetter[prop]]){

        if(this["reset" + qx.Bootstrap.firstUp(prop)] != undefined){

          this["reset" + qx.Bootstrap.firstUp(prop)]();
          return;
        };
        throw new Error("No such property: " + prop);
      };
      this[resetter[prop]]();
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */
/**
 * This mixin includes all assertions from {@link qx.core.Assert} to conveniently
 * call assertions. It is included into {@link qx.core.Object} if debugging code
 * is enabled. It is further included into all unit tests
 * {@link qx.dev.unit.TestCase}.
 *
 * @require(qx.core.Assert)
 */
qx.Mixin.define("qx.core.MAssert", {
  members : {
    /**
     * Assert that the condition evaluates to <code>true</code>.
     *
     * @param condition {var} Condition to check for. Must evaluate to
     *    <code>true</code>.
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assert : function(condition, msg){

      qx.core.Assert.assert(condition, msg);
    },
    /**
     * Raise an {@link AssertionError}
     *
     * @param msg {String} Message to be shown if the assertion fails.
     * @param compact {Boolean} Show less verbose message. Default: false.
     */
    fail : function(msg, compact){

      qx.core.Assert.fail(msg, compact);
    },
    /**
     * Assert that the value is <code>true</code> (Identity check).
     *
     * @param value {Boolean} Condition to check for. Must be identical to
     *    <code>true</code>.
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertTrue : function(value, msg){

      qx.core.Assert.assertTrue(value, msg);
    },
    /**
     * Assert that the value is <code>false</code> (Identity check).
     *
     * @param value {Boolean} Condition to check for. Must be identical to
     *    <code>false</code>.
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertFalse : function(value, msg){

      qx.core.Assert.assertFalse(value, msg);
    },
    /**
     * Assert that both values are equal. (Uses the equality operator
     * <code>==</code>.)
     *
     * @param expected {var} Reference value
     * @param found {var} found value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertEquals : function(expected, found, msg){

      qx.core.Assert.assertEquals(expected, found, msg);
    },
    /**
     * Assert that both values are not equal. (Uses the not equality operator
     * <code>!=</code>.)
     *
     * @param expected {var} Reference value
     * @param found {var} found value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNotEquals : function(expected, found, msg){

      qx.core.Assert.assertNotEquals(expected, found, msg);
    },
    /**
     * Assert that both values are identical. (Uses the identity operator
     * <code>===</code>.)
     *
     * @param expected {var} Reference value
     * @param found {var} found value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertIdentical : function(expected, found, msg){

      qx.core.Assert.assertIdentical(expected, found, msg);
    },
    /**
     * Assert that both values are not identical. (Uses the not identity operator
     * <code>!==</code>.)
     *
     * @param expected {var} Reference value
     * @param found {var} found value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNotIdentical : function(expected, found, msg){

      qx.core.Assert.assertNotIdentical(expected, found, msg);
    },
    /**
     * Assert that the value is not <code>undefined</code>.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNotUndefined : function(value, msg){

      qx.core.Assert.assertNotUndefined(value, msg);
    },
    /**
     * Assert that the value is <code>undefined</code>.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertUndefined : function(value, msg){

      qx.core.Assert.assertUndefined(value, msg);
    },
    /**
     * Assert that the value is not <code>null</code>.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNotNull : function(value, msg){

      qx.core.Assert.assertNotNull(value, msg);
    },
    /**
     * Assert that the value is <code>null</code>.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNull : function(value, msg){

      qx.core.Assert.assertNull(value, msg);
    },
    /**
     * Assert that the first two arguments are equal, when serialized into
     * JSON.
     *
     * @param expected {var} The expected value
     * @param found {var} The found value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertJsonEquals : function(expected, found, msg){

      qx.core.Assert.assertJsonEquals(expected, found, msg);
    },
    /**
     * Assert that the given string matches the regular expression
     *
     * @param str {String} String, which should match the regular expression
     * @param re {RegExp} Regular expression to match
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertMatch : function(str, re, msg){

      qx.core.Assert.assertMatch(str, re, msg);
    },
    /**
     * Assert that the number of arguments is within the given range
     *
     * @param args {arguments} The <code>arguments<code> variable of a function
     * @param minCount {Integer} Minimal number of arguments
     * @param maxCount {Integer} Maximum number of arguments
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertArgumentsCount : function(args, minCount, maxCount, msg){

      qx.core.Assert.assertArgumentsCount(args, minCount, maxCount, msg);
    },
    /**
     * Assert that an event is fired.
     *
     * @param obj {Object} The object on which the event should be fired.
     * @param event {String} The event which should be fired.
     * @param invokeFunc {Function} The function which will be invoked and which
     *   fires the event.
     * @param listener {Function?null} The function which will be invoked in the
     *   listener. The function has one parameter called e which is the event.
     * @param msg {String?""} Message to be shows if the assertion fails.
     */
    assertEventFired : function(obj, event, invokeFunc, listener, msg){

      qx.core.Assert.assertEventFired(obj, event, invokeFunc, listener, msg);
    },
    /**
     * Assert that an event is not fired.
     *
     * @param obj {Object} The object on which the event should be fired.
     * @param event {String} The event which should be fired.
     * @param invokeFunc {Function} The function which will be invoked and which
     *   should not fire the event.
     * @param msg {String} Message to be shows if the assertion fails.
     */
    assertEventNotFired : function(obj, event, invokeFunc, msg){

      qx.core.Assert.assertEventNotFired(obj, event, invokeFunc, msg);
    },
    /**
     * Asserts that the callback raises a matching exception.
     *
     * @param callback {Function} function to check
     * @param exception {Error?Error} Expected constructor of the exception.
     *   The assertion fails if the raised exception is not an instance of the
     *   parameter.
     * @param re {String|RegExp} The assertion fails if the error message does
     *   not match this parameter
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertException : function(callback, exception, re, msg){

      qx.core.Assert.assertException(callback, exception, re, msg);
    },
    /**
     * Assert that the value is an item in the given array.
     *
     * @param value {var} Value to check
     * @param array {Array} List of valid values
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertInArray : function(value, array, msg){

      qx.core.Assert.assertInArray(value, array, msg);
    },
    /**
     * Assert that both array have identical array items.
     *
     * @param expected {Array} The expected array
     * @param found {Array} The found array
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertArrayEquals : function(expected, found, msg){

      qx.core.Assert.assertArrayEquals(expected, found, msg);
    },
    /**
     * Assert that the value is a key in the given map.
     *
     * @param value {var} Value to check
     * @param map {Map} Map, where the keys represent the valid values
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertKeyInMap : function(value, map, msg){

      qx.core.Assert.assertKeyInMap(value, map, msg);
    },
    /**
     * Assert that the value is a function.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertFunction : function(value, msg){

      qx.core.Assert.assertFunction(value, msg);
    },
    /**
     * Assert that the value is a string.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertString : function(value, msg){

      qx.core.Assert.assertString(value, msg);
    },
    /**
     * Assert that the value is a boolean.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertBoolean : function(value, msg){

      qx.core.Assert.assertBoolean(value, msg);
    },
    /**
     * Assert that the value is a number.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNumber : function(value, msg){

      qx.core.Assert.assertNumber(value, msg);
    },
    /**
     * Assert that the value is a number >= 0.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertPositiveNumber : function(value, msg){

      qx.core.Assert.assertPositiveNumber(value, msg);
    },
    /**
     * Assert that the value is an integer.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertInteger : function(value, msg){

      qx.core.Assert.assertInteger(value, msg);
    },
    /**
     * Assert that the value is an integer >= 0.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertPositiveInteger : function(value, msg){

      qx.core.Assert.assertPositiveInteger(value, msg);
    },
    /**
     * Assert that the value is inside the given range.
     *
     * @param value {var} Value to check
     * @param min {Number} lower bound
     * @param max {Number} upper bound
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertInRange : function(value, min, max, msg){

      qx.core.Assert.assertInRange(value, min, max, msg);
    },
    /**
     * Assert that the value is an object.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertObject : function(value, msg){

      qx.core.Assert.assertObject(value, msg);
    },
    /**
     * Assert that the value is an array.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertArray : function(value, msg){

      qx.core.Assert.assertArray(value, msg);
    },
    /**
     * Assert that the value is a map either created using <code>new Object</code>
     * or by using the object literal notation <code>{ ... }</code>.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertMap : function(value, msg){

      qx.core.Assert.assertMap(value, msg);
    },
    /**
     * Assert that the value is a regular expression.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertRegExp : function(value, msg){

      qx.core.Assert.assertRegExp(value, msg);
    },
    /**
     * Assert that the value has the given type using the <code>typeof</code>
     * operator. Because the type is not always what it is supposed to be it is
     * better to use more explicit checks like {@link #assertString} or
     * {@link #assertArray}.
     *
     * @param value {var} Value to check
     * @param type {String} expected type of the value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertType : function(value, type, msg){

      qx.core.Assert.assertType(value, type, msg);
    },
    /**
     * Assert that the value is an instance of the given class.
     *
     * @param value {var} Value to check
     * @param clazz {Class} The value must be an instance of this class
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertInstance : function(value, clazz, msg){

      qx.core.Assert.assertInstance(value, clazz, msg);
    },
    /**
     * Assert that the value implements the given interface.
     *
     * @param value {var} Value to check
     * @param iface {Class} The value must implement this interface
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertInterface : function(value, iface, msg){

      qx.core.Assert.assertInterface(value, iface, msg);
    },
    /**
     * Assert that the value represents the given CSS color value. This method
     * parses the color strings and compares the RGB values. It is able to
     * parse values supported by {@link qx.util.ColorUtil#stringToRgb}.
     *
     *  @param expected {String} The expected color
     *  @param value {String} The value to check
     *  @param msg {String} Message to be shown if the assertion fails.
     */
    assertCssColor : function(expected, value, msg){

      qx.core.Assert.assertCssColor(expected, value, msg);
    },
    /**
     * Assert that the value is a DOM element.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertElement : function(value, msg){

      qx.core.Assert.assertElement(value, msg);
    },
    /**
     * Assert that the value is an instance of {@link qx.core.Object}.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertQxObject : function(value, msg){

      qx.core.Assert.assertQxObject(value, msg);
    },
    /**
     * Assert that the value is an instance of {@link qx.ui.core.Widget}.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertQxWidget : function(value, msg){

      qx.core.Assert.assertQxWidget(value, msg);
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */
/**
 * The qooxdoo root class. All other classes are direct or indirect subclasses of this one.
 *
 * This class contains methods for:
 *
 * * object management (creation and destruction)
 * * interfaces for event system
 * * generic setter/getter support
 * * interfaces for logging console
 * * user friendly OO interfaces like {@link #self} or {@link #base}
 *
 * @require(qx.core.ObjectRegistry)
 */
qx.Class.define("qx.core.Object", {
  extend : Object,
  include : qx.core.Environment.filter({
    "module.databinding" : qx.data.MBinding,
    "module.logger" : qx.core.MLogging,
    "module.events" : qx.core.MEvent,
    "module.property" : qx.core.MProperty,
    "qx.debug" : qx.core.MAssert
  }),
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  /**
   * Create a new instance
   */
  construct : function(){

    qx.core.ObjectRegistry.register(this);
  },
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  statics : {
    /** Internal type */
    $$type : "Object"
  },
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members : {
    __M : qx.core.Environment.get("module.property") ? qx.core.Property : null,
    /*
    ---------------------------------------------------------------------------
      BASICS
    ---------------------------------------------------------------------------
    */
    /**
     * Return unique hash code of object
     *
     * @return {Integer} unique hash code of the object
     */
    toHashCode : function(){

      return this.$$hash;
    },
    /**
     * Returns a string representation of the qooxdoo object.
     *
     * @return {String} string representation of the object
     */
    toString : function(){

      return this.classname + "[" + this.$$hash + "]";
    },
    /**
     * Call the same method of the super class.
     *
     * @param args {arguments} the arguments variable of the calling method
     * @param varargs {var} variable number of arguments passed to the overwritten function
     * @return {var} the return value of the method of the base class.
     */
    base : function(args, varargs){

      if(qx.core.Environment.get("qx.debug")){

        if(!qx.Bootstrap.isFunction(args.callee.base)){

          throw new Error("Cannot call super class. Method is not derived: " + args.callee.displayName);
        };
      };
      if(arguments.length === 1){

        return args.callee.base.call(this);
      } else {

        return args.callee.base.apply(this, Array.prototype.slice.call(arguments, 1));
      };
    },
    /**
     * Returns the static class (to access static members of this class)
     *
     * @param args {arguments} the arguments variable of the calling method
     * @return {var} the return value of the method of the base class.
     */
    self : function(args){

      return args.callee.self;
    },
    /*
    ---------------------------------------------------------------------------
      CLONE SUPPORT
    ---------------------------------------------------------------------------
    */
    /**
     * EXPERIMENTAL - NOT READY FOR PRODUCTION
     *
     * Returns a clone of this object. Copies over all user configured
     * property values. Do not configure a parent nor apply the appearance
     * styles directly.
     *
     * @return {qx.core.Object} The clone
     */
    clone : function(){

      if(!qx.core.Environment.get("module.property")){

        throw new Error("Cloning only possible with properties.");
      };
      var clazz = this.constructor;
      var clone = new clazz;
      var props = qx.Class.getProperties(clazz);
      var user = this.__M.$$store.user;
      var setter = this.__M.$$method.set;
      var name;
      // Iterate through properties
      for(var i = 0,l = props.length;i < l;i++){

        name = props[i];
        if(this.hasOwnProperty(user[name])){

          clone[setter[name]](this[user[name]]);
        };
      };
      // Return clone
      return clone;
    },
    /*
    ---------------------------------------------------------------------------
      USER DATA
    ---------------------------------------------------------------------------
    */
    /** @type {Map} stored user data */
    __cJ : null,
    /**
     * Store user defined data inside the object.
     *
     * @param key {String} the key
     * @param value {Object} the value of the user data
     */
    setUserData : function(key, value){

      if(!this.__cJ){

        this.__cJ = {
        };
      };
      this.__cJ[key] = value;
    },
    /**
     * Load user defined data from the object
     *
     * @param key {String} the key
     * @return {Object} the user data
     */
    getUserData : function(key){

      if(!this.__cJ){

        return null;
      };
      var data = this.__cJ[key];
      return data === undefined ? null : data;
    },
    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */
    /**
     * Returns true if the object is disposed.
     *
     * @return {Boolean} Whether the object has been disposed
     */
    isDisposed : function(){

      return this.$$disposed || false;
    },
    /**
     * Dispose this object
     *
     */
    dispose : function(){

      // Check first
      if(this.$$disposed){

        return;
      };
      // Mark as disposed (directly, not at end, to omit recursions)
      this.$$disposed = true;
      this.$$instance = null;
      this.$$allowconstruct = null;
      // Debug output
      if(qx.core.Environment.get("qx.debug")){

        if(qx.core.Environment.get("qx.debug.dispose.level") > 2){

          qx.Bootstrap.debug(this, "Disposing " + this.classname + "[" + this.toHashCode() + "]");
        };
      };
      // Deconstructor support for classes
      var clazz = this.constructor;
      var mixins;
      while(clazz.superclass){

        // Processing this class...
        if(clazz.$$destructor){

          clazz.$$destructor.call(this);
        };
        // Destructor support for mixins
        if(clazz.$$includes){

          mixins = clazz.$$flatIncludes;
          for(var i = 0,l = mixins.length;i < l;i++){

            if(mixins[i].$$destructor){

              mixins[i].$$destructor.call(this);
            };
          };
        };
        // Jump up to next super class
        clazz = clazz.superclass;
      };
      // Additional checks
      if(qx.core.Environment.get("qx.debug")){

        if(qx.core.Environment.get("qx.debug.dispose.level") > 0){

          var key,value;
          for(key in this){

            value = this[key];
            // Check for Objects but respect values attached to the prototype itself
            if(value !== null && typeof value === "object" && !(qx.Bootstrap.isString(value))){

              // Check prototype value
              // undefined is the best, but null may be used as a placeholder for
              // private variables (hint: checks in qx.Class.define). We accept both.
              if(this.constructor.prototype[key] != null){

                continue;
              };
              if(qx.core.Environment.get("qx.debug.dispose.level") > 1){

                qx.Bootstrap.warn(this, "Missing destruct definition for '" + key + "' in " + this.classname + "[" + this.toHashCode() + "]: " + value);
                delete this[key];
              };
            };
          };
        };
      };
    },
    /*
    ---------------------------------------------------------------------------
      DISPOSER UTILITIES
    ---------------------------------------------------------------------------
    */
    /**
     * Disconnects and disposes given objects from instance.
     * Only works with qx.core.Object based objects e.g. Widgets.
     *
     * @param varargs {arguments} Names of fields (which store objects) to dispose
     */
    _disposeObjects : function(varargs){

      qx.util.DisposeUtil.disposeObjects(this, arguments);
    },
    /**
     * Disconnects and disposes given singleton objects from instance.
     * Only works with qx.core.Object based objects e.g. Widgets.
     *
     * @param varargs {arguments} Names of fields (which store objects) to dispose
     */
    _disposeSingletonObjects : function(varargs){

      qx.util.DisposeUtil.disposeObjects(this, arguments, true);
    },
    /**
     * Disposes all members of the given array and deletes
     * the field which refers to the array afterwards.
     *
     * @param field {String} Name of the field which refers to the array
     */
    _disposeArray : function(field){

      qx.util.DisposeUtil.disposeArray(this, field);
    },
    /**
     * Disposes all members of the given map and deletes
     * the field which refers to the map afterwards.
     *
     * @param field {String} Name of the field which refers to the map
     */
    _disposeMap : function(field){

      qx.util.DisposeUtil.disposeMap(this, field);
    }
  },
  /*
  *****************************************************************************
     ENVIRONMENT SETTINGS
  *****************************************************************************
  */
  environment : {
    "qx.debug.dispose.level" : 0
  },
  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */
  destruct : function(){

    if(qx.core.Environment.get("module.events")){

      if(!qx.core.ObjectRegistry.inShutDown){

        // Cleanup event listeners
        qx.event.Registration.removeAllListeners(this);
      } else {

        // on shutdown, just clear the internal listener map
        qx.event.Registration.deleteAllListeners(this);
      };
    };
    // Cleanup object registry
    qx.core.ObjectRegistry.unregister(this);
    // Cleanup user data
    this.__cJ = null;
    // only of properties are available
    if(qx.core.Environment.get("module.property")){

      // Cleanup properties
      var clazz = this.constructor;
      var properties;
      var store = this.__M.$$store;
      var storeUser = store.user;
      var storeTheme = store.theme;
      var storeInherit = store.inherit;
      var storeUseinit = store.useinit;
      var storeInit = store.init;
      while(clazz){

        properties = clazz.$$properties;
        if(properties){

          for(var name in properties){

            if(properties[name].dereference){

              this[storeUser[name]] = this[storeTheme[name]] = this[storeInherit[name]] = this[storeUseinit[name]] = this[storeInit[name]] = undefined;
            };
          };
        };
        clazz = clazz.superclass;
      };
    };
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */
/**
 * Methods to cleanup fields from maps/objects.
 *
 * @ignore(qx.log.Logger)
 * @ignore(qx.log)
 * @ignore(qx.ui.container.Composite)
 * @ignore(qx.ui.container.Scroll)
 * @ignore(qx.ui.container.SlideBar)
 * @ignore(qx.ui.container.Stack)
 */
qx.Class.define("qx.util.DisposeUtil", {
  statics : {
    /**
     * Disconnects and disposes given objects from instance.
     * Only works with qx.core.Object based objects e.g. Widgets.
     *
     * @param obj {Object} Object which contains the fields
     * @param arr {Array} List of fields (which store objects) to dispose
     * @param disposeSingletons {Boolean?} true, if singletons should be disposed
     */
    disposeObjects : function(obj, arr, disposeSingletons){

      var name;
      for(var i = 0,l = arr.length;i < l;i++){

        name = arr[i];
        if(obj[name] == null || !obj.hasOwnProperty(name)){

          continue;
        };
        if(!qx.core.ObjectRegistry.inShutDown){

          if(obj[name].dispose){

            // singletons
            if(!disposeSingletons && obj[name].constructor.$$instance){

              throw new Error("The object stored in key " + name + " is a singleton! Please use disposeSingleton instead.");
            } else {

              obj[name].dispose();
            };
          } else {

            throw new Error("Has no disposable object under key: " + name + "!");
          };
        };
        obj[name] = null;
      };
    },
    /**
     * Disposes all members of the given array and deletes
     * the field which refers to the array afterwards.
     *
     * @param obj {Object} Object which contains the field
     * @param field {String} Name of the field which refers to the array
     */
    disposeArray : function(obj, field){

      var data = obj[field];
      if(!data){

        return;
      };
      // Fast path for application shutdown
      if(qx.core.ObjectRegistry.inShutDown){

        obj[field] = null;
        return;
      };
      // Dispose all content
      try{

        var entry;
        for(var i = data.length - 1;i >= 0;i--){

          entry = data[i];
          if(entry){

            entry.dispose();
          };
        };
      } catch(ex) {

        throw new Error("The array field: " + field + " of object: " + obj + " has non disposable entries: " + ex);
      };
      // Reduce array size to zero
      data.length = 0;
      // Finally remove field
      obj[field] = null;
    },
    /**
     * Disposes all members of the given map and deletes
     * the field which refers to the map afterwards.
     *
     * @param obj {Object} Object which contains the field
     * @param field {String} Name of the field which refers to the array
     */
    disposeMap : function(obj, field){

      var data = obj[field];
      if(!data){

        return;
      };
      // Fast path for application shutdown
      if(qx.core.ObjectRegistry.inShutDown){

        obj[field] = null;
        return;
      };
      // Dispose all content
      try{

        var entry;
        for(var key in data){

          entry = data[key];
          if(data.hasOwnProperty(key) && entry){

            entry.dispose();
          };
        };
      } catch(ex) {

        throw new Error("The map field: " + field + " of object: " + obj + " has non disposable entries: " + ex);
      };
      // Finally remove field
      obj[field] = null;
    },
    /**
     * Disposes a given object when another object is disposed
     *
     * @param disposeMe {Object} Object to dispose when other object is disposed
     * @param trigger {Object} Other object
     *
     */
    disposeTriggeredBy : function(disposeMe, trigger){

      var triggerDispose = trigger.dispose;
      trigger.dispose = function(){

        triggerDispose.call(trigger);
        disposeMe.dispose();
      };
    },
    /**
     * Destroys a container and all of its children recursivly.
     * @param container {qx.ui.container.Composite | qx.ui.container.Scroll |
     *   qx.ui.container.SlideBar | qx.ui.container.Stack} Container to be destroyed
     */
    destroyContainer : function(container){

      if(qx.core.Environment.get("qx.debug")){

        qx.core.Assert.assertQxWidget(container, "First argument must be a container widget!");
        qx.core.Assert.assertTrue(this.__cK(container), "Container must be a instance of qx.ui.container.Composite or " + "qx.ui.container.Scroll or qx.ui.container.Resizer or " + "qx.ui.container.SlideBar or qx.ui.container.Stack!");
      };
      var arr = [];
      this._collectContainerChildren(container, arr);
      var len = arr.length;
      for(var i = len - 1;i >= 0;i--){

        arr[i].destroy();
      };
      container.destroy();
    },
    /**
     * Helper function to collect all children widgets of an container recursivly.
     * @param container {qx.ui.container.Composite | qx.ui.container.Scroll | qx.ui.container.SlideBar | qx.ui.container.Stack} Container to be destroyed
     * @param arr {Array} Array wich holds all children widgets
     */
    _collectContainerChildren : function(container, arr){

      var children = container.getChildren();
      for(var i = 0;i < children.length;i++){

        var item = children[i];
        arr.push(item);
        if(this.__cK(item)){

          this._collectContainerChildren(item, arr);
        };
      };
    },
    /**
     * Checks if the given object is a qx container widget
     *
     * @param obj {Object} The object to check
     * @return {Boolean} <code>true</code> if the object is a container for
     * child widgets
     */
    __cK : function(obj){

      var classes = [qx.ui.container.Composite, qx.ui.container.Scroll, qx.ui.container.SlideBar, qx.ui.container.Stack];
      for(var i = 0,l = classes.length;i < l;i++){

        if(typeof classes[i] !== "undefined" && qx.Class.isSubClassOf(obj.constructor, classes[i])){

          return true;
        };
      };
      return false;
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)

************************************************************************ */
/**
 * This class provides qooxdoo object event support.
 */
qx.Class.define("qx.event.handler.Object", {
  extend : qx.core.Object,
  implement : qx.event.IEventHandler,
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  statics : {
    /** @type {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_LAST,
    /** @type {Map} Supported event types */
    SUPPORTED_TYPES : null,
    /** @type {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_OBJECT,
    /** @type {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : false
  },
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members : {
    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */
    // interface implementation
    canHandleEvent : function(target, type){

      return qx.Class.supportsEvent(target.constructor, type);
    },
    // interface implementation
    registerEvent : function(target, type, capture){
    },
    // interface implementation
    unregisterEvent : function(target, type, capture){
    }
  },
  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */
  defer : function(statics){

    qx.event.Registration.addHandler(statics);
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */
/**
 * All event dispatchers must implement this interface. Event dispatchers must
 * register themselves at the event Manager using
 * {@link qx.event.Registration#addDispatcher}.
 */
qx.Interface.define("qx.event.IEventDispatcher", {
  members : {
    /**
     * Whether the dispatcher is responsible for the this event.
     *
     * @param target {Element|Event} The event dispatch target
     * @param event {qx.event.type.Event} The event object
     * @param type {String} the event type
     * @return {Boolean} Whether the event dispatcher is responsible for the this event
     */
    canDispatchEvent : function(target, event, type){

      this.assertInstance(event, qx.event.type.Event);
      this.assertString(type);
    },
    /**
     * This function dispatches the event to the event listeners.
     *
     * @param target {Element|Event} The event dispatch target
     * @param event {qx.event.type.Event} event object to dispatch
     * @param type {String} the event type
     */
    dispatchEvent : function(target, event, type){

      this.assertInstance(event, qx.event.type.Event);
      this.assertString(type);
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */
/**
 * Basic event object.
 *
 * Please note:
 * Event objects are only valid during the event dispatch. After the dispatch
 * event objects are pooled or disposed. If you want to safe a reference to an
 * event instance use the {@link #clone} method.
 *
 * The interface is modeled after the DOM level 2 event interface:
 * http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-interface
 *
 * @use(qx.event.Registration)
 */
qx.Class.define("qx.event.type.Event", {
  extend : qx.core.Object,
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  statics : {
    /** The current event phase is the capturing phase. */
    CAPTURING_PHASE : 1,
    /** The event is currently being evaluated at the target */
    AT_TARGET : 2,
    /** The current event phase is the bubbling phase. */
    BUBBLING_PHASE : 3
  },
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members : {
    /**
     * Initialize the fields of the event. The event must be initialized before
     * it can be dispatched.
     *
     * @param canBubble {Boolean?false} Whether or not the event is a bubbling event.
     *     If the event is bubbling, the bubbling can be stopped using
     *     {@link #stopPropagation}
     * @param cancelable {Boolean?false} Whether or not an event can have its default
     *     action prevented. The default action can either be the browser's
     *     default action of a native event (e.g. open the context menu on a
     *     right click) or the default action of a qooxdoo class (e.g. close
     *     the window widget). The default action can be prevented by calling
     *     {@link #preventDefault}
     * @return {qx.event.type.Event} The initialized event instance
     */
    init : function(canBubble, cancelable){

      if(qx.core.Environment.get("qx.debug")){

        if(canBubble !== undefined){

          qx.core.Assert.assertBoolean(canBubble, "Invalid argument value 'canBubble'.");
        };
        if(cancelable !== undefined){

          qx.core.Assert.assertBoolean(cancelable, "Invalid argument value 'cancelable'.");
        };
      };
      this._type = null;
      this._target = null;
      this._currentTarget = null;
      this._relatedTarget = null;
      this._originalTarget = null;
      this._stopPropagation = false;
      this._preventDefault = false;
      this._bubbles = !!canBubble;
      this._cancelable = !!cancelable;
      this._timeStamp = (new Date()).getTime();
      this._eventPhase = null;
      return this;
    },
    /**
     * Create a clone of the event object, which is not automatically disposed
     * or pooled after an event dispatch.
     *
     * @param embryo {qx.event.type.Event?null} Optional event class, which will
     *     be configured using the data of this event instance. The event must be
     *     an instance of this event class. If the value is <code>null</code>,
     *     a new pooled instance is created.
     * @return {qx.event.type.Event} a clone of this class.
     */
    clone : function(embryo){

      if(embryo){

        var clone = embryo;
      } else {

        var clone = qx.event.Pool.getInstance().getObject(this.constructor);
      };
      clone._type = this._type;
      clone._target = this._target;
      clone._currentTarget = this._currentTarget;
      clone._relatedTarget = this._relatedTarget;
      clone._originalTarget = this._originalTarget;
      clone._stopPropagation = this._stopPropagation;
      clone._bubbles = this._bubbles;
      clone._preventDefault = this._preventDefault;
      clone._cancelable = this._cancelable;
      return clone;
    },
    /**
     * Stops event from all further processing. Execute this when the
     * current handler should have "exclusive rights" to the event
     * and no further reaction by anyone else should happen.
     */
    stop : function(){

      if(this._bubbles){

        this.stopPropagation();
      };
      if(this._cancelable){

        this.preventDefault();
      };
    },
    /**
     * This method is used to prevent further propagation of an event during event
     * flow. If this method is called by any event listener the event will cease
     * propagating through the tree. The event will complete dispatch to all listeners
     * on the current event target before event flow stops.
     *
     */
    stopPropagation : function(){

      if(qx.core.Environment.get("qx.debug")){

        this.assertTrue(this._bubbles, "Cannot stop propagation on a non bubbling event: " + this.getType());
      };
      this._stopPropagation = true;
    },
    /**
     * Get whether further event propagation has been stopped.
     *
     * @return {Boolean} Whether further propagation has been stopped.
     */
    getPropagationStopped : function(){

      return !!this._stopPropagation;
    },
    /**
     * Prevent the default action of cancelable events, e.g. opening the context
     * menu, ...
     *
     */
    preventDefault : function(){

      if(qx.core.Environment.get("qx.debug")){

        this.assertTrue(this._cancelable, "Cannot prevent default action on a non cancelable event: " + this.getType());
      };
      this._preventDefault = true;
    },
    /**
     * Get whether the default action has been prevented
     *
     * @return {Boolean} Whether the default action has been prevented
     */
    getDefaultPrevented : function(){

      return !!this._preventDefault;
    },
    /**
     * The name of the event
     *
     * @return {String} name of the event
     */
    getType : function(){

      return this._type;
    },
    /**
     * Override the event type
     *
     * @param type {String} new event type
     */
    setType : function(type){

      this._type = type;
    },
    /**
     * Used to indicate which phase of event flow is currently being evaluated.
     *
     * @return {Integer} The current event phase. Possible values are
     *         {@link #CAPTURING_PHASE}, {@link #AT_TARGET} and {@link #BUBBLING_PHASE}.
     */
    getEventPhase : function(){

      return this._eventPhase;
    },
    /**
     * Override the event phase
     *
     * @param eventPhase {Integer} new event phase
     */
    setEventPhase : function(eventPhase){

      this._eventPhase = eventPhase;
    },
    /**
     * The time (in milliseconds relative to the epoch) at which the event was created.
     *
     * @return {Integer} the timestamp the event was created.
     */
    getTimeStamp : function(){

      return this._timeStamp;
    },
    /**
     * Returns the event target to which the event was originally
     * dispatched.
     *
     * @return {Element} target to which the event was originally
     *       dispatched.
     */
    getTarget : function(){

      return this._target;
    },
    /**
     * Override event target.
     *
     * @param target {Element} new event target
     */
    setTarget : function(target){

      this._target = target;
    },
    /**
     * Get the event target node whose event listeners are currently being
     * processed. This is particularly useful during event capturing and
     * bubbling.
     *
     * @return {Element} The target the event listener is currently
     *       dispatched on.
     */
    getCurrentTarget : function(){

      return this._currentTarget || this._target;
    },
    /**
     * Override current target.
     *
     * @param currentTarget {Element} new current target
     */
    setCurrentTarget : function(currentTarget){

      this._currentTarget = currentTarget;
    },
    /**
     * Get the related event target. This is only configured for
     * events which also had an influences on another element e.g.
     * mouseover/mouseout, focus/blur, ...
     *
     * @return {Element} The related target
     */
    getRelatedTarget : function(){

      return this._relatedTarget;
    },
    /**
     * Override related target.
     *
     * @param relatedTarget {Element} new related target
     */
    setRelatedTarget : function(relatedTarget){

      this._relatedTarget = relatedTarget;
    },
    /**
     * Get the original event target. This is only configured
     * for events which are fired by another event (often when
     * the target should be reconfigured for another view) e.g.
     * low-level DOM event to widget event.
     *
     * @return {Element} The original target
     */
    getOriginalTarget : function(){

      return this._originalTarget;
    },
    /**
     * Override original target.
     *
     * @param originalTarget {Element} new original target
     */
    setOriginalTarget : function(originalTarget){

      this._originalTarget = originalTarget;
    },
    /**
     * Check whether or not the event is a bubbling event. If the event can
     * bubble the value is true, else the value is false.
     *
     * @return {Boolean} Whether the event bubbles
     */
    getBubbles : function(){

      return this._bubbles;
    },
    /**
     * Set whether the event bubbles.
     *
     * @param bubbles {Boolean} Whether the event bubbles
     */
    setBubbles : function(bubbles){

      this._bubbles = bubbles;
    },
    /**
     * Get whether the event is cancelable
     *
     * @return {Boolean} Whether the event is cancelable
     */
    isCancelable : function(){

      return this._cancelable;
    },
    /**
     * Set whether the event is cancelable
     *
     * @param cancelable {Boolean} Whether the event is cancelable
     */
    setCancelable : function(cancelable){

      this._cancelable = cancelable;
    }
  },
  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */
  destruct : function(){

    this._target = this._currentTarget = this._relatedTarget = this._originalTarget = null;
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     Simon Bull

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Simon Bull (sbull)
     * Sebastian Werner (wpbasti)

************************************************************************ */
/**
 * This class manages pooled Object instances.
 *
 * It exists mainly to minimise the amount of browser memory usage by reusing
 * window instances after they have been closed.  However, it could equally be
 * used to pool instances of any type of Object (expect singletons).
 *
 * It is the client's responsibility to ensure that pooled objects are not
 * referenced or used from anywhere else in the application.
 */
qx.Class.define("qx.util.ObjectPool", {
  extend : qx.core.Object,
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  /**
   * @param size {Integer} Size of each class pool
   */
  construct : function(size){

    qx.core.Object.call(this);
    this.__cL = {
    };
    if(size != null){

      this.setSize(size);
    };
  },
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties : {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */
    /**
     * Number of objects of each class, which are pooled.
     *
     * A size of "null" represents an unlimited pool.
     */
    size : {
      check : "Integer",
      init : Infinity
    }
  },
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members : {
    /** @type {Map} Stores arrays of instances for all managed classes */
    __cL : null,
    /*
    ---------------------------------------------------------------------------
      IMPL
    ---------------------------------------------------------------------------
    */
    /**
     * This method finds and returns an instance of a requested type in the pool,
     * if there is one.  Note that the pool determines which instance (if any) to
     * return to the client.  The client cannot get a specific instance from the
     * pool.
     *
     * @param clazz {Class} A reference to a class from which an instance should be created.
     * @return {Object} An instance of the requested type. If non existed in the pool a new
     *   one is transparently created and returned.
     */
    getObject : function(clazz){

      if(this.$$disposed){

        return new clazz;
      };
      if(!clazz){

        throw new Error("Class needs to be defined!");
      };
      var obj = null;
      var pool = this.__cL[clazz.classname];
      if(pool){

        obj = pool.pop();
      };
      if(obj){

        obj.$$pooled = false;
      } else {

        obj = new clazz;
      };
      return obj;
    },
    /**
     * This method places an Object in a pool of Objects of its type. Note that
     * once an instance has been pooled, there is no means to get that exact
     * instance back. The instance may be discarded for garbage collection if
     * the pool of its type is already full.
     *
     * It is assumed that no other references exist to this Object, and that it will
     * not be used at all while it is pooled.
     *
     * @param obj {Object} An Object instance to pool.
     */
    poolObject : function(obj){

      // Dispose check
      if(!this.__cL){

        return;
      };
      var classname = obj.classname;
      var pool = this.__cL[classname];
      if(obj.$$pooled){

        throw new Error("Object is already pooled: " + obj);
      };
      if(!pool){

        this.__cL[classname] = pool = [];
      };
      // Check to see whether the pool for this type is already full
      if(pool.length > this.getSize()){

        // Use enhanced destroy() method instead of simple dispose
        // when available to work together with queues etc.
        if(obj.destroy){

          obj.destroy();
        } else {

          obj.dispose();
        };
        return;
      };
      obj.$$pooled = true;
      pool.push(obj);
    }
  },
  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */
  destruct : function(){

    var pool = this.__cL;
    var classname,list,i,l;
    for(classname in pool){

      list = pool[classname];
      for(i = 0,l = list.length;i < l;i++){

        list[i].dispose();
      };
    };
    delete this.__cL;
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)

************************************************************************ */
/**
 * Central instance pool for event objects. All event objects dispatched by the
 * event loader are pooled using this class.
 */
qx.Class.define("qx.event.Pool", {
  extend : qx.util.ObjectPool,
  type : "singleton",
  // Even though this class contains almost no code it is required because the
  // legacy code needs a place to patch the event pooling behavior.
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct : function(){

    qx.util.ObjectPool.call(this, 30);
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */
/**
 * Dispatches events directly on the event target (no bubbling nor capturing).
 */
qx.Class.define("qx.event.dispatch.Direct", {
  extend : qx.core.Object,
  implement : qx.event.IEventDispatcher,
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  /**
   * Create a new instance
   *
   * @param manager {qx.event.Manager} Event manager for the window to use
   */
  construct : function(manager){

    this._manager = manager;
  },
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  statics : {
    /** @type {Integer} Priority of this dispatcher */
    PRIORITY : qx.event.Registration.PRIORITY_LAST
  },
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members : {
    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCHER INTERFACE
    ---------------------------------------------------------------------------
    */
    // interface implementation
    canDispatchEvent : function(target, event, type){

      return !event.getBubbles();
    },
    // interface implementation
    dispatchEvent : function(target, event, type){

      if(qx.core.Environment.get("qx.debug")){

        if(target instanceof qx.core.Object){

          var expectedEventClassName = qx.Class.getEventType(target.constructor, type);
          var expectedEventClass = qx.Class.getByName(expectedEventClassName);
          if(!expectedEventClass){

            this.error("The event type '" + type + "' declared in the class '" + target.constructor + " is not an available class': " + expectedEventClassName);
          } else if(!(event instanceof expectedEventClass)){

            this.error("Expected event type to be instanceof '" + expectedEventClassName + "' but found '" + event.classname + "'");
          };
        };
      };
      event.setEventPhase(qx.event.type.Event.AT_TARGET);
      var listeners = this._manager.getListeners(target, type, false);
      if(listeners){

        for(var i = 0,l = listeners.length;i < l;i++){

          var context = listeners[i].context || target;
          if(qx.core.Environment.get("qx.debug")){

            // warn if the context is disposed
            if(context && context.isDisposed && context.isDisposed()){

              this.warn("The context object '" + context + "' for the event '" + type + "' of '" + target + "'is already disposed.");
            };
          };
          listeners[i].handler.call(context, event);
        };
      };
    }
  },
  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */
  defer : function(statics){

    qx.event.Registration.addDispatcher(statics);
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */
/**
 * Event object for data holding event or data changes.
 */
qx.Class.define("qx.event.type.Data", {
  extend : qx.event.type.Event,
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members : {
    __cM : null,
    __cN : null,
    /**
     * Initializes an event object.
     *
     * @param data {var} The event's new data
     * @param old {var?null} The event's old data (optional)
     * @param cancelable {Boolean?false} Whether or not an event can have its default
     *     action prevented. The default action can either be the browser's
     *     default action of a native event (e.g. open the context menu on a
     *     right click) or the default action of a qooxdoo class (e.g. close
     *     the window widget). The default action can be prevented by calling
     *     {@link qx.event.type.Event#preventDefault}
     * @return {qx.event.type.Data} the initialized instance.
     */
    init : function(data, old, cancelable){

      qx.event.type.Event.prototype.init.call(this, false, cancelable);
      this.__cM = data;
      this.__cN = old;
      return this;
    },
    /**
     * Get a copy of this object
     *
     * @param embryo {qx.event.type.Data?null} Optional event class, which will
     *     be configured using the data of this event instance. The event must be
     *     an instance of this event class. If the data is <code>null</code>,
     *     a new pooled instance is created.
     * @return {qx.event.type.Data} a copy of this object
     */
    clone : function(embryo){

      var clone = qx.event.type.Event.prototype.clone.call(this, embryo);
      clone.__cM = this.__cM;
      clone.__cN = this.__cN;
      return clone;
    },
    /**
     * The new data of the event sending this data event.
     * The return data type is the same as the event data type.
     *
     * @return {var} The new data of the event
     */
    getData : function(){

      return this.__cM;
    },
    /**
     * The old data of the event sending this data event.
     * The return data type is the same as the event data type.
     *
     * @return {var} The old data of the event
     */
    getOldData : function(){

      return this.__cN;
    }
  },
  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */
  destruct : function(){

    this.__cM = this.__cN = null;
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Daniel Wagner (d_wagner)
     * John Spackman

************************************************************************ */
/**
 * This is the base class for non-browser qooxdoo applications.
 */
qx.Class.define("qx.core.BaseInit", {
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  statics : {
    __cO : null,
    /**
     * Returns the instantiated qooxdoo application.
     *
     * @return {qx.core.Object} The application instance.
     */
    getApplication : function(){

      return this.__cO || null;
    },
    /**
     * Runs when the application is loaded. Automatically creates an instance
     * of the class defined by the setting <code>qx.application</code>.
     *
     */
    ready : function(){

      if(this.__cO){

        return;
      };
      if(qx.core.Environment.get("engine.name") == ""){

        qx.log.Logger.warn("Could not detect engine!");
      };
      if(qx.core.Environment.get("engine.version") == ""){

        qx.log.Logger.warn("Could not detect the version of the engine!");
      };
      if(qx.core.Environment.get("os.name") == ""){

        qx.log.Logger.warn("Could not detect operating system!");
      };
      qx.log.Logger.debug(this, "Load runtime: " + (new Date - qx.Bootstrap.LOADSTART) + "ms");
      var app = qx.core.Environment.get("qx.application");
      var clazz = qx.Class.getByName(app);
      if(clazz){

        this.__cO = new clazz;
        var start = new Date;
        this.__cO.main();
        qx.log.Logger.debug(this, "Main runtime: " + (new Date - start) + "ms");
        var start = new Date;
        this.__cO.finalize();
        qx.log.Logger.debug(this, "Finalize runtime: " + (new Date - start) + "ms");
      } else {

        qx.log.Logger.warn("Missing application class: " + app);
      };
    },
    /**
     * Runs before the document is unloaded. Calls the application's close
     * method to check if the unload process should be stopped.
     *
     * @param e {qx.event.type.Native} Incoming beforeunload event.
     */
    __cP : function(e){

      var app = this.__cO;
      if(app){

        app.close();
      };
    },
    /**
     * Runs when the document is unloaded. Automatically terminates a previously
     * created application instance.
     *
     */
    __cQ : function(){

      var app = this.__cO;
      if(app){

        app.terminate();
      };
      // Execute registry shutdown
      qx.core.ObjectRegistry.shutdown();
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */
/**
 * This interface defines what an application class has to implement.
 */
qx.Interface.define("qx.application.IApplication", {
  members : {
    /**
     * Called when the application relevant classes are loaded and ready.
     *
     */
    main : function(){
    },
    /**
     * Called when the application's main method was executed to handle
     * "final" tasks like rendering or retrieving data.
     *
     */
    finalize : function(){
    },
    /**
     * Called in the document.beforeunload event of the browser. If the method
     * returns a string value, the user will be asked by the browser, whether
     * he really wants to leave the page. The return string will be displayed in
     * the message box.
     *
     * @return {String?null} message text on unloading the page
     */
    close : function(){
    },
    /**
     * This method contains the last code which is run inside the page and may contain cleanup code.
     *
     */
    terminate : function(){
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)

************************************************************************ */
/**
 * For a basic, out-of-browser application (running e.g. on Node.js, Rhino).
 */
qx.Class.define("qx.application.Basic", {
  extend : qx.core.Object,
  implement : [qx.application.IApplication],
  members : {
    // interface method
    main : function(){
    },
    // interface method
    finalize : function(){
    },
    // interface method
    close : function(){
    },
    // interface method
    terminate : function(){
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */
/* ************************************************************************
************************************************************************ */
/**
 * Simulator main application class.
 */
qx.Class.define("simulator.Application", {
  extend : qx.application.Basic,
  members : {
    main : function(){

      qx.log.Logger.register(qx.log.appender.RhinoConsole);
      if(window.arguments){

        try{

          this._argumentsToSettings(window.arguments);
        } catch(ex) {

          this.error(ex.toString());
          return;
        };
      };
      this._initLogFile();
      this.runner = new testrunner.runner.TestRunnerBasic();
      this.simulation = simulator.Simulation.getInstance();
      this.runner.addListener("changeTestSuiteState", this._onChangeTestSuiteState, this);
      // sync test suite loading
      if(this.runner.getTestSuiteState() === "ready"){

        this._runSuite();
      };
    },
    /**
     * Runs the suite once it's loaded. Also stops the Selenium session after
     * the suite is finished or if there was an error during loading.
     *
     * @ignore(quit)
     * @param ev {qx.event.type.Data} The testrunner's changeTestSuiteState event
     */
    _onChangeTestSuiteState : function(ev){

      var state = ev.getData();
      switch(state){// async test suite loading
      case "ready":
      this._runSuite();
      break;case "finished":
      this.simulation.logRunTime();
      simulator.QxSelenium.getInstance().stop();
      quit();
      break;case "error":
      simulator.QxSelenium.getInstance().stop();
      quit();
      break;};
    },
    /**
     * Starts a QxSelenium session, logs some environment info and runs the
     * test suite.
     */
    _runSuite : function(){

      this.simulation.startSession();
      this.simulation.logEnvironment();
      this.simulation.logUserAgent();
      this.runner.view.run();
    },
    /**
     * Converts the value of the "settings" command line option to qx settings.
     *
     * @param args {String[]} Rhino arguments object
     */
    _argumentsToSettings : function(args){

      var opts;
      for(var i = 0,l = args.length;i < l;i++){

        if(args[i].indexOf("settings=") == 0){

          opts = args[i].substr(9);
          break;
        } else if(args[i].indexOf("'settings=") == 0){

          opts = /'settings\=(.*?)'/.exec(args[i])[1];
          break;
        };
      };
      if(opts){

        opts = opts.replace(/\\\{/g, "{").replace(/\\\}/g, "}");
        try{

          opts = qx.lang.Json.parse(opts);
        } catch(ex) {

          var msg = ex.toString() + "\nMake sure none of the settings configured" + " in simulation-run/environment contain paths with spaces!";
          throw new Error(msg);
        };
        for(var prop in opts){

          var value = opts[prop];
          if(typeof value == "string"){

            value = value.replace(/\$/g, " ");
          };
          try{

            qx.core.Environment.add(prop, value);
          } catch(ex) {

            this.error("Unable to define command-line setting " + prop + ": " + ex);
          };
        };
      };
    },
    /**
     * Creates a log file using {@link qx.log.appender.RhinoFile}
     */
    _initLogFile : function(){

      var filename = null;
      filename = qx.core.Environment.get("simulator.logFile");
      if(!filename){

        return;
      };
      if(qx.log.appender.RhinoFile.FILENAME !== filename){

        qx.log.appender.RhinoFile.FILENAME = filename;
        qx.log.Logger.register(qx.log.appender.RhinoFile);
      };
    }
  },
  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */
  destruct : function(){

    this._disposeObjects("runner");
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006-2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */
/**
 * Log appender for qooxdoo applications running in Mozilla Rhino. Writes log
 * messages to STDOUT/STDERR.
 */
qx.Class.define("qx.log.appender.RhinoConsole", {
  statics : {
    /**
     * java.lang.System.out
     */
    __cR : null,
    /**
     * java.lang.System.err
     */
    __cS : null,
    /**
     * Writes a message to the shell. Errors will be sent to STDERR, everything
     * else goes to STDOUT
     *
     * @param logMessage {String} Message to be logged
     * @param level {String} Log level. One of "debug", "info", "warn", "error"
     */
    log : function(logMessage, level){

      if(level == "error"){

        this.__cS.println(logMessage);
      } else {

        this.__cR.println(logMessage);
      };
    },
    /**
     * Logs a debug message
     *
     * @param logMessage {String} Message to be logged
     */
    debug : function(logMessage){

      this.log(logMessage, "debug");
    },
    /**
     * Logs an info message
     *
     * @param logMessage {String} Message to be logged
     */
    info : function(logMessage){

      this.log(logMessage, "info");
    },
    /**
     * Logs a warning message
     *
     * @param logMessage {String} Message to be logged
     */
    warn : function(logMessage){

      this.log(logMessage, "warn");
    },
    /**
     * Logs an error message
     *
     * @param logMessage {String} Message to be logged
     */
    error : function(logMessage){

      this.log(logMessage, "error");
    },
    /**
     * Process a log entry object from qooxdoo's logging system.
     *
     * @param entry {Map} Log entry object
     */
    process : function(entry){

      var level = entry.level || "info";
      for(var prop in entry){

        if(prop == "items"){

          var items = entry[prop];
          for(var p = 0,l = items.length;p < l;p++){

            var item = items[p];
            this[level](item.text);
          };
        };
      };
    }
  },
  defer : function(){

    if(typeof (java) !== "undefined" && typeof (java.lang) !== "undefined"){

      qx.log.appender.RhinoConsole.__cR = java.lang.System.out;
      qx.log.appender.RhinoConsole.__cS = java.lang.System.err;
    };
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */
/**
 * The TestRunner is responsible for loading the test classes and keeping track
 * of the test suite's state.
 *
 */
qx.Class.define("testrunner.runner.TestRunnerBasic", {
  extend : qx.core.Object,
  statics : {
    /**
     * Load test suite defined by testrunner.define()
     */
    start : function(){

      var init = qx.core.Init ? qx.core.Init : qx.core.BaseInit;
      var runner = init.getApplication().runner;
      runner._loadExternalTests();
      if(typeof runner.view.toggleAllTests == "function"){

        runner.view.toggleAllTests(true);
      };
    }
  },
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct : function(){

    if(qx.core.Environment.get("qx.globalErrorHandling")){

      qx.event.GlobalError.setErrorHandler(this._handleGlobalError, this);
    };
    // Create view
    this.__cT = [];
    var viewSetting = qx.core.Environment.get("testrunner.view");
    var viewClass = qx.Class.getByName(viewSetting);
    if(qx.core.Environment.get("testrunner.performance")){

      qx.Class.include(viewClass, testrunner.view.MPerformance);
    };
    this.view = new viewClass();
    // Connect view and controller
    this.view.addListener("runTests", this._runTests, this);
    this.view.addListener("stopTests", this._stopTests, this);
    this.bind("testSuiteState", this.view, "testSuiteState");
    this.bind("testCount", this.view, "testCount");
    this.bind("testModel", this.view, "testModel");
    qx.data.SingleValueBinding.bind(this.view, "selectedTests", this, "selectedTests");
    this._origin = qx.core.Environment.get("testrunner.testOrigin");
    this._testNameSpace = this._getTestNameSpace();
    this._loadTests();
  },
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties : {
    /** Current state of the test suite */
    testSuiteState : {
      init : "init",
      check : ["init", "loading", "ready", "running", "finished", "aborted", "error"],
      event : "changeTestSuiteState"
    },
    /** Number of tests that haven't run yet */
    testCount : {
      init : null,
      nullable : true,
      check : "Integer",
      event : "changeTestCount"
    },
    /** Model object representing the test namespace. */
    testModel : {
      init : null,
      nullable : true,
      event : "changeTestModel"
    },
    /** List of tests selected by the user */
    selectedTests : {
      nullable : true,
      init : null,
      apply : "_applySelectedTests"
    }
  },
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members : {
    _origin : null,
    loader : null,
    _testParts : null,
    __cT : null,
    _testNameSpace : null,
    _externalTestClasses : 0,
    /**
     * Returns the configured base namespace of the current test suite
     * @return {String} Test namespace
     */
    _getTestNameSpace : function(){

      return qx.core.Environment.get("qx.testNameSpace");
    },
    /**
     * Deletes the current test suite so a new one can be loaded
     */
    _resetSuite : function(){

      if(this.loader){

        this.loader.dispose();
        this.loader = null;
      };
      this._externalTestClasses = 0;
      this.setTestModel(null);
      this.__cT = [];
    },
    /**
     * Loads the test suite
     */
    _loadTests : function(){

      var origin = qx.core.Environment.get("testrunner.testOrigin");
      switch(origin){case "external":
      break;default:
      this._loadInlineTests(this._testNameSpace);};
    },
    /**
     * Loads test classes that are a part of the TestRunner application.
     *
     * @param nameSpace {String|Object} Test namespace to be loaded
     */
    _loadInlineTests : function(nameSpace){

      this.setTestSuiteState("loading");
      this.loader = new qx.dev.unit.TestLoaderBasic(nameSpace);
      this._wrapAssertions();
      this._getTestModel();
    },
    /**
     * Creates a test class from the given members map and adds it to the suite
     * @param membersMap {map} Map containing the class members (test methods etc.)
     */
    _addTestClass : function(membersMap){

      if(qx.core.Environment.get("qx.debug")){

        qx.core.Assert.assertMap(membersMap);
      };
      this.setTestSuiteState("loading");
      this._externalTestClasses += 1;
      var testNameSpace = this._testNameSpace || "test";
      var testClassName;
      if(membersMap.classname){

        testClassName = membersMap.classname;
        if(testClassName.split(".")[0] !== testNameSpace){

          testClassName = testNameSpace + "." + testClassName;
        };
        delete membersMap.classname;
      } else {

        testClassName = testNameSpace + ".Test" + (this._externalTestClasses);
      };
      var testClass = this._defineTestClass(testClassName, membersMap);
      if(this.loader){

        this.loader.getSuite().add(testClass);
      } else {

        this.loader = new qx.dev.unit.TestLoaderBasic(testNameSpace);
      };
    },
    /**
     * Creates a test class from the given members map
     *
     * @param testClassName {String} Fully qualified name for the test class
     * @param membersMap {map} Map containing the class members (test methods etc.)
     * @return {qx.Class} Configured test class
     */
    _defineTestClass : function(testClassName, membersMap){

      var qxClass = qx.Class;
      return qxClass.define(testClassName, {
        extend : qx.dev.unit.TestCase,
        members : membersMap
      });
    },
    /**
     * Create a test class from the given definition and add it to the model
     *
     * @param membersMap {Map} "members" section for the new test class
     */
    define : function(membersMap){

      this._addTestClass(membersMap);
      this._getTestModel();
    },
    /**
     * Create a new test suite from the class definitions in
     * window.testrunner.testDefinitions
     *
     * @ignore(testrunner.testDefinitions.*)
     */
    _loadExternalTests : function(){

      this._resetSuite();
      if(window.testrunner.testDefinitions instanceof Array){

        for(var i = 0,l = testrunner.testDefinitions.length;i < l;i++){

          this._addTestClass(testrunner.testDefinitions[i]);
        };
        window.testrunner.testDefinitions = [];
        if(this.loader){

          //FIXME: Assertion wrapping causes weird errors
          //this._wrapAssertions();
          this._getTestModel();
        };
      };
    },
    /**
     * Returns the loader's test representation object
     *
     * @return {Object} Test representation
     */
    __cU : function(){

      var testRep = this.loader.getTestDescriptions();
      if(!testRep){

        this.error("Couldn't get test descriptions from loader!");
        return null;
      };
      return qx.lang.Json.parse(testRep);
    },
    /**
     * Constructs a model of the test suite from the loader's test
     * representation data
     */
    _getTestModel : function(){

      if(this.currentTestData){

        this.currentTestData = null;
        delete this.currentTestData;
      };
      var oldModel = this.getTestModel();
      if(oldModel){

        this.getTestModel().dispose();
        this.__cT = [];
      };
      this.setTestModel(null);
      var testRep = this.__cU();
      if(!testRep || testRep.length === 0 || (testRep.length === 1 && testRep[0].tests.length === 0)){

        this.setTestSuiteState("error");
        return;
      };
      var modelData = testrunner.runner.ModelUtil.createModelData(testRep);
      var delegate = {
        getModelSuperClass : function(properties){

          return testrunner.runner.TestItem;
        }
      };
      var marshal = new qx.data.marshal.Json(delegate);
      marshal.toClass(modelData.children[0], true);
      var model = marshal.toModel(modelData.children[0]);
      testrunner.runner.ModelUtil.addDataFields(model);
      this.setTestModel(model);
      this.setTestSuiteState("ready");
    },
    /**
     * Wraps all assert* methods included in qx.dev.unit.TestCase in try/catch
     * blocks. For each caught exception, a data event containing the Error
     * object will be fired on the test class. This allows the Testrunner to
     * mark the test as failed while any code following an assertion call will
     * still be executed. Aborting the test execution whenever an assertion
     * fails has caused some extremely hard to debug problems in the qooxdoo
     * framework unit tests in the past.
     *
     * Doing this in the Testrunner application is a temporary solution: It
     * really should be done in qx.dev.unit.TestCase, but that would break
     * backwards compatibility with the existing testrunner component. Once
     * testrunner has fully replaced testrunner, this code should be moved.
     *
     * @param autWindow {DOMWindow?} The test application's window. Default: The
     * Testrunner's window.
     */
    _wrapAssertions : function(autWindow){

      var win = autWindow || window;
      var tCase = win.qx.dev.unit.TestCase.prototype;
      for(var prop in tCase){

        if((prop.indexOf("assert") == 0 || prop === "fail") && typeof tCase[prop] == "function"){

          // store original assertion func
          var originalName = "__" + prop;
          tCase[originalName] = tCase[prop];
          // create wrapped assertion func
          var body = 'var argumentsArray = qx.lang.Array.fromArguments(arguments);' + 'try {' + 'this[arguments.callee.originalName].apply(this, argumentsArray);' + '} catch(ex) {' + 'this.fireDataEvent("assertionFailed", ex);' + '}';
          // need to use the AUT window's Function since IE 6/7/8 can't catch
          // exceptions from other windows.
          tCase[prop] = new win.Function(body);
          tCase[prop].originalName = originalName;
        };
      };
    },
    /**
     * Run the selected tests
     */
    _runTests : function(){

      if(this.getTestSuiteState() === "aborted"){

        this.setTestSuiteState("ready");
      };
      this.runTests();
    },
    /**
     * Stop executing tests
     */
    _stopTests : function(){

      this.setTestSuiteState("aborted");
    },
    /**
     * Runs all tests in the list.
     */
    runTests : function(){

      var self = this;
      var suiteState = this.getTestSuiteState();
      switch(suiteState){case "loading":
      this.__cT = [];
      break;case "ready":case "finished":
      if(this.testList.length > 0){

        this.setTestSuiteState("running");
      } else {

        return;
      };
      break;case "aborted":case "error":
      return;};
      if(this.testList.length == 0){

        window.setTimeout(function(){

          self.setTestSuiteState("finished");
          self.exit();
        }, 250);
        return;
      };
      var currentTest = this.currentTestData = this.testList.shift();
      currentTest.resetState();
      this.setTestCount(this.testList.length);
      var className = currentTest.parent.fullName;
      var functionName = currentTest.getName();
      var testResult = this.__cV(currentTest);
      window.setTimeout(function(){

        self.loader.runTests(testResult, className, functionName);
      }, 5);
    },
    /**
     * Terminates the Java VM
     */
    exit : function(){

      if(qx.core.Environment.get("runtime.name") == "rhino"){

        java.lang.System.exit(0);
      };
    },
    /**
     * Returns a new instance of the class that executes the tests
     *
     * @return {qx.dev.unit.TestResult} TestResult instance
     */
    _getTestResult : function(){

      return new qx.dev.unit.TestResult();
    },
    /**
     * Creates the TestResult object that will run the actual test functions.
     * @return {qx.dev.unit.TestResult} The configured TestResult object
     */
    __cV : function(){

      var testResult = this._getTestResult();
      testResult.addListener("startTest", function(e){

        var test = e.getData();
        if(this.currentTestData){

          if(this.currentTestData.fullName === test.getFullName() && this.currentTestData.getState() == "wait"){

            // test is in wait state, don't add it to the view again
            this.currentTestData.setState(this.currentTestData.getPreviousState() || "start");
            return;
          } else {

            // test was executed before, clear old exceptions
            this.currentTestData.setExceptions([]);
          };
        };
        if(!qx.lang.Array.contains(this.__cT, this.currentTestData.fullName)){

          this.view.addTestResult(this.currentTestData);
          this.__cT.push(this.currentTestData.fullName);
        };
      }, this);
      testResult.addListener("wait", this._onTestWait, this);
      testResult.addListener("failure", this._onTestFailure, this);
      testResult.addListener("error", this._onTestError, this);
      testResult.addListener("skip", this._onTestSkip, this);
      testResult.addListener("endTest", this._onTestEnd, this);
      testResult.addListener("endMeasurement", this._onTestEndMeasurement, this);
      return testResult;
    },
    /**
     * Sets the "wait" state for async tests
     *
     * @param ev {qx.event.type.Data} "wait" event
     */
    _onTestWait : function(ev){

      this.currentTestData.setState("wait");
    },
    /**
     * Records any (assertion) exceptions that caused a test to fail
     *
     * @param ev {qx.event.type.Data} "failure" event
     */
    _onTestFailure : function(ev){

      this.__cW(this.currentTestData, ev.getData());
      if(this.currentTestData.getState() === "failure"){

        this.currentTestData.resetState();
      };
      this.currentTestData.setState("failure");
    },
    /**
     * Records any unexpected exceptions that occurred during test execution
     *
     * @param ev {qx.event.type.Data} "error" event
     */
    _onTestError : function(ev){

      this.__cW(this.currentTestData, ev.getData());
      if(this.currentTestData.getState() === "error"){

        this.currentTestData.resetState();
      };
      this.currentTestData.setState("error");
    },
    /**
     * Records any exceptions that caused a test to be skipped
     *
     * @param ev {qx.event.type.Data} "skip" event
     */
    _onTestSkip : function(ev){

      this.__cW(this.currentTestData, ev.getData());
      if(this.currentTestData.getState() === "skip"){

        this.currentTestData.resetState();
      };
      this.currentTestData.setState("skip");
    },
    /**
     * Starts the next test
     *
     * @param ev {qx.event.type.Data} "endTest" event
     */
    _onTestEnd : function(ev){

      var state = this.currentTestData.getState();
      if(state == "start"){

        this.currentTestData.setState("success");
      };
      qx.event.Timer.once(this.runTests, this, 0);
    },
    /**
     * Records any exceptions that occurred during a performance test
     *
     * @param ev {qx.event.type.Data} "endMeasurement" event
     */
    _onTestEndMeasurement : function(ev){

      this.__cW(this.currentTestData, ev.getData());
      var url = qx.core.Environment.get("testrunner.reportPerfResultUrl");
      if(url){

        var measureData = ev.getData()[0].exception.getData();
        measureData.testname = this.currentTestData.getFullName();
        measureData.browsername = qx.core.Environment.get("browser.name");
        measureData.browserversion = qx.core.Environment.get("browser.version");
        measureData.osname = qx.core.Environment.get("os.name") || "unknown";
        measureData.osversion = qx.core.Environment.get("os.version") || "unknown";
        var parsedUri = qx.util.Uri.parseUri(location.href);
        if(parsedUri.queryKey && parsedUri.queryKey.branch){

          measureData.branch = parsedUri.queryKey.branch;
        };
        url += "?" + qx.util.Uri.toParameter(measureData, false);
        var req = new qx.bom.request.Script();
        req.open("GET", url);
        req.send();
      };
    },
    /**
     * Adds exception information to an existing TestResult object, making sure
     * no duplicates are recorded.
     *
     * @param testResult {qx.dev.unit.TestResult} TestResult object
     * @param exceptions {Object[]} List of exception objects
     */
    __cW : function(testResult, exceptions){

      var oldEx = testResult.getExceptions();
      var newEx = oldEx.concat();
      for(var i = 0,l = exceptions.length;i < l;i++){

        var newExMsg = exceptions[i].exception.toString();
        var dupe = false;
        for(var j = 0,m = oldEx.length;j < m;j++){

          var oldExMsg = oldEx[j].exception.toString();
          if(newExMsg === oldExMsg){

            dupe = true;
            break;
          };
        };
        if(!dupe){

          newEx.push(exceptions[i]);
        };
      };
      testResult.setExceptions(newEx);
    },
    /**
     * Sets the list of pending tests to those selected by the user.
     *
     * @param value {String[]} Selected tests
     * @param old {String[]} Previous value
     */
    _applySelectedTests : function(value, old){

      if(!value){

        return;
      };
      if(old){

        old.removeListener("change", this._onChangeTestSelection, this);
      };
      value.addListener("change", this._onChangeTestSelection, this);
      this._onChangeTestSelection();
    },
    /**
     * Sets the pending test list and count according to the selection
     */
    _onChangeTestSelection : function(){

      this.testList = this._getFlatTestList();
      // Make sure the value is applied even if it didn't change so the view is
      // updated
      if(this.testList.length == this.getTestCount()){

        this.resetTestCount();
      };
      this.setTestCount(this.testList.length);
    },
    /**
     * Returns an array containing all "test" children of the current test
     * selection
     *
     * @return {Object[]} Test array
     */
    _getFlatTestList : function(){

      var selection = this.getSelectedTests();
      if(selection.length == 0){

        return new qx.data.Array();
      };
      var testList = [];
      for(var i = 0,l = selection.length;i < l;i++){

        var item = selection.getItem(i);
        var testsFromItem = testrunner.runner.ModelUtil.getItemsByProperty(item, "type", "test");
        testList = testList.concat(testsFromItem);
      };
      return testList;
    },
    /**
     * Logs any errors caught by qooxdoo's global error handling.
     *
     * @param ex{Error} Caught exception
     */
    _handleGlobalError : function(ex){

      this.error(ex);
    }
  },
  destruct : function(){

    this.view.removeListener("runTests", this._runTests, this);
    this.view.removeListener("stopTests", this._stopTests, this);
    this.removeAllBindings();
    if(this.getTestModel()){

      this.getTestModel().dispose();
    };
    this._disposeArray("testsInView");
    this._disposeArray("testList");
    this._disposeArray("testPackageList");
    this._disposeObjects("view", "currentTestData", "loader");
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */
/**
 * Provides support for performance tests
 */
qx.Mixin.define("testrunner.view.MPerformance", {
  construct : function(){

    this.__cX = [];
  },
  properties : {
    /**
     * Whether the browser's built-in profiling capabilities
     * (<code>console.profile</code>) should additionally be used for
     * performance tests
     */
    nativeProfiling : {
      check : "Boolean",
      init : false
    }
  },
  members : {
    __cX : null,
    /**
     * Adds an entry to the stored results
     *
     * @param clazz {String} Name of the test class
     * @param msg {String} Test description
     * @param iterations {Integer} Number of iterations
     * @param ownTime {Integer} JavaScript execution time
     * @param renderTime {Integer} browser rendering time
     */
    logMeasurement : function(clazz, msg, iterations, ownTime, renderTime){

      this.__cX.push([clazz, msg, iterations, ownTime, renderTime].join("; "));
    },
    /**
     * Whether the browser's built-in profiling capabilities (console.profile)
     * should (additionally) be used for performance tests
     *
     * @deprecated {2.0} since 2.0
     * @return {Boolean} <code>true</code> if native profiling should be used
     */
    getProfile : function(){

      qx.log.Logger.deprecatedMethodWarning(arguments.callee, "Please use getNativeProfiling instead");
      return this.getNativeProfiling();
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Daniel Wagner (d_wagner)

************************************************************************ */
/**
 * This mixin contains the methods needed to implement a loader that will
 * create a suite of unit tests from a given namespace and run it directly or
 * provide the necessary information to a more advanced runner application
 */
qx.Mixin.define("qx.dev.unit.MTestLoader", {
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties : {
    /** The test suite */
    suite : {
      check : "qx.dev.unit.TestSuite",
      nullable : true,
      init : null
    }
  },
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  members : {
    /**
     * Parses the url parameters and tries to find the classes to test.
     * The pattern is like <code>index.html?testclass=qx.test</code>
     *
     * @return {String} the class/namespace to test
     */
    _getClassNameFromUrl : function(){

      var params = window.location.search;
      var className = params.match(/[\?&]testclass=([A-Za-z0-9_\.]+)/);
      if(className){

        className = className[1];
      } else {

        className = "__unknown_class__";
      };
      return className;
    },
    /**
     * Sets the top level namespace of the test cases to test. All classes
     * below this namespace extending {@link TestCase} will be tested.
     *
     * @param namespace {Object} Namespace to add
     */
    setTestNamespace : function(namespace){

      var suite = new qx.dev.unit.TestSuite();
      suite.add(namespace);
      this.setSuite(suite);
    },
    /**
     * Run all tests and export the results to JSUnit
     */
    runJsUnit : function(){

      var testResult = new qx.dev.unit.JsUnitTestResult();
      this.getSuite().run(testResult);
      testResult.exportToJsUnit();
    },
    /**
     * Run tests as standalone application
     */
    runStandAlone : function(){

      var testResult = new qx.dev.unit.TestResult();
      testResult.addListener("failure", function(e){

        var ex = e.getData()[0].exception;
        var test = e.getData()[0].test;
        this.error("Test '" + test.getFullName() + "' failed: " + ex.message + " - " + ex.getComment());
        if(ex.getStackTrace){

          this.error("Stack trace: " + ex.getStackTrace().join("\n"));
        };
      }, this);
      testResult.addListener("error", function(e){

        var ex = e.getData()[0].exception;
        var test = e.getData()[0].test;
        this.error("The test '" + test.getFullName() + "' had an error: " + ex, ex);
      }, this);
      this.getSuite().run(testResult);
    },
    /**
     * Get a list of test descriptions
     *
     * @return {String} A description of all tests.
     */
    getTestDescriptions : function(){

      var desc = [];
      var classes = this.getSuite().getTestClasses();
      for(var i = 0;i < classes.length;i++){

        var cls = classes[i];
        var clsDesc = {
        };
        clsDesc.classname = cls.getName();
        clsDesc.tests = [];
        var methods = cls.getTestMethods();
        for(var j = 0;j < methods.length;j++){

          clsDesc.tests.push(methods[j].getName());
        };
        desc.push(clsDesc);
      };
      return qx.lang.Json.stringify(desc);
    },
    /**
     * Runs exactly one test from the test suite
     *
     * @param testResult {TestResult} the result logger
     * @param className {String} Name of the test class
     * @param methodName {String} Name of the test method
     */
    runTests : function(testResult, className, methodName){

      var classes = this.getSuite().getTestClasses();
      for(var i = 0;i < classes.length;i++){

        if(className == classes[i].getName()){

          var methods = classes[i].getTestMethods();
          for(var j = 0;j < methods.length;j++){

            if(methodName && methods[j].getName() != methodName){

              continue;
            };
            methods[j].run(testResult);
          };
          return;
        };
      };
    },
    /**
     * Runs all tests inside of the given namespace
     *
     * @param testResult {TestResult} the result logger
     * @param namespaceName {String} Namespace of the tests to run
     */
    runTestsFromNamespace : function(testResult, namespaceName){

      var classes = this.getSuite().getTestClasses();
      for(var i = 0;i < classes.length;i++){

        if(classes[i].getName().indexOf(namespaceName) == 0){

          classes[i].run(testResult);
        };
      };
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */
/**
 * A TestSuite is a collection of test functions, classes and other test suites,
 * which should be run together.
 */
qx.Class.define("qx.dev.unit.AbstractTestSuite", {
  extend : qx.core.Object,
  type : "abstract",
  construct : function(){

    qx.core.Object.call(this);
    this._tests = [];
  },
  members : {
    _tests : null,
    /**
     * Add a single function to test
     *
     * @param name {String} Name of the function
     * @param fcn {Function} The test function
     */
    addTestFunction : function(name, fcn){

      this._tests.push(new qx.dev.unit.TestFunction(null, name, fcn));
    },
    /**
     * Add a method from a class as test to the suite
     *
     * @param testCase {qx.dev.unit.TestCase} The class containing the test method
     * @param functionName {String} The name of the test method
     */
    addTestMethod : function(testCase, functionName){

      this._tests.push(new qx.dev.unit.TestFunction(testCase, functionName));
    },
    /**
     * Add a test function to the suite, which fails.
     *
     * @param functionName {String} Name of the function
     * @param message {String} The fail message
     */
    addFail : function(functionName, message){

      this.addTestFunction(functionName, function(){

        this.fail(message);
      });
    },
    /**
     * Run all tests using the given test result
     *
     * @param testResult {TestResult} Test result class, which runs the tests.
     */
    run : function(testResult){

      for(var i = 0;i < this._tests.length;i++){

        (this._tests[i]).run(testResult);
      };
    },
    /**
     * Get a list of all test methods in the suite
     *
     * @return {Function[]} A list of all test methods in the suite
     */
    getTestMethods : function(){

      var methods = [];
      for(var i = 0;i < this._tests.length;i++){

        var test = this._tests[i];
        if(test instanceof qx.dev.unit.TestFunction){

          methods.push(test);
        };
      };
      return methods;
    }
  },
  destruct : function(){

    this._disposeArray("_tests");
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Daniel Wagner (d_wagner)

************************************************************************ */
/**
 * Wrapper object for a method containing unit test code.
 */
qx.Class.define("qx.dev.unit.TestFunction", {
  extend : qx.core.Object,
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  /**
   * There are two ways to define a test function. First by passing a class
   * and a method name to the contructor or second by giving a the method
   * directly.
   *
   * @param testCase {qx.dev.unit.TestCase?null} The test class, which contains the test method
   * @param methodName {String?null} The name of the method
   * @param testFunction {Function?null} A reference to a test function. If this
   *    parameter is set the other parameters are ignored.
   */
  construct : function(testCase, methodName, testFunction){

    if(testFunction){

      this.setTestFunction(testFunction);
    };
    if(testCase){

      this.setClassName(testCase.classname);
      this.setTestClass(testCase);
    };
    this.setName(methodName);
  },
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties : {
    /** The test function */
    testFunction : {
      check : "Function"
    },
    /** Name of the test */
    name : {
      check : "String"
    },
    /** Name of the class containing the test */
    className : {
      check : "String",
      init : ""
    },
    /** The test class */
    testClass : {
      check : "qx.dev.unit.TestCase",
      init : null
    }
  },
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members : {
    /**
     * Runs the test and logs the test result to a {@link TestResult} instance,
     *
     * @param testResult {TestResult} The class used to log the test result.
     */
    run : function(testResult){

      var inst = this.getTestClass();
      var method = this.getName();
      var testFunc = this;
      testResult.run(this, function(){

        inst.setTestFunc(testFunc);
        inst.setTestResult(testResult);
        try{

          inst[method]();
        } catch(ex) {

          throw ex;
        };
      });
    },
    /**
     * Call the test class' <code>setUp</code> method.
     */
    setUp : function(){

      var inst = this.getTestClass();
      if(qx.lang.Type.isFunction(inst.setUp)){

        inst.setUp();
      };
    },
    /**
     * Call the test class' <code>tearDown</code> method.
     */
    tearDown : function(){

      var inst = this.getTestClass();
      if(qx.lang.Type.isFunction(inst.tearDown)){

        inst.tearDown();
      };
    },
    /**
     * Get the full name of the test.
     *
     * @return {String} The test's full name
     */
    getFullName : function(){

      return [this.getClassName(), this.getName()].join(":");
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */
/**
 * A TestSuite is a collection of test functions, classes and other test suites,
 * which should be run together.
 */
qx.Class.define("qx.dev.unit.TestSuite", {
  extend : qx.dev.unit.AbstractTestSuite,
  /**
   * @param testClassOrNamespace {var} Either a string with the name of the test
   *    class or test namespace or a reference to the test class or namespace.
   *    All test in the given class/namespace will be added to the suite.
   */
  construct : function(testClassOrNamespace){

    qx.dev.unit.AbstractTestSuite.call(this);
    this._tests = [];
    if(testClassOrNamespace){

      this.add(testClassOrNamespace);
    };
  },
  members : {
    /**
     * Add a test class or namespace to the suite
     *
     * @lint ignoreDeprecated(alert, eval)
     *
     * @param testClassOrNamespace {var} Either a string with the name of the test
     *    class or test namespace or a reference to the test class or namespace.
     *    All test in the given class/namespace will be added to the suite.
     */
    add : function(testClassOrNamespace){

      // This try-block is needed to avoid errors (e.g. "too much recursion")
      //      try
      //      {
      if(qx.lang.Type.isString(testClassOrNamespace)){

        var evalTestClassOrNamespace = window.eval(testClassOrNamespace);
        if(!evalTestClassOrNamespace){

          this.addFail(testClassOrNamespace, "The class/namespace '" + testClassOrNamespace + "' is undefined!");
        };
        testClassOrNamespace = evalTestClassOrNamespace;
      };
      if(qx.lang.Type.isFunction(testClassOrNamespace)){

        this.addTestClass(testClassOrNamespace);
      } else if(qx.lang.Type.isObject(testClassOrNamespace)){

        this.addTestNamespace(testClassOrNamespace);
      } else {

        this.addFail("existsCheck", "Unknown test class '" + testClassOrNamespace + "'!");
        return;
      };
    },
    /**
     * Add all tests from the given namespace to the suite
     *
     * @param namespace {Object} The topmost namespace of the tests classes to add.
     */
    addTestNamespace : function(namespace){

      if(qx.lang.Type.isFunction(namespace) && namespace.classname){

        if(qx.Class.isSubClassOf(namespace, qx.dev.unit.TestCase)){

          if(namespace.$$classtype !== "abstract"){

            this.addTestClass(namespace);
          };
          return;
        };
      } else if(qx.lang.Type.isObject(namespace) && !(namespace instanceof Array)){

        for(var key in namespace){

          this.addTestNamespace(namespace[key]);
        };
      };
    },
    /**
     * Add a test class to the suite
     *
     * @param clazz {Class} The test class to add
     */
    addTestClass : function(clazz){

      this._tests.push(new qx.dev.unit.TestClass(clazz));
    },
    /**
     * Get a list of all test classes in the suite
     *
     * @return {Class[]} A list of all test classes in the suite
     */
    getTestClasses : function(){

      var classes = [];
      for(var i = 0;i < this._tests.length;i++){

        var test = this._tests[i];
        if(test instanceof qx.dev.unit.TestClass){

          classes.push(test);
        };
      };
      return classes;
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Daniel Wagner (d_wagner)

************************************************************************ */
/**
 * Base class for all unit tests.
 */
qx.Class.define("qx.dev.unit.TestCase", {
  extend : qx.core.Object,
  include : [qx.core.MAssert],
  events : {
    /**
     * This event can be fired by assertion functions instead of throwing a
     * {@link qx.core.AssertionError}, ensuring that any code defined after the
     * assertion call will still run.
     *
     * Event data: The {@link qx.core.AssertionError}
     */
    assertionFailed : "qx.event.type.Data"
  },
  properties : {
    /** The TestResult instance that runs the test */
    testResult : {
      init : null
    },
    /** The test currently running */
    testFunc : {
      init : null
    }
  },
  members : {
    /**
     * Whether If debugging code is enabled. (i.e. the setting
     * <code>qx.debug</code> has the value <code>on</code>.)
     *
     * @return {Boolean} Whether debugging is enabled
     */
    isDebugOn : function(){

      return (qx.core.Environment.get("qx.debug")) ? true : false;
    },
    /**
     * Instruct the test to wait. Used for asynchronous tests.
     *
     * @param delay {Integer?5000} Amount of time in milliseconds to wait.
     * @param deferredFunction {Function?false} Optional function to run after
     * timeout has expired.
     * @param context {Object?window} Optional execution context for
     * deferredFunction
     */
    wait : function(delay, deferredFunction, context){

      throw new qx.dev.unit.AsyncWrapper(delay, deferredFunction, context);
    },
    /**
     * Cancel a timeout started with <code>wait()</code> and run the given
     * function. Used for asynchronous tests, e.g. in a listener's callback
     * function.
     *
     * *Important*
     *
     * The used *deferredFunction* is the last function which is executed before
     * the whole test case is disposed. But you are able to use a new
     * <code>wait()</code> / <code>resume()</code> pair in the call sequence of the deferred function.
     *
     * @param deferredFunction {Function?} Function to run
     * @param self {Object?} reference to the ‘this’ variable inside the
     * callback. By default the test instance is used.
     */
    resume : function(deferredFunction, self){

      this.getTestResult().run(this.getTestFunc(), deferredFunction || (function(){
      }), self || this, true);
    },
    /**
     * Cancel a timeout started with <code>wait()</code> and return a function,
     * which calls {@link #resume}. This function is useful
     * to wrap an event handler or callback function within the resume call sequence.
     * It provides the deferred function with all parameters from original caller.
     <pre>
      obj.addListener("appear", this.resumeHandler(function(e){
        // do some nice
      }));
    
      this.wait();
     </pre>
     * @param deferredFunction {Function} Function to run as event handler or callback
     * @param self {Object?} reference to the ‘this’ variable inside the
     * callback. By default the test instance is used.
     * @return {Function} Wrapper function which runs resume with deferred function
     */
    resumeHandler : function(deferredFunction, self){

      if(qx.core.Environment.get("qx.debug")){

        this.assertFunction(deferredFunction, "First parameter of resumeHandler() must be a function!");
      };
      var func = deferredFunction;
      var that = this;
      return function(){

        // bind arguments to deferŕedFunction
        var args = qx.lang.Array.fromArguments(arguments);
        that.resume(func.bind.apply(func, [self || this].concat(args)), self);
      };
    },
    /**
     * Skip this test. Any code after a call to this method will not be executed.
     *
     * @param message {String|null} Optional message (reason why the test was skipped)
     */
    skip : function(message){

      throw new qx.dev.unit.RequirementError(null, message || "Called skip()");
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */
/**
 *  This class stores the information needed to instruct a running test to wait.
 *  It is thrown as an exception to be caught by the method executing the test.
 */
qx.Class.define("qx.dev.unit.AsyncWrapper", {
  extend : qx.core.Object,
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  /**
   * @param delay {Integer?} The amount of time in milliseconds to wait
   * @param deferredFunction {Function?} The function to run after the timeout
   * has expired.
   * @param context {Object?window} Optional execution context for deferredFunction
   */
  construct : function(delay, deferredFunction, context){

    for(var i = 0;i < 2;i++){

      if(qx.lang.Type.isFunction(arguments[i])){

        this.setDeferredFunction(arguments[i]);
      } else if(qx.lang.Type.isNumber(arguments[i])){

        this.setDelay(arguments[i]);
      };
    };
    if(context){

      this.setContext(context);
    };
  },
  properties : {
    /** The function to run after the timeout has expired */
    deferredFunction : {
      check : "Function",
      init : false
    },
    /** The context in which the timeout function should be executed  */
    context : {
      check : "Object",
      init : null
    },
    /** The amount of time in milliseconds to wait */
    delay : {
      check : "Integer",
      nullable : false,
      init : 5000
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */
/**
 * This error is thrown by the unit test class if an infrastructure requirement
 * is not met. The unit testing framework should skip the test and visually mark
 * the test as not having been executed.
 */
qx.Class.define("qx.dev.unit.RequirementError", {
  extend : Error,
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  /**
   * @param requirement {String?} The requirement ID, e.g. "SSL"
   * @param message {String?} Optional error message
   */
  construct : function(requirement, message){

    this.__cY = message || "Requirement not met";
    this.__da = requirement;
    var inst = Error.call(this, this.__cY);
    // map stack trace properties since they're not added by Error's constructor
    if(inst.stack){

      this.stack = inst.stack;
    };
    if(inst.stacktrace){

      this.stacktrace = inst.stacktrace;
    };
  },
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members : {
    __cY : null,
    __da : null,
    /**
     * Returns the ID of the requirement that was not satisfied.
     *
     * @return {String} The requirement ID
     */
    getRequirement : function(){

      return this.__da;
    },
    /**
     * Returns a string representation of the error.
     *
     * @return {String} Error message
     */
    toString : function(){

      var msg = this.__cY;
      if(this.__da){

        msg += ": " + this.__da;
      };
      return msg;
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */
/**
 * This class represents a test suite for an unit test class.
 *
 * To create your own unit tests, create a class that derives from this one, and
 * add member methods that start with "test*". You can use assertion methods
 * inherited from *TestClass* to ease the implementation process.
 *
 * A simple example:
 * <pre class='javascript'>
 * qx. Class.define("myapp.test.MyUnitTest"),
 * {
 *   extend  : qx.dev.unit.TestCase,
 *
 *   members :
 *   {
 *     testMe : function ()
 *     {
 *       // 'assertEquals' is from the parent
 *       this.assertEquals(4, 3+1, "failure message");
 *     }
 *   }
 * }
 * </pre>
 */
qx.Class.define("qx.dev.unit.TestClass", {
  extend : qx.dev.unit.AbstractTestSuite,
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  /**
   * @param clazz {Class} Test class. Must be a sub class of {@link TestCase}.
   */
  construct : function(clazz){

    qx.dev.unit.AbstractTestSuite.call(this);
    if(!clazz){

      this.addFail("existsCheck", "Unknown test class!");
      return;
    };
    if(!qx.Class.isSubClassOf(clazz, qx.dev.unit.TestCase)){

      this.addFail("Sub class check.", "The test class '" + clazz.classname + "'is not a sub class of 'qx.dev.unit.TestCase'");
      return;
    };
    var proto = clazz.prototype;
    var testCase = new clazz;
    for(var test in proto){

      if(qx.lang.Type.isFunction(proto[test]) && test.indexOf("test") == 0){

        this.addTestMethod(testCase, test);
      };
    };
    this.setName(clazz.classname);
  },
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties : {
    /** Name of the test suite */
    name : {
      check : "String"
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Daniel Wagner (d_wagner)

************************************************************************ */
/**
 * The test result class runs the test functions and fires events depending on
 * the result of the test run.
 */
qx.Class.define("qx.dev.unit.TestResult", {
  extend : qx.core.Object,
  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */
  events : {
    /**
     * Fired before the test is started
     *
     * Event data: The test {@link qx.dev.unit.TestFunction}
     */
    startTest : "qx.event.type.Data",
    /** Fired after the test has finished
     *
     * Event data: The test {@link qx.dev.unit.TestFunction}
     */
    endTest : "qx.event.type.Data",
    /**
     * Fired if the test raised an {@link qx.core.AssertionError}
     *
     * Event data: The test {@link qx.dev.unit.TestFunction}
     */
    error : "qx.event.type.Data",
    /**
     * Fired if the test failed with a different exception
     *
     * Event data: The test {@link qx.dev.unit.TestFunction}
     */
    failure : "qx.event.type.Data",
    /**
     * Fired if an asynchronous test sets a timeout
     *
     * Event data: The test {@link qx.dev.unit.TestFunction}
     */
    wait : "qx.event.type.Data",
    /**
     * Fired if the test was skipped, e.g. because a requirement was not met.
     *
     * Event data: The test {@link qx.dev.unit.TestFunction}
     */
    skip : "qx.event.type.Data",
    /**
     * Fired if a performance test returned results.
     *
     * Event data: The test {@link qx.dev.unit.TestFunction}
     */
    endMeasurement : "qx.event.type.Data"
  },
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  statics : {
    /**
     * Run a test function using a given test result
     *
     * @param testResult {TestResult} The test result to use to run the test
     * @param test {TestSuite|TestFunction} The test
     * @param testFunction {var} The test function
     */
    run : function(testResult, test, testFunction){

      testResult.run(test, testFunction);
    }
  },
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members : {
    _timeout : null,
    /**
     * Run the test
     *
     * @param test {TestSuite|TestFunction} The test
     * @param testFunction {Function} The test function
     * @param self {Object?} The context in which to run the test function
     * @param resume {Boolean?} Resume a currently waiting test
     */
    run : function(test, testFunction, self, resume){

      if(!this._timeout){

        this._timeout = {
        };
      };
      var testClass = test.getTestClass();
      if(!testClass.hasListener("assertionFailed")){

        testClass.addListener("assertionFailed", function(ev){

          var error = [{
            exception : ev.getData(),
            test : test
          }];
          this.fireDataEvent("failure", error);
        }, this);
      };
      if(resume && !this._timeout[test.getFullName()]){

        this._timeout[test.getFullName()] = "failed";
        var qxEx = new qx.type.BaseError("Error in asynchronous test", "resume() called before wait()");
        this._createError("failure", [qxEx], test);
        this.fireDataEvent("endTest", test);
        return;
      };
      this.fireDataEvent("startTest", test);
      if(qx.core.Environment.get("qx.debug.dispose")){

        qx.dev.Debug.startDisposeProfiling();
      };
      if(this._timeout[test.getFullName()]){

        if(this._timeout[test.getFullName()] !== "failed"){

          this._timeout[test.getFullName()].stop();
          this._timeout[test.getFullName()].dispose();
        };
        delete this._timeout[test.getFullName()];
      } else {

        try{

          test.setUp();
        } catch(ex) {

          try{

            this.tearDown(test);
          } catch(except) {
          };
          if(ex.classname == "qx.dev.unit.RequirementError"){

            this._createError("skip", [ex], test);
            this.fireDataEvent("endTest", test);
          } else {

            if(ex instanceof qx.type.BaseError && ex.message == qx.type.BaseError.DEFAULTMESSAGE){

              ex.message = "setUp failed";
            } else {

              ex.message = "setUp failed: " + ex.message;
            };
            this._createError("error", [ex], test);
            this.fireDataEvent("endTest", test);
          };
          return;
        };
      };
      try{

        testFunction.call(self || window);
      } catch(ex) {

        var error = true;
        if(ex instanceof qx.dev.unit.AsyncWrapper){

          if(this._timeout[test.getFullName()]){

            // Do nothing if there's already a timeout for this test
            return;
          };
          if(ex.getDelay()){

            var that = this;
            var defaultTimeoutFunction = function(){

              throw new qx.core.AssertionError("Asynchronous Test Error", "Timeout reached before resume() was called.");
            };
            var timeoutFunc = (ex.getDeferredFunction() ? ex.getDeferredFunction() : defaultTimeoutFunction);
            var context = (ex.getContext() ? ex.getContext() : window);
            this._timeout[test.getFullName()] = qx.event.Timer.once(function(){

              this.run(test, timeoutFunc, context);
            }, that, ex.getDelay());
            this.fireDataEvent("wait", test);
          };
        } else if(ex instanceof qx.dev.unit.MeasurementResult){

          error = false;
          this._createError("endMeasurement", [ex], test);
        } else {

          try{

            this.tearDown(test);
          } catch(except) {
          };
          if(ex.classname == "qx.core.AssertionError"){

            this._createError("failure", [ex], test);
            this.fireDataEvent("endTest", test);
          } else if(ex.classname == "qx.dev.unit.RequirementError"){

            this._createError("skip", [ex], test);
            this.fireDataEvent("endTest", test);
          } else {

            this._createError("error", [ex], test);
            this.fireDataEvent("endTest", test);
          };
        };
      };
      if(!error){

        try{

          this.tearDown(test);
          this.fireDataEvent("endTest", test);
        } catch(ex) {

          if(ex instanceof qx.type.BaseError && ex.message == qx.type.BaseError.DEFAULTMESSAGE){

            ex.message = "tearDown failed";
          } else {

            ex.message = "tearDown failed: " + ex.message;
          };
          this._createError("error", [ex], test);
          this.fireDataEvent("endTest", test);
        };
      };
    },
    /**
     * Fire an error event
     *
     * @param eventName {String} Name of the event
     * @param exceptions {Error[]} The exception(s), which caused the test to fail
     * @param test {TestSuite|TestFunction} The test
     */
    _createError : function(eventName, exceptions, test){

      var errors = [];
      for(var i = 0,l = exceptions.length;i < l;i++){

        // WebKit and Opera
        errors.push({
          exception : exceptions[i],
          test : test
        });
      };
      this.fireDataEvent(eventName, errors);
    },
    /**
     * EXPERIMENTAL
     * Wraps the AUT's qx.event.Registration.addListener function so that it
     * stores references to all added listeners in an array attached to the
     * current test function. This is done so that any listeners left over after
     * test execution can be removed to make sure they don't influence other
     * tests.
     *
     * @param testFunction {qx.dev.unit.TestFunction} The current test
     */
    __db : function(testFunction){

      testFunction._addedListeners = [];
      if(!qx.event.Registration.addListenerOriginal){

        qx.event.Registration.addListenerOriginal = qx.event.Registration.addListener;
        qx.event.Registration.addListener = function(target, type, listener, self, capture){

          var listenerId = qx.event.Registration.addListenerOriginal(target, type, listener, self, capture);
          var store = true;
          if((target.classname && target.classname.indexOf("testrunner.unit") == 0) || (self && self.classname && self.classname.indexOf("testrunner.unit") == 0)){

            store = false;
          };
          if(store){

            testFunction._addedListeners.push([target, listenerId]);
          };
          return listenerId;
        };
      };
    },
    /**
     * EXPERIMENTAL
     * Removes any listeners left over after a test's run.
     *
     * @param testFunction {qx.dev.unit.TestFunction} The current test
     */
    __dc : function(testFunction){

      // remove listeners added during test execution
      if(testFunction._addedListeners){

        var listeners = testFunction._addedListeners;
        for(var i = 0,l = listeners.length;i < l;i++){

          var target = listeners[i][0];
          var id = listeners[i][1];
          try{

            qx.event.Registration.removeListenerById(target, id);
          } catch(ex) {
          };
        };
      };
    },
    /**
     * Calls the generic tearDown method on the test class, then the specific
     * tearDown for the test, if one is defined.
     *
     * @param test {Object} The test object (first argument of {@link #run})
     */
    tearDown : function(test){

      test.tearDown();
      var testClass = test.getTestClass();
      var specificTearDown = "tearDown" + qx.lang.String.firstUp(test.getName());
      if(testClass[specificTearDown]){

        testClass[specificTearDown]();
      };
      if(qx.core.Environment.get("qx.debug.dispose") && qx.dev.Debug.disposeProfilingActive){

        var testName = test.getFullName();
        var undisposed = qx.dev.Debug.stopDisposeProfiling();
        for(var i = 0;i < undisposed.length;i++){

          var trace;
          if(undisposed[i].stackTrace){

            trace = undisposed[i].stackTrace.join("\n");
          };
          window.top.qx.log.Logger.warn("Undisposed object in " + testName + ": " + undisposed[i].object.classname + "[" + undisposed[i].object.toHashCode() + "]" + "\n" + trace);
        };
      };
    }
  },
  destruct : function(){

    this._timeout = null;
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */
/**
 * Global timer support.
 *
 * This class can be used to periodically fire an event. This event can be
 * used to simulate e.g. a background task. The static method
 * {@link #once} is a special case. It will call a function deferred after a
 * given timeout.
 */
qx.Class.define("qx.event.Timer", {
  extend : qx.core.Object,
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  /**
   * @param interval {Number} initial interval in milliseconds of the timer.
   */
  construct : function(interval){

    qx.core.Object.call(this);
    this.setEnabled(false);
    if(interval != null){

      this.setInterval(interval);
    };
    // don't use qx.lang.Function.bind because this function would add a
    // disposed check, which could break the functionality. In IE the handler
    // may get called after "clearInterval" (i.e. after the timer is disposed)
    // and we must be able to handle this.
    var self = this;
    this.__dd = function(){

      self._oninterval.call(self);
    };
  },
  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */
  events : {
    /** This event if fired each time the interval time has elapsed */
    "interval" : "qx.event.type.Event"
  },
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  statics : {
    /**
     * Start a function after a given timeout.
     *
     * @param func {Function} Function to call
     * @param obj {Object} context (this), the function is called with
     * @param timeout {Number} Number of milliseconds to wait before the
     *   function is called.
     * @return {qx.event.Timer} The timer object used for the timeout. This
     *    object can be used to cancel the timeout. Note that the timer is
     *    only valid until the timer has been executed.
     */
    once : function(func, obj, timeout){

      if(qx.core.Environment.get("qx.debug")){

        // check the given parameter
        qx.core.Assert.assertFunction(func, "func is not a function");
        qx.core.Assert.assertNotUndefined(timeout, "No timeout given");
      };
      // Create time instance
      var timer = new qx.event.Timer(timeout);
      // Bug #3481: append original function to timer instance so it can be
      // read by a debugger
      timer.__de = func;
      // Add event listener to interval
      timer.addListener("interval", function(e){

        timer.stop();
        func.call(obj, e);
        timer.dispose();
        obj = null;
      }, obj);
      // Directly start timer
      timer.start();
      return timer;
    }
  },
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties : {
    /**
     * With the enabled property the Timer can be started and suspended.
     * Setting it to "true" is equivalent to {@link #start}, setting it
     * to "false" is equivalent to {@link #stop}.
     */
    enabled : {
      init : true,
      check : "Boolean",
      apply : "_applyEnabled"
    },
    /**
     * Time in milliseconds between two callback calls.
     * This property can be set to modify the interval of
     * a running timer.
     */
    interval : {
      check : "Integer",
      init : 1000,
      apply : "_applyInterval"
    }
  },
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members : {
    __df : null,
    __dd : null,
    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */
    /**
     * Apply the interval of the timer.
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyInterval : function(value, old){

      if(this.getEnabled()){

        this.restart();
      };
    },
    /**
     * Apply the enabled state of the timer.
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyEnabled : function(value, old){

      if(old){

        window.clearInterval(this.__df);
        this.__df = null;
      } else if(value){

        this.__df = window.setInterval(this.__dd, this.getInterval());
      };
    },
    /*
    ---------------------------------------------------------------------------
      USER-ACCESS
    ---------------------------------------------------------------------------
    */
    /**
     * Start the timer
     *
     */
    start : function(){

      this.setEnabled(true);
    },
    /**
     * Start the timer with a given interval
     *
     * @param interval {Integer} Time in milliseconds between two callback calls.
     */
    startWith : function(interval){

      this.setInterval(interval);
      this.start();
    },
    /**
     * Stop the timer.
     *
     */
    stop : function(){

      this.setEnabled(false);
    },
    /**
     * Restart the timer.
     * This makes it possible to change the interval of a running timer.
     *
     */
    restart : function(){

      this.stop();
      this.start();
    },
    /**
     * Restart the timer. with a given interval.
     *
     * @param interval {Integer} Time in milliseconds between two callback calls.
     */
    restartWith : function(interval){

      this.stop();
      this.startWith(interval);
    },
    /*
    ---------------------------------------------------------------------------
      EVENT-MAPPER
    ---------------------------------------------------------------------------
    */
    /**
     * timer callback
     *
     * @signature function()
     */
    _oninterval : qx.event.GlobalError.observeMethod(function(){

      if(this.$$disposed){

        return;
      };
      if(this.getEnabled()){

        this.fireEvent("interval");
      };
    })
  },
  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */
  destruct : function(){

    if(this.__df){

      window.clearInterval(this.__df);
    };
    this.__df = this.__dd = null;
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */
/**
 * Performance test result object. Used to communicate measurements to the unit
 * testing framework.
 */
qx.Class.define("qx.dev.unit.MeasurementResult", {
  extend : Object,
  /**
   *
   * @param message {String} Description
   * @param iterations {Number} Amount of times the tested code was executed
   * @param ownTime {Number} Elapsed JavaScript execution time
   * @param renderTime {Number} Elapsed DOM rendering time
   */
  construct : function(message, iterations, ownTime, renderTime){

    this.__cY = message;
    this.__dg = iterations;
    this.__dh = ownTime;
    this.__di = renderTime;
  },
  members : {
    __cY : null,
    __dg : null,
    __dh : null,
    __di : null,
    /**
     * Returns the stored data as a map.
     * @return {Map} The stored data.
     */
    getData : function(){

      return {
        message : this.__cY,
        iterations : this.__dg,
        ownTime : this.__dh,
        renderTime : this.__di
      };
    },
    /**
     * Returns a readable summary of this result
     *
     * @return {String} Result summary
     */
    toString : function(){

      return ["Measured: " + this.__cY, "Iterations: " + this.__dg, "Time: " + this.__dh + "ms", "Render time: " + this.__di + "ms"].join("\n");
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */
/**
 * Test result class, which can export the results to JSUnit
 */
qx.Class.define("qx.dev.unit.JsUnitTestResult", {
  extend : qx.dev.unit.TestResult,
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct : function(){

    qx.dev.unit.TestResult.call(this);
    this.__dj = [];
  },
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members : {
    __dj : null,
    /**
     * Run the test
     * @param test {TestFunction} The test.
     * @param testFunction {Function} A reference to a test function.
     */
    run : function(test, testFunction){

      var testFunctionName = "$test_" + test.getFullName().replace(/\W/g, "_");
      this.__dj.push(testFunctionName);
      window[testFunctionName] = testFunction;
    },
    /**
     * Export the test functions to JSUnit
     */
    exportToJsUnit : function(){

      var self = this;
      // global
      window.exposeTestFunctionNames = function(){

        return self.__dj;
      };
      // global
      window.isTestPageLoaded = true;
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */
/**
 * Test loader for server-side/"headless" environments
 */
qx.Class.define("qx.dev.unit.TestLoaderBasic", {
  extend : qx.core.Object,
  include : [qx.dev.unit.MTestLoader],
  /**
   *
   * @param nameSpace {String} Test namespace, e.g. myapplication.test.*
   */
  construct : function(nameSpace){

    if(nameSpace){

      this.setTestNamespace(nameSpace);
    };
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Defines the methods needed by every marshaler which should work with the
 * qooxdoo data stores.
 */
qx.Interface.define("qx.data.marshal.IMarshaler", {
  members : {
    /**
     * Creates for the given data the needed classes. The classes contain for
     * every key in the data a property. The classname is always the prefix
     * <code>qx.data.model</code>. Two objects containing the same keys will not
     * create two different classes.
     *
     * @param data {Object} The object for which classes should be created.
     * @param includeBubbleEvents {Boolean} Whether the model should support
     *   the bubbling of change events or not.
     */
    toClass : function(data, includeBubbleEvents){
    },
    /**
     * Creates for the given data the needed models. Be sure to have the classes
     * created with {@link #toClass} before calling this method.
     *
     * @param data {Object} The object for which models should be created.
     *
     * @return {qx.core.Object} The created model object.
     */
    toModel : function(data){
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * This class is responsible for converting json data to class instances
 * including the creation of the classes.
 */
qx.Class.define("qx.data.marshal.Json", {
  extend : qx.core.Object,
  implement : [qx.data.marshal.IMarshaler],
  /**
   * @param delegate {Object} An object containing one of the methods described
   *   in {@link qx.data.marshal.IMarshalerDelegate}.
   */
  construct : function(delegate){

    qx.core.Object.call(this);
    this.__dk = delegate;
  },
  statics : {
    $$instance : null,
    /**
     * Creates a qooxdoo object based on the given json data. This function
     * is just a static wrapper. If you want to configure the creation
     * process of the class, use {@link qx.data.marshal.Json} directly.
     *
     * @param data {Object} The object for which classes should be created.
     * @param includeBubbleEvents {Boolean} Whether the model should support
     *   the bubbling of change events or not.
     *
     * @return {qx.core.Object} An instance of the corresponding class.
     */
    createModel : function(data, includeBubbleEvents){

      // singleton for the json marshaler
      if(this.$$instance === null){

        this.$$instance = new qx.data.marshal.Json();
      };
      // be sure to create the classes first
      this.$$instance.toClass(data, includeBubbleEvents);
      // return the model
      return this.$$instance.toModel(data);
    }
  },
  members : {
    __dk : null,
    /**
     * Converts a given object into a hash which will be used to identify the
     * classes under the namespace <code>qx.data.model</code>.
     *
     * @param data {Object} The JavaScript object from which the hash is
     *   required.
     * @return {String} The hash representation of the given JavaScript object.
     */
    __dl : function(data){

      return Object.keys(data).sort().join('"');
    },
    /**
     * Creates for the given data the needed classes. The classes contain for
     * every key in the data a property. The classname is always the prefix
     * <code>qx.data.model</code> and the hash of the data created by
     * {@link #__jsonToHash}. Two objects containing the same keys will not
     * create two different classes. The class creation process also supports
     * the functions provided by its delegate.
     *
     * Important, please keep in mind that only valid JavaScript identifiers
     * can be used as keys in the data map. For convenience '-' in keys will
     * be removed (a-b will be ab in the end).
     *
     * @see qx.data.store.IStoreDelegate
     *
     * @param data {Object} The object for which classes should be created.
     * @param includeBubbleEvents {Boolean} Whether the model should support
     *   the bubbling of change events or not.
     */
    toClass : function(data, includeBubbleEvents){

      this.__dm(data, includeBubbleEvents, null, 0);
    },
    /**
     * Implementation of {@link #toClass} used for recursion.
     *
     * @param data {Object} The object for which classes should be created.
     * @param includeBubbleEvents {Boolean} Whether the model should support
     *   the bubbling of change events or not.
     * @param parentProperty {String|null} The name of the property the
     *   data will be stored in.
     * @param depth {Number} The depth of the data relative to the data's root.
     */
    __dm : function(data, includeBubbleEvents, parentProperty, depth){

      // break on all primitive json types and qooxdoo objects
      if(// check for localized strings
      !qx.lang.Type.isObject(data) || !!data.$$isString || data instanceof qx.core.Object){

        // check for arrays
        if(data instanceof Array || qx.Bootstrap.getClass(data) == "Array"){

          for(var i = 0;i < data.length;i++){

            this.__dm(data[i], includeBubbleEvents, null, depth + 1);
          };
        };
        // ignore arrays and primitive types
        return;
      };
      var hash = this.__dl(data);
      // ignore rules
      if(this.__dq(hash, parentProperty, depth)){

        return;
      };
      // check for the possible child classes
      for(var key in data){

        this.__dm(data[key], includeBubbleEvents, key, depth + 1);
      };
      // class already exists
      if(qx.Class.isDefined("qx.data.model." + hash)){

        return;
      };
      // class is defined by the delegate
      if(this.__dk && this.__dk.getModelClass && this.__dk.getModelClass(hash, data) != null){

        return;
      };
      // create the properties map
      var properties = {
      };
      // include the disposeItem for the dispose process.
      var members = {
        __dn : this.__dn
      };
      for(var key in data){

        // apply the property names mapping
        if(this.__dk && this.__dk.getPropertyMapping){

          key = this.__dk.getPropertyMapping(key, hash);
        };
        // stip the unwanted characters
        key = key.replace(/-|\.|\s+/g, "");
        // check for valid JavaScript identifier (leading numbers are ok)
        if(qx.core.Environment.get("qx.debug")){

          this.assertTrue((/^[$0-9A-Za-z_]*$/).test(key), "The key '" + key + "' is not a valid JavaScript identifier.");
        };
        properties[key] = {
        };
        properties[key].nullable = true;
        properties[key].event = "change" + qx.lang.String.firstUp(key);
        // bubble events
        if(includeBubbleEvents){

          properties[key].apply = "_applyEventPropagation";
        };
        // validation rules
        if(this.__dk && this.__dk.getValidationRule){

          var rule = this.__dk.getValidationRule(hash, key);
          if(rule){

            properties[key].validate = "_validate" + key;
            members["_validate" + key] = rule;
          };
        };
      };
      // try to get the superclass, qx.core.Object as default
      if(this.__dk && this.__dk.getModelSuperClass){

        var superClass = this.__dk.getModelSuperClass(hash) || qx.core.Object;
      } else {

        var superClass = qx.core.Object;
      };
      // try to get the mixins
      var mixins = [];
      if(this.__dk && this.__dk.getModelMixins){

        var delegateMixins = this.__dk.getModelMixins(hash);
        // check if its an array
        if(!qx.lang.Type.isArray(delegateMixins)){

          if(delegateMixins != null){

            mixins = [delegateMixins];
          };
        } else {

          mixins = delegateMixins;
        };
      };
      // include the mixin for the event bubbling
      if(includeBubbleEvents){

        mixins.push(qx.data.marshal.MEventBubbling);
      };
      // create the map for the class
      var newClass = {
        extend : superClass,
        include : mixins,
        properties : properties,
        members : members,
        destruct : this.__do
      };
      qx.Class.define("qx.data.model." + hash, newClass);
    },
    /**
     * Destructor for all created classes which disposes all stuff stored in
     * the properties.
     */
    __do : function(){

      var properties = qx.util.PropertyUtil.getAllProperties(this.constructor);
      for(var desc in properties){

        this.__dn(this.get(properties[desc].name));
      };
    },
    /**
     * Helper for disposing items of the created class.
     *
     * @param item {var} The item to dispose.
     */
    __dn : function(item){

      if(!(item instanceof qx.core.Object)){

        // ignore all non objects
        return;
      };
      // ignore already disposed items (could happen during shutdown)
      if(item.isDisposed()){

        return;
      };
      item.dispose();
    },
    /**
     * Creates an instance for the given data hash.
     *
     * @param hash {String} The hash of the data for which an instance should
     *   be created.
     * @param data {Map} The data for which an instance should be created.
     * @return {qx.core.Object} An instance of the corresponding class.
     */
    __dp : function(hash, data){

      var delegateClass;
      // get the class from the delegate
      if(this.__dk && this.__dk.getModelClass){

        delegateClass = this.__dk.getModelClass(hash, data);
      };
      if(delegateClass != null){

        return (new delegateClass());
      } else {

        var className = "qx.data.model." + hash;
        var clazz = qx.Class.getByName(className);
        if(!clazz){

          throw new Error("Class '" + className + "' could not be found.");
        };
        return (new clazz());
      };
    },
    /**
     * Helper to decide if the delegate decides to ignore a data set.
     * @param hash {String} The property names.
     * @param parentProperty {String|null} The name of the property the data
     *   will be stored in.
     * @param depth {Number} The depth of the object relative to the data root.
     * @return {Boolean} <code>true</code> if the set should be ignored
     */
    __dq : function(hash, parentProperty, depth){

      var del = this.__dk;
      return del && del.ignore && del.ignore(hash, parentProperty, depth);
    },
    /**
     * Creates for the given data the needed models. Be sure to have the classes
     * created with {@link #toClass} before calling this method. The creation
     * of the class itself is delegated to the {@link #__createInstance} method,
     * which could use the {@link qx.data.store.IStoreDelegate} methods, if
     * given.
     *
     * @param data {Object} The object for which models should be created.
     *
     * @return {qx.core.Object} The created model object.
     */
    toModel : function(data){

      return this.__dr(data, null, 0);
    },
    /**
     * Implementation of {@link #toModel} used for recursion.
     *
     * @param data {Object} The object for which models should be created.
     * @param parentProperty {String|null} The name of the property the
     *   data will be stored in.
     * @param depth {Number} The depth of the data relative to the data's root.
     * @return {qx.core.Object} The created model object.
     */
    __dr : function(data, parentProperty, depth){

      var isObject = qx.lang.Type.isObject(data);
      var isArray = data instanceof Array || qx.Bootstrap.getClass(data) == "Array";
      if(// check for localized strings
      (!isObject && !isArray) || !!data.$$isString || data instanceof qx.core.Object){

        return data;
      } else if(this.__dq(this.__dl(data), parentProperty, depth)){

        return data;
      } else if(isArray){

        var array = new qx.data.Array();
        // set the auto dispose for the array
        array.setAutoDisposeItems(true);
        for(var i = 0;i < data.length;i++){

          array.push(this.__dr(data[i], null, depth + 1));
        };
        return array;
      } else if(isObject){

        // create an instance for the object
        var hash = this.__dl(data);
        var model = this.__dp(hash, data);
        // go threw all element in the data
        for(var key in data){

          // apply the property names mapping
          var propertyName = key;
          if(this.__dk && this.__dk.getPropertyMapping){

            propertyName = this.__dk.getPropertyMapping(key, hash);
          };
          var propertyNameReplaced = propertyName.replace(/-|\.|\s+/g, "");
          // warn if there has been a replacement
          if((qx.core.Environment.get("qx.debug")) && qx.core.Environment.get("qx.debug.databinding")){

            if(propertyNameReplaced != propertyName){

              this.warn("The model contained an illegal name: '" + key + "'. Replaced it with '" + propertyName + "'.");
            };
          };
          propertyName = propertyNameReplaced;
          // only set the properties if they are available [BUG #5909]
          var setterName = "set" + qx.lang.String.firstUp(propertyName);
          if(model[setterName]){

            model[setterName](this.__dr(data[key], key, depth + 1));
          };
        };
        return model;
      };;;
      throw new Error("Unsupported type!");
    }
  },
  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */
  destruct : function(){

    this.__dk = null;
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Mixin used for the bubbling events. If you want to use this in your own model
 * classes, be sure that every property will call the
 * {@link #_applyEventPropagation} function on every change.
 */
qx.Mixin.define("qx.data.marshal.MEventBubbling", {
  events : {
    /**
     * The change event which will be fired on every change in the model no
     * matter what property changes. This event bubbles so the root model will
     * fire a change event on every change of its children properties too.
     *
     * Note that properties are required to call
     * {@link #_applyEventPropagation} on apply for changes to be tracked as
     * desired. It is already taken care of that properties created with the
     * {@link qx.data.marshal.Json} marshaler call this method.
     *
     * The data will contain a map with the following three keys
     *   <li>value: The new value of the property</li>
     *   <li>old: The old value of the property.</li>
     *   <li>name: The name of the property changed including its parent
     *     properties separated by dots.</li>
     *   <li>item: The item which has the changed property.</li>
     * Due to that, the <code>getOldData</code> method will always return null
     * because the old data is contained in the map.
     */
    "changeBubble" : "qx.event.type.Data"
  },
  members : {
    /**
     * Apply function for every property created with the
     * {@link qx.data.marshal.Json} marshaler. It fires and
     * {@link #changeBubble} event on every change. It also adds the chaining
     * listener if possible which is necessary for the bubbling of the events.
     *
     * @param value {var} The new value of the property.
     * @param old {var} The old value of the property.
     * @param name {String} The name of the changed property.
     */
    _applyEventPropagation : function(value, old, name){

      this.fireDataEvent("changeBubble", {
        value : value,
        name : name,
        old : old,
        item : this
      });
      this._registerEventChaining(value, old, name);
    },
    /**
     * Registers for the given parameters the changeBubble listener, if
     * possible. It also removes the old listener, if an old item with
     * a changeBubble event is given.
     *
     * @param value {var} The new value of the property.
     * @param old {var} The old value of the property.
     * @param name {String} The name of the changed property.
     */
    _registerEventChaining : function(value, old, name){

      // if an old value is given, remove the old listener if possible
      if(old != null && old.getUserData && old.getUserData("idBubble-" + this.$$hash) != null){

        var listeners = old.getUserData("idBubble-" + this.$$hash);
        for(var i = 0;i < listeners.length;i++){

          old.removeListenerById(listeners[i]);
        };
        old.setUserData("idBubble-" + this.$$hash, null);
      };
      // if the child supports chaining
      if((value instanceof qx.core.Object) && qx.Class.hasMixin(value.constructor, qx.data.marshal.MEventBubbling)){

        // create the listener
        var listener = qx.lang.Function.bind(this.__ds, this, name);
        // add the listener
        var id = value.addListener("changeBubble", listener, this);
        var listeners = value.getUserData("idBubble-" + this.$$hash);
        if(listeners == null){

          listeners = [];
          value.setUserData("idBubble-" + this.$$hash, listeners);
        };
        listeners.push(id);
      };
    },
    /**
     * Listener responsible for formating the name and firing the change event
     * for the changed property.
     *
     * @param name {String} The name of the former properties.
     * @param e {qx.event.type.Data} The date event fired by the property
     *   change.
     */
    __ds : function(name, e){

      var data = e.getData();
      var value = data.value;
      var old = data.old;
      // if the target is an array
      if(qx.Class.hasInterface(e.getTarget().constructor, qx.data.IListData)){

        if(data.name.indexOf){

          var dotIndex = data.name.indexOf(".") != -1 ? data.name.indexOf(".") : data.name.length;
          var bracketIndex = data.name.indexOf("[") != -1 ? data.name.indexOf("[") : data.name.length;
          // braktes in the first spot is ok [BUG #5985]
          if(bracketIndex == 0){

            var newName = name + data.name;
          } else if(dotIndex < bracketIndex){

            var index = data.name.substring(0, dotIndex);
            var rest = data.name.substring(dotIndex + 1, data.name.length);
            if(rest[0] != "["){

              rest = "." + rest;
            };
            var newName = name + "[" + index + "]" + rest;
          } else if(bracketIndex < dotIndex){

            var index = data.name.substring(0, bracketIndex);
            var rest = data.name.substring(bracketIndex, data.name.length);
            var newName = name + "[" + index + "]" + rest;
          } else {

            var newName = name + "[" + data.name + "]";
          };;
        } else {

          var newName = name + "[" + data.name + "]";
        };
      } else {

        // special case for array as first element of the chain [BUG #5985]
        if(parseInt(name) == name && name !== ""){

          name = "[" + name + "]";
        };
        var newName = name + "." + data.name;
      };
      this.fireDataEvent("changeBubble", {
        value : value,
        name : newName,
        old : old,
        item : data.item || e.getTarget()
      });
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */
/**
 * A helper class for accessing the property system directly.
 *
 * This class is rather to be used internally. For all regular usage of the
 * property system the default API should be sufficient.
 */
qx.Class.define("qx.util.PropertyUtil", {
  statics : {
    /**
     * Get the property map of the given class
     *
     * @param clazz {Class} a qooxdoo class
     * @return {Map} A properties map as defined in {@link qx.Class#define}
     *   including the properties of included mixins and not including refined
     *   properties.
     */
    getProperties : function(clazz){

      return clazz.$$properties;
    },
    /**
     * Get the property map of the given class including the properties of all
     * superclasses!
     *
     * @param clazz {Class} a qooxdoo class
     * @return {Map} The properties map as defined in {@link qx.Class#define}
     *   including the properties of included mixins of the current class and
     *   all superclasses.
     */
    getAllProperties : function(clazz){

      var properties = {
      };
      var superclass = clazz;
      // go threw the class hierarchy
      while(superclass != qx.core.Object){

        var currentProperties = this.getProperties(superclass);
        for(var property in currentProperties){

          properties[property] = currentProperties[property];
        };
        superclass = superclass.superclass;
      };
      return properties;
    },
    /*
    -------------------------------------------------------------------------
      USER VALUES
    -------------------------------------------------------------------------
    */
    /**
     * Returns the user value of the given property
     *
     * @param object {Object} The object to access
     * @param propertyName {String} The name of the property
     * @return {var} The user value
     */
    getUserValue : function(object, propertyName){

      return object["$$user_" + propertyName];
    },
    /**
    * Sets the user value of the given property
    *
    * @param object {Object} The object to access
    * @param propertyName {String} The name of the property
    * @param value {var} The value to set
    */
    setUserValue : function(object, propertyName, value){

      object["$$user_" + propertyName] = value;
    },
    /**
    * Deletes the user value of the given property
    *
    * @param object {Object} The object to access
    * @param propertyName {String} The name of the property
    */
    deleteUserValue : function(object, propertyName){

      delete (object["$$user_" + propertyName]);
    },
    /*
    -------------------------------------------------------------------------
      INIT VALUES
    -------------------------------------------------------------------------
    */
    /**
     * Returns the init value of the given property
     *
     * @param object {Object} The object to access
     * @param propertyName {String} The name of the property
     * @return {var} The init value
     */
    getInitValue : function(object, propertyName){

      return object["$$init_" + propertyName];
    },
    /**
    * Sets the init value of the given property
    *
    * @param object {Object} The object to access
    * @param propertyName {String} The name of the property
    * @param value {var} The value to set
    */
    setInitValue : function(object, propertyName, value){

      object["$$init_" + propertyName] = value;
    },
    /**
    * Deletes the init value of the given property
    *
    * @param object {Object} The object to access
    * @param propertyName {String} The name of the property
    */
    deleteInitValue : function(object, propertyName){

      delete (object["$$init_" + propertyName]);
    },
    /*
    -------------------------------------------------------------------------
      THEME VALUES
    -------------------------------------------------------------------------
    */
    /**
     * Returns the theme value of the given property
     *
     * @param object {Object} The object to access
     * @param propertyName {String} The name of the property
     * @return {var} The theme value
     */
    getThemeValue : function(object, propertyName){

      return object["$$theme_" + propertyName];
    },
    /**
    * Sets the theme value of the given property
    *
    * @param object {Object} The object to access
    * @param propertyName {String} The name of the property
    * @param value {var} The value to set
    */
    setThemeValue : function(object, propertyName, value){

      object["$$theme_" + propertyName] = value;
    },
    /**
    * Deletes the theme value of the given property
    *
    * @param object {Object} The object to access
    * @param propertyName {String} The name of the property
    */
    deleteThemeValue : function(object, propertyName){

      delete (object["$$theme_" + propertyName]);
    },
    /*
    -------------------------------------------------------------------------
      THEMED PROPERTY
    -------------------------------------------------------------------------
    */
    /**
     * Sets a themed property
     *
     * @param object {Object} The object to access
     * @param propertyName {String} The name of the property
    * @param value {var} The value to set
     */
    setThemed : function(object, propertyName, value){

      var styler = qx.core.Property.$$method.setThemed;
      object[styler[propertyName]](value);
    },
    /**
    * Resets a themed property
    *
    * @param object {Object} The object to access
    * @param propertyName {String} The name of the property
    */
    resetThemed : function(object, propertyName){

      var unstyler = qx.core.Property.$$method.resetThemed;
      object[unstyler[propertyName]]();
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * The data array is a special array used in the data binding context of
 * qooxdoo. It does not extend the native array of JavaScript but its a wrapper
 * for it. All the native methods are included in the implementation and it
 * also fires events if the content or the length of the array changes in
 * any way. Also the <code>.length</code> property is available on the array.
 */
qx.Class.define("qx.data.Array", {
  extend : qx.core.Object,
  include : qx.data.marshal.MEventBubbling,
  implement : [qx.data.IListData],
  /**
   * Creates a new instance of an array.
   *
   * @param param {var} The parameter can be some types.<br/>
   *   Without a parameter a new blank array will be created.<br/>
   *   If there is more than one parameter is given, the parameter will be
   *   added directly to the new array.<br/>
   *   If the parameter is a number, a new Array with the given length will be
   *   created.<br/>
   *   If the parameter is a JavaScript array, a new array containing the given
   *   elements will be created.
   */
  construct : function(param){

    qx.core.Object.call(this);
    // if no argument is given
    if(param == undefined){

      this.__dt = [];
    } else if(arguments.length > 1){

      // create an empty array and go through every argument and push it
      this.__dt = [];
      for(var i = 0;i < arguments.length;i++){

        this.__dt.push(arguments[i]);
      };
    } else if(typeof param == "number"){

      this.__dt = new Array(param);
    } else if(param instanceof Array){

      this.__dt = qx.lang.Array.clone(param);
    } else {

      this.__dt = [];
      this.dispose();
      throw new Error("Type of the parameter not supported!");
    };;;
    // propagate changes
    for(var i = 0;i < this.__dt.length;i++){

      this._applyEventPropagation(this.__dt[i], null, i);
    };
    // update the length at startup
    this.__du();
    // work against the console printout of the array
    if(qx.core.Environment.get("qx.debug")){

      this[0] = "Please use 'toArray()' to see the content.";
    };
  },
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties : {
    /**
     * Flag to set the dispose behavior of the array. If the property is set to
     * <code>true</code>, the array will dispose its content on dispose, too.
     */
    autoDisposeItems : {
      check : "Boolean",
      init : false
    }
  },
  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */
  events : {
    /**
     * The change event which will be fired if there is a change in the array.
     * The data contains a map with three key value pairs:
     * <li>start: The start index of the change.</li>
     * <li>end: The end index of the change.</li>
     * <li>type: The type of the change as a String. This can be 'add',
     * 'remove', 'order' or 'add/remove'</li>
     * <li>added: The items which has been added (as a JavaScript array)</li>
     * <li>removed: The items which has been removed (as a JavaScript array)</li>
     */
    "change" : "qx.event.type.Data",
    /**
     * The changeLength event will be fired every time the length of the
     * array changes.
     */
    "changeLength" : "qx.event.type.Data"
  },
  members : {
    // private members
    __dt : null,
    /**
     * Concatenates the current and the given array into a new one.
     *
     * @param array {Array} The javaScript array which should be concatenated
     *   to the current array.
     *
     * @return {qx.data.Array} A new array containing the values of both former
     *   arrays.
     */
    concat : function(array){

      if(array){

        var newArray = this.__dt.concat(array);
      } else {

        var newArray = this.__dt.concat();
      };
      return new qx.data.Array(newArray);
    },
    /**
     * Returns the array as a string using the given connector string to
     * connect the values.
     *
     * @param connector {String} the string which should be used to past in
     *  between of the array values.
     *
     * @return {String} The array as a string.
     */
    join : function(connector){

      return this.__dt.join(connector);
    },
    /**
     * Removes and returns the last element of the array.
     * An change event will be fired.
     *
     * @return {var} The last element of the array.
     */
    pop : function(){

      var item = this.__dt.pop();
      this.__du();
      // remove the possible added event listener
      this._registerEventChaining(null, item, this.length - 1);
      // fire change bubble event
      this.fireDataEvent("changeBubble", {
        value : [],
        name : this.length + "",
        old : [item],
        item : this
      });
      this.fireDataEvent("change", {
        start : this.length - 1,
        end : this.length - 1,
        type : "remove",
        removed : [item],
        added : []
      }, null);
      return item;
    },
    /**
     * Adds an element at the end of the array.
     *
     * @param varargs {var} Multiple elements. Every element will be added to
     *   the end of the array. An change event will be fired.
     *
     * @return {Number} The new length of the array.
     */
    push : function(varargs){

      for(var i = 0;i < arguments.length;i++){

        this.__dt.push(arguments[i]);
        this.__du();
        // apply to every pushed item an event listener for the bubbling
        this._registerEventChaining(arguments[i], null, this.length - 1);
        // fire change bubbles event
        this.fireDataEvent("changeBubble", {
          value : [arguments[i]],
          name : (this.length - 1) + "",
          old : [],
          item : this
        });
        // fire change event
        this.fireDataEvent("change", {
          start : this.length - 1,
          end : this.length - 1,
          type : "add",
          added : [arguments[i]],
          removed : []
        }, null);
      };
      return this.length;
    },
    /**
     * Reverses the order of the array. An change event will be fired.
     */
    reverse : function(){

      // ignore on empty arrays
      if(this.length == 0){

        return;
      };
      var oldArray = this.__dt.concat();
      this.__dt.reverse();
      this.__dv(0, this.length);
      this.fireDataEvent("change", {
        start : 0,
        end : this.length - 1,
        type : "order",
        added : [],
        removed : []
      }, null);
      // fire change bubbles event
      this.fireDataEvent("changeBubble", {
        value : this.__dt,
        name : "0-" + (this.__dt.length - 1),
        old : oldArray,
        item : this
      });
    },
    /**
     * Removes the first element of the array and returns it. An change event
     * will be fired.
     *
     * @return {var} the former first element.
     */
    shift : function(){

      // ignore on empty arrays
      if(this.length == 0){

        return;
      };
      var item = this.__dt.shift();
      this.__du();
      // remove the possible added event listener
      this._registerEventChaining(null, item, this.length - 1);
      // as every item has changed its position, we need to update the event bubbling
      this.__dv(0, this.length);
      // fire change bubbles event
      this.fireDataEvent("changeBubble", {
        value : [],
        name : "0",
        old : [item],
        item : this
      });
      // fire change event
      this.fireDataEvent("change", {
        start : 0,
        end : this.length - 1,
        type : "remove",
        removed : [item],
        added : []
      }, null);
      return item;
    },
    /**
     * Returns a new array based on the range specified by the parameters.
     *
     * @param from {Number} The start index.
     * @param to {Number?null} The end index. If omitted, slice extracts to the
     *   end of the array.
     *
     * @return {qx.data.Array} A new array containing the given range of values.
     */
    slice : function(from, to){

      return new qx.data.Array(this.__dt.slice(from, to));
    },
    /**
     * Method to remove and add new elements to the array. For every remove or
     * add an event will be fired.
     *
     * @param startIndex {Integer} The index where the splice should start
     * @param amount {Integer} Defines number of elements which will be removed
     *   at the given position.
     * @param varargs {var} All following parameters will be added at the given
     *   position to the array.
     * @return {qx.data.Array} An data array containing the removed elements.
     *   Keep in to dispose this one, even if you don't use it!
     */
    splice : function(startIndex, amount, varargs){

      // store the old length
      var oldLength = this.__dt.length;
      // invoke the slice on the array
      var returnArray = this.__dt.splice.apply(this.__dt, arguments);
      // fire a change event for the length
      if(this.__dt.length != oldLength){

        this.__du();
      } else if(amount == arguments.length - 2){

        // if we added as much items as we removed
        var addedItems = qx.lang.Array.fromArguments(arguments, 2);
        // check if the array content equals the content before the operation
        for(var i = 0;i < addedItems.length;i++){

          if(addedItems[i] !== returnArray[i]){

            break;
          };
          // if all added and removed items are queal
          if(i == addedItems.length - 1){

            // prevent all events and return a new array
            return new qx.data.Array();
          };
        };
      };
      // fire an event for the change
      var removed = amount > 0;
      var added = arguments.length > 2;
      if(removed || added){

        var addedItems = qx.lang.Array.fromArguments(arguments, 2);
        if(returnArray.length == 0){

          var type = "add";
          var end = startIndex + addedItems.length;
        } else if(addedItems.length == 0){

          var type = "remove";
          var end = this.length - 1;
        } else {

          var type = "add/remove";
          var end = startIndex + Math.abs(addedItems.length - returnArray.length);
        };
        this.fireDataEvent("change", {
          start : startIndex,
          end : end,
          type : type,
          added : addedItems,
          removed : returnArray
        }, null);
      };
      // remove the listeners first [BUG #7132]
      for(var i = 0;i < returnArray.length;i++){

        this._registerEventChaining(null, returnArray[i], i);
      };
      // add listeners
      for(var i = 2;i < arguments.length;i++){

        this._registerEventChaining(arguments[i], null, startIndex + (i - 2));
      };
      // apply event chaining for every item moved
      this.__dv(startIndex + (arguments.length - 2) - amount, this.length);
      // fire the changeBubble event
      var value = [];
      for(var i = 2;i < arguments.length;i++){

        value[i - 2] = arguments[i];
      };
      var endIndex = (startIndex + Math.max(arguments.length - 3, amount - 1));
      var name = startIndex == endIndex ? endIndex : startIndex + "-" + endIndex;
      this.fireDataEvent("changeBubble", {
        value : value,
        name : name + "",
        old : returnArray,
        item : this
      });
      return (new qx.data.Array(returnArray));
    },
    /**
     * Sorts the array. If a function is given, this will be used to
     * compare the items. <code>changeBubble</code> event will only be fired,
     * if sorting result differs from original array.
     *
     * @param func {Function} A compare function comparing two parameters and
     *   should return a number.
     */
    sort : function(func){

      // ignore if the array is empty
      if(this.length == 0){

        return;
      };
      var oldArray = this.__dt.concat();
      this.__dt.sort.apply(this.__dt, arguments);
      // prevent changeBubble event if nothing has been changed
      if(qx.lang.Array.equals(this.__dt, oldArray) === true){

        return;
      };
      this.__dv(0, this.length);
      this.fireDataEvent("change", {
        start : 0,
        end : this.length - 1,
        type : "order",
        added : [],
        removed : []
      }, null);
      // fire change bubbles event
      this.fireDataEvent("changeBubble", {
        value : this.__dt,
        name : "0-" + (this.length - 1),
        old : oldArray,
        item : this
      });
    },
    /**
     * Adds the given items to the beginning of the array. For every element,
     * a change event will be fired.
     *
     * @param varargs {var} As many elements as you want to add to the beginning.
     * @return {Integer} The new length of the array
     */
    unshift : function(varargs){

      for(var i = arguments.length - 1;i >= 0;i--){

        this.__dt.unshift(arguments[i]);
        this.__du();
        // apply to every item an event listener for the bubbling
        this.__dv(0, this.length);
        // fire change bubbles event
        this.fireDataEvent("changeBubble", {
          value : [this.__dt[0]],
          name : "0",
          old : [this.__dt[1]],
          item : this
        });
        // fire change event
        this.fireDataEvent("change", {
          start : 0,
          end : this.length - 1,
          type : "add",
          added : [arguments[i]],
          removed : []
        }, null);
      };
      return this.length;
    },
    /**
     * Returns the list data as native array. Beware of the fact that the
     * internal representation will be returnd and any manipulation of that
     * can cause a misbehavior of the array. This method should only be used for
     * debugging purposes.
     *
     * @return {Array} The native array.
     */
    toArray : function(){

      return this.__dt;
    },
    /**
     * Replacement function for the getting of the array value.
     * array[0] should be array.getItem(0).
     *
     * @param index {Number} The index requested of the array element.
     *
     * @return {var} The element at the given index.
     */
    getItem : function(index){

      return this.__dt[index];
    },
    /**
     * Replacement function for the setting of an array value.
     * array[0] = "a" should be array.setItem(0, "a").
     * A change event will be fired if the value changes. Setting the same
     * value again will not lead to a change event.
     *
     * @param index {Number} The index of the array element.
     * @param item {var} The new item to set.
     */
    setItem : function(index, item){

      var oldItem = this.__dt[index];
      // ignore settings of already set items [BUG #4106]
      if(oldItem === item){

        return;
      };
      this.__dt[index] = item;
      // set an event listener for the bubbling
      this._registerEventChaining(item, oldItem, index);
      // only update the length if its changed
      if(this.length != this.__dt.length){

        this.__du();
      };
      // fire change bubbles event
      this.fireDataEvent("changeBubble", {
        value : [item],
        name : index + "",
        old : [oldItem],
        item : this
      });
      // fire change event
      this.fireDataEvent("change", {
        start : index,
        end : index,
        type : "add/remove",
        added : [item],
        removed : [oldItem]
      }, null);
    },
    /**
     * This method returns the current length stored under .length on each
     * array.
     *
     * @return {Number} The current length of the array.
     */
    getLength : function(){

      return this.length;
    },
    /**
     * Returns the index of the item in the array. If the item is not in the
     * array, -1 will be returned.
     *
     * @param item {var} The item of which the index should be returned.
     * @return {Number} The Index of the given item.
     */
    indexOf : function(item){

      return this.__dt.indexOf(item);
    },
    /**
     * Returns the last index of the item in the array. If the item is not in the
     * array, -1 will be returned.
     *
     * @param item {var} The item of which the index should be returned.
     * @return {Number} The Index of the given item.
     */
    lastIndexOf : function(item){

      return this.__dt.lastIndexOf(item);
    },
    /**
     * Returns the toString of the original Array
     * @return {String} The array as a string.
     */
    toString : function(){

      if(this.__dt != null){

        return this.__dt.toString();
      };
      return "";
    },
    /*
    ---------------------------------------------------------------------------
       IMPLEMENTATION OF THE QX.LANG.ARRAY METHODS
    ---------------------------------------------------------------------------
    */
    /**
     * Check if the given item is in the current array.
     *
     * @param item {var} The item which is possibly in the array.
     * @return {Boolean} true, if the array contains the given item.
     */
    contains : function(item){

      return this.__dt.indexOf(item) !== -1;
    },
    /**
     * Return a copy of the given arr
     *
     * @return {qx.data.Array} copy of this
     */
    copy : function(){

      return this.concat();
    },
    /**
     * Insert an element at a given position.
     *
     * @param index {Integer} Position where to insert the item.
     * @param item {var} The element to insert.
     */
    insertAt : function(index, item){

      this.splice(index, 0, item).dispose();
    },
    /**
     * Insert an item into the array before a given item.
     *
     * @param before {var} Insert item before this object.
     * @param item {var} The item to be inserted.
     */
    insertBefore : function(before, item){

      var index = this.indexOf(before);
      if(index == -1){

        this.push(item);
      } else {

        this.splice(index, 0, item).dispose();
      };
    },
    /**
     * Insert an element into the array after a given item.
     *
     * @param after {var} Insert item after this object.
     * @param item {var} Object to be inserted.
     */
    insertAfter : function(after, item){

      var index = this.indexOf(after);
      if(index == -1 || index == (this.length - 1)){

        this.push(item);
      } else {

        this.splice(index + 1, 0, item).dispose();
      };
    },
    /**
     * Remove an element from the array at the given index.
     *
     * @param index {Integer} Index of the item to be removed.
     * @return {var} The removed item.
     */
    removeAt : function(index){

      var returnArray = this.splice(index, 1);
      var item = returnArray.getItem(0);
      returnArray.dispose();
      return item;
    },
    /**
     * Remove all elements from the array.
     *
     * @return {Array} A native array containing the removed elements.
     */
    removeAll : function(){

      // remove all possible added event listeners
      for(var i = 0;i < this.__dt.length;i++){

        this._registerEventChaining(null, this.__dt[i], i);
      };
      // ignore if array is empty
      if(this.getLength() == 0){

        return [];
      };
      // store the old data
      var oldLength = this.getLength();
      var items = this.__dt.concat();
      // change the length
      this.__dt.length = 0;
      this.__du();
      // fire change bubbles event
      this.fireDataEvent("changeBubble", {
        value : [],
        name : "0-" + (oldLength - 1),
        old : items,
        item : this
      });
      // fire the change event
      this.fireDataEvent("change", {
        start : 0,
        end : oldLength - 1,
        type : "remove",
        removed : items,
        added : []
      }, null);
      return items;
    },
    /**
     * Append the items of the given array.
     *
     * @param array {Array|qx.data.IListData} The items of this array will
     * be appended.
     * @throws {Error} if the second argument is not an array.
     */
    append : function(array){

      // qooxdoo array support
      if(array instanceof qx.data.Array){

        array = array.toArray();
      };
      // this check is important because opera throws an uncatchable error if
      // apply is called without an array as argument.
      if(qx.core.Environment.get("qx.debug")){

        qx.core.Assert.assertArray(array, "The parameter must be an array.");
      };
      Array.prototype.push.apply(this.__dt, array);
      // add a listener to the new items
      for(var i = 0;i < array.length;i++){

        this._registerEventChaining(array[i], null, this.__dt.length + i);
      };
      var oldLength = this.length;
      this.__du();
      // fire change bubbles
      var name = oldLength == (this.length - 1) ? oldLength : oldLength + "-" + (this.length - 1);
      this.fireDataEvent("changeBubble", {
        value : array,
        name : name + "",
        old : [],
        item : this
      });
      // fire the change event
      this.fireDataEvent("change", {
        start : oldLength,
        end : this.length - 1,
        type : "add",
        added : array,
        removed : []
      }, null);
    },
    /**
     * Remove the given item.
     *
     * @param item {var} Item to be removed from the array.
     * @return {var} The removed item.
     */
    remove : function(item){

      var index = this.indexOf(item);
      if(index != -1){

        this.splice(index, 1).dispose();
        return item;
      };
    },
    /**
     * Check whether the given array has the same content as this.
     * Checks only the equality of the arrays' content.
     *
     * @param array {qx.data.Array} The array to check.
     * @return {Boolean} Whether the two arrays are equal.
     */
    equals : function(array){

      if(this.length !== array.length){

        return false;
      };
      for(var i = 0;i < this.length;i++){

        if(this.getItem(i) !== array.getItem(i)){

          return false;
        };
      };
      return true;
    },
    /**
     * Returns the sum of all values in the array. Supports
     * numeric values only.
     *
     * @return {Number} The sum of all values.
     */
    sum : function(){

      var result = 0;
      for(var i = 0;i < this.length;i++){

        result += this.getItem(i);
      };
      return result;
    },
    /**
     * Returns the highest value in the given array.
     * Supports numeric values only.
     *
     * @return {Number | null} The highest of all values or undefined if the
     *   array is empty.
     */
    max : function(){

      var result = this.getItem(0);
      for(var i = 1;i < this.length;i++){

        if(this.getItem(i) > result){

          result = this.getItem(i);
        };
      };
      return result === undefined ? null : result;
    },
    /**
     * Returns the lowest value in the array. Supports
     * numeric values only.
     *
     * @return {Number | null} The lowest of all values or undefined
     *   if the array is empty.
     */
    min : function(){

      var result = this.getItem(0);
      for(var i = 1;i < this.length;i++){

        if(this.getItem(i) < result){

          result = this.getItem(i);
        };
      };
      return result === undefined ? null : result;
    },
    /**
     * Invokes the given function for every item in the array.
     *
     * @param callback {Function} The function which will be call for every
     *   item in the array. It will be invoked with three parameters:
     *   the item, the index and the array itself.
     * @param context {var} The context in which the callback will be invoked.
     */
    forEach : function(callback, context){

      for(var i = 0;i < this.__dt.length;i++){

        callback.call(context, this.__dt[i], i, this);
      };
    },
    /*
    ---------------------------------------------------------------------------
      Additional JS1.6 methods
    ---------------------------------------------------------------------------
    */
    /**
     * Creates a new array with all elements that pass the test implemented by
     * the provided function. It returns a new data array instance so make sure
     * to think about disposing it.
     * @param callback {Function} The test function, which will be executed for every
     *   item in the array. The function will have three arguments.
     *   <li><code>item</code>: the current item in the array</li>
     *   <li><code>index</code>: the index of the current item</li>
     *   <li><code>array</code>: The native array instance, NOT the data array instance.</li>
     * @param self {var?undefined} The context of the callback.
     * @return {qx.data.Array} A new array instance containing only the items
     *  which passed the test.
     */
    filter : function(callback, self){

      return new qx.data.Array(this.__dt.filter(callback, self));
    },
    /**
     * Creates a new array with the results of calling a provided function on every
     * element in this array. It returns a new data array instance so make sure
     * to think about disposing it.
     * @param callback {Function} The mapping function, which will be executed for every
     *   item in the array. The function will have three arguments.
     *   <li><code>item</code>: the current item in the array</li>
     *   <li><code>index</code>: the index of the current item</li>
     *   <li><code>array</code>: The native array instance, NOT the data array instance.</li>
     * @param self {var?undefined} The context of the callback.
     * @return {qx.data.Array} A new array instance containing the new created items.
     */
    map : function(callback, self){

      return new qx.data.Array(this.__dt.map(callback, self));
    },
    /**
     * Tests whether any element in the array passes the test implemented by the
     * provided function.
     * @param callback {Function} The test function, which will be executed for every
     *   item in the array. The function will have three arguments.
     *   <li><code>item</code>: the current item in the array</li>
     *   <li><code>index</code>: the index of the current item</li>
     *   <li><code>array</code>: The native array instance, NOT the data array instance.</li>
     * @param self {var?undefined} The context of the callback.
     * @return {Boolean} <code>true</code>, if any element passed the test function.
     */
    some : function(callback, self){

      return this.__dt.some(callback, self);
    },
    /**
     * Tests whether every element in the array passes the test implemented by the
     * provided function.
     * @param callback {Function} The test function, which will be executed for every
     *   item in the array. The function will have three arguments.
     *   <li><code>item</code>: the current item in the array</li>
     *   <li><code>index</code>: the index of the current item</li>
     *   <li><code>array</code>: The native array instance, NOT the data array instance.</li>
     * @param self {var?undefined} The context of the callback.
     * @return {Boolean} <code>true</code>, if every element passed the test function.
     */
    every : function(callback, self){

      return this.__dt.every(callback, self);
    },
    /**
     * Apply a function against an accumulator and each value of the array
     * (from left-to-right) as to reduce it to a single value.
     * @param callback {Function} The accumulator function, which will be
     *   executed for every item in the array. The function will have four arguments.
     *   <li><code>previousItem</code>: the previous item</li>
     *   <li><code>currentItem</code>: the current item in the array</li>
     *   <li><code>index</code>: the index of the current item</li>
     *   <li><code>array</code>: The native array instance, NOT the data array instance.</li>
     * @param initValue {var?undefined} Object to use as the first argument to the first
     *   call of the callback.
     * @return {var} The returned value of the last accumulator call.
     */
    reduce : function(callback, initValue){

      return this.__dt.reduce(callback, initValue);
    },
    /**
     * Apply a function against an accumulator and each value of the array
     * (from right-to-left) as to reduce it to a single value.
     * @param callback {Function} The accumulator function, which will be
     *   executed for every item in the array. The function will have four arguments.
     *   <li><code>previousItem</code>: the previous item</li>
     *   <li><code>currentItem</code>: the current item in the array</li>
     *   <li><code>index</code>: the index of the current item</li>
     *   <li><code>array</code>: The native array instance, NOT the data array instance.</li>
     * @param initValue {var?undefined} Object to use as the first argument to the first
     *   call of the callback.
     * @return {var} The returned value of the last accumulator call.
     */
    reduceRight : function(callback, initValue){

      return this.__dt.reduceRight(callback, initValue);
    },
    /*
    ---------------------------------------------------------------------------
      INTERNAL HELPERS
    ---------------------------------------------------------------------------
    */
    /**
     * Internal function which updates the length property of the array.
     * Every time the length will be updated, a {@link #changeLength} data
     * event will be fired.
     */
    __du : function(){

      var oldLength = this.length;
      this.length = this.__dt.length;
      this.fireDataEvent("changeLength", this.length, oldLength);
    },
    /**
     * Helper to update the event propagation for a range of items.
     * @param from {Number} Start index.
     * @param to {Number} End index.
     */
    __dv : function(from, to){

      for(var i = from;i < to;i++){

        this._registerEventChaining(this.__dt[i], this.__dt[i], i);
      };
    }
  },
  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
  */
  destruct : function(){

    for(var i = 0;i < this.__dt.length;i++){

      var item = this.__dt[i];
      this._applyEventPropagation(null, item, i);
      // dispose the items on auto dispose
      if(this.isAutoDisposeItems() && item && item instanceof qx.core.Object){

        item.dispose();
      };
    };
    this.__dt = null;
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */
/**
 * Utilities for creating and querying the test (suite) model.
 */
qx.Class.define("testrunner.runner.ModelUtil", {
  type : "static",
  statics : {
    /**
     * Creates a nested map for the test namespace from the flat list of tests
     *
     * @param testRep {Object} Test suite object obtained by parsing the JSON
     * returned by {@link qx.dev.unit.TestLoader:getTestDescriptions}
     * @return {Object} Test suite object
     */
    createModelData : function(testRep){

      var data = {
      };
      for(var i = 0,l = testRep.length;i < l;i++){

        var nameSpace = testRep[i].classname.split(".");
        var testList = testRep[i].tests;
        testList.sort();
        for(var x = 0,y = testList.length;x < y;x++){

          testrunner.runner.ModelUtil.addChainToMap(nameSpace.concat(testList[x]), data);
        };
      };
      return data;
    },
    /**
     * Recursively searches a model for all items with a given property/value
     * combination
     *
     * @param model {Object} The test model to search
     * @param property {String} Property name
     * @param value {var} Property value
     * @return {Object[]} Array of matching model items
     */
    getItemsByProperty : function(model, property, value){

      var propertyName = qx.lang.String.firstUp(property);
      var testList = [];
      if(model["get" + propertyName] && model["get" + propertyName]() === value){

        testList.push(model);
      };
      if(!model.getChildren){

        return testList;
      };
      var kids = model.getChildren();
      for(var i = 0,l = kids.length;i < l;i++){

        var child = kids.getItem(i);
        testList = testList.concat(arguments.callee(child, property, value));
      };
      return testList;
    },
    /**
     * Finds a model item by its full path name
     *
     * @param model {Object} The test model to search
     * @param fullName {String} The item's name
     * @return {Object|null} The matching item or null if there is no match
     */
    getItemByFullName : function(model, fullName){

      if(model.fullName == fullName){

        return model;
      };
      if(model.getChildren){

        var kids = model.getChildren();
        for(var i = 0,l = kids.length;i < l;i++){

          var child = kids.getItem(i);
          var found = arguments.callee(child, fullName);
          if(found){

            return found;
          };
        };
      };
      return null;
    },
    /**
     * Adds additional data fields to the model items:
     * parent : reference to the parent item
     *
     * @param model {Object} The model to process
     */
    addDataFields : function(model){

      if(!model.parent){

        model.fullName = model.getName();
      };
      if(model.getChildren){

        var mType = model.getType();
        if(mType == "package" || mType == "class"){

          model.sortChildren();
        };
        var kids = model.getChildren();
        for(var i = 0,l = kids.length;i < l;i++){

          var child = kids.getItem(i);
          child.parent = model;
          if(child.getType() == "test"){

            child.fullName = model.fullName + ":" + child.getName();
          } else {

            child.fullName = model.fullName + "." + child.getName();
          };
          arguments.callee(child);
          // skip binding the children's state to the parent in old IEs to
          // accelerate application startup
          if(!(qx.core.Environment.get("browser.name") === "ie" && qx.core.Environment.get("browser.version") < 9)){

            child.bind("state", model, "state", {
              converter : function(data, model){

                if(model.getState() == "failure" || model.getState() == "error" || data == "start" || data == "wait"){

                  return model.getState();
                };
                return data;
              }
            });
          };
        };
      };
    },
    /**
     * Adds nested keys to a map, e.g.: addChainToMap(["foo", "bar", "baz"], {})
     * creates the following structure:
     * {
     *   "foo" :
     *   {
     *     "bar" :
     *     {
     *       "baz" : {}
     *     }
     *   }
     * }
     *
     * @param nsArr {String[]} Array of key names
     * @param obj {Map} The initial map
     */
    addChainToMap : function(nsArr, obj){

      if(nsArr.length == 0){

        return;
      };
      var list = nsArr.concat();
      var next = list.shift();
      if(!obj.children){

        obj.children = [];
      };
      var found = false;
      for(var i = 0,l = obj.children.length;i < l;i++){

        if(obj.children[i].name === next){

          found = obj.children[i];
          break;
        };
      };
      if(!found){

        found = {
          name : next
        };
        obj.children.push(found);
      };
      arguments.callee(list, found);
    },
    /**
     * Returns the following sibling of a given model item or null if there isn't
     * one.
     *
     * @param node {Object} Model node
     * @return {Object|null} Following sibling
     */
    getNextSiblingOf : function(node){

      if(!node.parent){

        return null;
      };
      var siblings = node.parent.getChildren();
      if(!siblings){

        return null;
      };
      var index = siblings.indexOf(node);
      if(index < siblings.length - 1){

        return siblings.getItem(index + 1);
      };
      return null;
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */
/**
 * Common superclass for test suite model items
 */
qx.Class.define("testrunner.runner.TestItem", {
  extend : qx.core.Object,
  construct : function(){

    qx.core.Object.call(this);
    this.$$test = this;
  },
  properties : {
    /** The item's state. The state of a parent item reflects its children:
     *  If one or more children have "error" or "failure" states, so will the
     *  parent.
     */
    state : {
      init : "start",
      event : "changeState",
      apply : "_applyState"
    },
    /**
     * The item's previous state. This is used to preserve the correct state value
     * for asynchronous tests that have an intermediate "wait" value.
     */
    previousState : {
      nullable : true,
      init : null
    },
    /**
     * Any exceptions caught during a test's execution.
     */
    exceptions : {
      init : [],
      nullable : true,
      event : "changeExceptions"
    }
  },
  statics : {
    /**
     * Compare function for test model items.
     *
     * @param aItem {testrunner.runner.TestItem} First item
     * @param bItem {testrunner.runner.TestItem} Second item
     * @return {Integer} Comparison result
     */
    sortFunction : function(aItem, bItem){

      var aType = aItem.getType();
      var bType = bItem.getType();
      // always sort packages before classes
      if(aType == "package" && bType == "class"){

        return -1;
      };
      if(aType == "class" && bType == "package"){

        return 1;
      };
      var a = aItem.getName();
      var b = bItem.getName();
      if(a < b){

        return -1;
      };
      if(a > b){

        return 1;
      };
      return 0;
    }
  },
  members : {
    /**
     * Returns this instance. Workaround needed to bind each child item's state
     * to the parent's.
     *
     * @return {Object} This model object
     */
    getModel : function(){

      return this.$$test;
    },
    /**
     * Returns the fully qualified name of a model item, e.g.
     * "someApp.test.foo.Bar:testBaz"
     *
     * @return {String} The item's fully qualified name
     */
    getFullName : function(){

      return this.fullName;
    },
    /**
     * Return the item's type ("package", "class" or "test")
     *
     * @return {String} The item's type
     */
    getType : function(){

      var itemName = this.getName();
      if(itemName.indexOf("test") === 0 && itemName.length > 4){

        // ugly workaround for packages with names beginning with "test"
        if(this.getChildren){

          return "package";
        };
        return "test";
      };
      if(itemName.substr(0, 1) === itemName.substr(0, 1).toUpperCase()){

        return "class";
      };
      return "package";
    },
    /**
     * Sorts the item's children. Packages are always listed before classes.
     */
    sortChildren : function(){

      this.getChildren().sort(testrunner.runner.TestItem.sortFunction);
    },
    /**
     * Serializes and returns any exceptions caught during the test's execution
     *
     * @return {String} Exceptions
     */
    getMessage : qx.core.Environment.select("engine.name", {
      "default" : function(){

        if(this.getExceptions() && this.getExceptions().length > 0){

          var exceptions = this.getExceptions();
          var message = "";
          for(var i = 0,l = exceptions.length;i < l;i++){

            message += exceptions[i].exception.toString() + " ";
          };
          return message;
        } else {

          return "";
        };
      },
      "opera" : function(){

        if(this.getExceptions() && this.getExceptions().length > 0){

          var exceptions = this.getExceptions();
          var message = "";
          for(var i = 0,l = exceptions.length;i < l;i++){

            var msg = exceptions[i].exception.message + "";
            if(msg.indexOf("Backtrace:") < 0){

              message += exceptions[i].exception.toString();
            } else {

              message += msg.split("Backtrace:")[0].trim();
            };
          };
          return message;
        } else {

          return "";
        };
      }
    }),
    /**
     * Returns stack trace information for a given exception.
     *
     * @param ex {Error} Exception
     * @return {String} Stack trace information
     */
    getStackTrace : function(ex){

      var trace = [];
      if(typeof (ex.getStackTrace) == "function"){

        trace = ex.getStackTrace();
      } else {

        trace = qx.dev.StackTrace.getStackTraceFromError(ex);
      };
      // filter Test Runner functions from the stack trace
      while(trace.length > 0){

        var first = trace[0];
        if(first.indexOf("qx.dev.unit.AssertionError") == 0 || first.indexOf("qx.Class") == 0 || first.indexOf("qx.dev.unit.MAssert") == 0 || first.indexOf("script") == 0){

          trace.shift();
        } else {

          break;
        };
      };
      return trace.join("<br>");
    },
    /**
     * Save the previous value when the state changes
     *
     * @param newState {String} New state value
     * @param oldState {String} Previous state value
     */
    _applyState : function(newState, oldState){

      if(oldState){

        this.setPreviousState(oldState);
      };
    }
  },
  destruct : function(){

    this.$$test = null;
    if(this.parent){

      this.parent = null;
    };
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */
/**
 * Static helpers for parsing and modifying URIs.
 */
qx.Bootstrap.define("qx.util.Uri", {
  statics : {
    /**
     * Split URL
     *
     * Code taken from:
     *   parseUri 1.2.2
     *   (c) Steven Levithan <stevenlevithan.com>
     *   MIT License
     *
     *
     * @param str {String} String to parse as URI
     * @param strict {Boolean} Whether to parse strictly by the rules
     * @return {Object} Map with parts of URI as properties
     */
    parseUri : function(str, strict){

      var options = {
        key : ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
        q : {
          name : "queryKey",
          parser : /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser : {
          strict : /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
          loose : /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
      };
      var o = options,m = options.parser[strict ? "strict" : "loose"].exec(str),uri = {
      },i = 14;
      while(i--){

        uri[o.key[i]] = m[i] || "";
      };
      uri[o.q.name] = {
      };
      uri[o.key[12]].replace(o.q.parser, function($0, $1, $2){

        if($1){

          uri[o.q.name][$1] = $2;
        };
      });
      return uri;
    },
    /**
     * Append string to query part of URL. Respects existing query.
     *
     * @param url {String} URL to append string to.
     * @param params {String} Parameters to append to URL.
     * @return {String} URL with string appended in query part.
     */
    appendParamsToUrl : function(url, params){

      if(params === undefined){

        return url;
      };
      if(qx.core.Environment.get("qx.debug")){

        if(!(qx.lang.Type.isString(params) || qx.lang.Type.isObject(params))){

          throw new Error("params must be either string or object");
        };
      };
      if(qx.lang.Type.isObject(params)){

        params = qx.util.Uri.toParameter(params);
      };
      if(!params){

        return url;
      };
      return url += (/\?/).test(url) ? "&" + params : "?" + params;
    },
    /**
     * Serializes an object to URI parameters (also known as query string).
     *
     * Escapes characters that have a special meaning in URIs as well as
     * umlauts. Uses the global function encodeURIComponent, see
     * https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/encodeURIComponent
     *
     * Note: For URI parameters that are to be sent as
     * application/x-www-form-urlencoded (POST), spaces should be encoded
     * with "+".
     *
     * @param obj {Object}   Object to serialize.
     * @param post {Boolean} Whether spaces should be encoded with "+".
     * @return {String}      Serialized object. Safe to append to URIs or send as
     *                       URL encoded string.
     */
    toParameter : function(obj, post){

      var key,parts = [];
      for(key in obj){

        if(obj.hasOwnProperty(key)){

          var value = obj[key];
          if(value instanceof Array){

            for(var i = 0;i < value.length;i++){

              this.__dw(key, value[i], parts, post);
            };
          } else {

            this.__dw(key, value, parts, post);
          };
        };
      };
      return parts.join("&");
    },
    /**
     * Encodes key/value to URI safe string and pushes to given array.
     *
     * @param key {String} Key.
     * @param value {String} Value.
     * @param parts {Array} Array to push to.
     * @param post {Boolean} Whether spaces should be encoded with "+".
     */
    __dw : function(key, value, parts, post){

      var encode = window.encodeURIComponent;
      if(post){

        parts.push(encode(key).replace(/%20/g, "+") + "=" + encode(value).replace(/%20/g, "+"));
      } else {

        parts.push(encode(key) + "=" + encode(value));
      };
    },
    /**
     * Takes a relative URI and returns an absolute one.
     *
     * @param uri {String} relative URI
     * @return {String} absolute URI
     */
    getAbsolute : function(uri){

      var div = document.createElement("div");
      div.innerHTML = '<a href="' + uri + '">0</a>';
      return div.firstChild.href;
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */
/**
 * Script loader with interface similar to
 * <a href="http://www.w3.org/TR/XMLHttpRequest/">XmlHttpRequest</a>.
 *
 * The script loader can be used to load scripts from arbitrary sources.
 * <span class="desktop">
 * For JSONP requests, consider the {@link qx.bom.request.Jsonp} transport
 * that derives from the script loader.
 * </span>
 *
 * <div class="desktop">
 * Example:
 *
 * <pre class="javascript">
 *  var req = new qx.bom.request.Script();
 *  req.onload = function() {
 *    // Script is loaded and parsed and
 *    // globals set are available
 *  }
 *
 *  req.open("GET", url);
 *  req.send();
 * </pre>
 * </div>
 *
 * @ignore(qx.core, qx.core.Environment.*)
 * @require(qx.bom.request.Script#_success)
 * @require(qx.bom.request.Script#abort)
 * @require(qx.bom.request.Script#dispose)
 * @require(qx.bom.request.Script#isDisposed)
 * @require(qx.bom.request.Script#getAllResponseHeaders)
 * @require(qx.bom.request.Script#getResponseHeader)
 * @require(qx.bom.request.Script#setDetermineSuccess)
 * @require(qx.bom.request.Script#setRequestHeader)
 *
 * @group (IO)
 */
qx.Bootstrap.define("qx.bom.request.Script", {
  construct : function(){

    this.__dH();
    this.__dx = qx.Bootstrap.bind(this._onNativeLoad, this);
    this.__dy = qx.Bootstrap.bind(this._onNativeError, this);
    this.__dz = qx.Bootstrap.bind(this._onTimeout, this);
    this.__dA = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
    this._emitter = new qx.event.Emitter();
    // BUGFIX: Browsers not supporting error handler
    // Set default timeout to capture network errors
    //
    // Note: The script is parsed and executed, before a "load" is fired.
    this.timeout = this.__dJ() ? 0 : 15000;
  },
  events : {
    /** Fired at ready state changes. */
    "readystatechange" : "qx.bom.request.Script",
    /** Fired on error. */
    "error" : "qx.bom.request.Script",
    /** Fired at loadend. */
    "loadend" : "qx.bom.request.Script",
    /** Fired on timeouts. */
    "timeout" : "qx.bom.request.Script",
    /** Fired when the request is aborted. */
    "abort" : "qx.bom.request.Script",
    /** Fired on successful retrieval. */
    "load" : "qx.bom.request.Script"
  },
  members : {
    /**
     * @type {Number} Ready state.
     *
     * States can be:
     * UNSENT:           0,
     * OPENED:           1,
     * LOADING:          2,
     * LOADING:          3,
     * DONE:             4
     *
     * Contrary to {@link qx.bom.request.Xhr#readyState}, the script transport
     * does not receive response headers. For compatibility, another LOADING
     * state is implemented that replaces the HEADERS_RECEIVED state.
     */
    readyState : null,
    /**
     * @type {Number} The status code.
     *
     * Note: The script transport cannot determine the HTTP status code.
     */
    status : null,
    /**
     * @type {String} The status text.
     *
     * The script transport does not receive response headers. For compatibility,
     * the statusText property is set to the status casted to string.
     */
    statusText : null,
    /**
     * @type {Number} Timeout limit in milliseconds.
     *
     * 0 (default) means no timeout.
     */
    timeout : null,
    /**
     * @type {Function} Function that is executed once the script was loaded.
     */
    __dB : null,
    /**
     * Add an event listener for the given event name.
     *
     * @param name {String} The name of the event to listen to.
     * @param listener {Function} The function to execute when the event is fired
     * @param ctx {var?} The context of the listener.
     * @return {qx.bom.request.Script} Self for chaining.
     */
    on : function(name, listener, ctx){

      this._emitter.on(name, listener, ctx);
      return this;
    },
    /**
     * Initializes (prepares) request.
     *
     * @param method {String}
     *   The HTTP method to use.
     *   This parameter exists for compatibility reasons. The script transport
     *   does not support methods other than GET.
     * @param url {String}
     *   The URL to which to send the request.
     */
    open : function(method, url){

      if(this.__dF){

        return;
      };
      // Reset XHR properties that may have been set by previous request
      this.__dH();
      this.__dC = null;
      this.__dD = url;
      if(this.__dM("qx.debug.io")){

        qx.Bootstrap.debug(qx.bom.request.Script, "Open native request with " + "url: " + url);
      };
      this._readyStateChange(1);
    },
    /**
     * Appends a query parameter to URL.
     *
     * This method exists for compatibility reasons. The script transport
     * does not support request headers. However, many services parse query
     * parameters like request headers.
     *
     * Note: The request must be initialized before using this method.
     *
     * @param key {String}
     *  The name of the header whose value is to be set.
     * @param value {String}
     *  The value to set as the body of the header.
     * @return {qx.bom.request.Script} Self for chaining.
     */
    setRequestHeader : function(key, value){

      if(this.__dF){

        return null;
      };
      var param = {
      };
      if(this.readyState !== 1){

        throw new Error("Invalid state");
      };
      param[key] = value;
      this.__dD = qx.util.Uri.appendParamsToUrl(this.__dD, param);
      return this;
    },
    /**
     * Sends request.
     * @return {qx.bom.request.Script} Self for chaining.
     */
    send : function(){

      if(this.__dF){

        return null;
      };
      var script = this.__dK(),head = this.__dA,that = this;
      if(this.timeout > 0){

        this.__dE = window.setTimeout(this.__dz, this.timeout);
      };
      if(this.__dM("qx.debug.io")){

        qx.Bootstrap.debug(qx.bom.request.Script, "Send native request");
      };
      // Attach script to DOM
      head.insertBefore(script, head.firstChild);
      // The resource is loaded once the script is in DOM.
      // Assume HEADERS_RECEIVED and LOADING and dispatch async.
      window.setTimeout(function(){

        that._readyStateChange(2);
        that._readyStateChange(3);
      });
      return this;
    },
    /**
     * Aborts request.
     * @return {qx.bom.request.Script} Self for chaining.
     */
    abort : function(){

      if(this.__dF){

        return null;
      };
      this.__dC = true;
      this.__dL();
      this._emit("abort");
      return this;
    },
    /**
     * Helper to emit events and call the callback methods.
     * @param event {String} The name of the event.
     */
    _emit : function(event){

      this["on" + event]();
      this._emitter.emit(event, this);
    },
    /**
     * Event handler for an event that fires at every state change.
     *
     * Replace with custom method to get informed about the communication progress.
     */
    onreadystatechange : function(){
    },
    /**
     * Event handler for XHR event "load" that is fired on successful retrieval.
     *
     * Note: This handler is called even when an invalid script is returned.
     *
     * Warning: Internet Explorer < 9 receives a false "load" for invalid URLs.
     * This "load" is fired about 2 seconds after sending the request. To
     * distinguish from a real "load", consider defining a custom check
     * function using {@link #setDetermineSuccess} and query the status
     * property. However, the script loaded needs to have a known impact on
     * the global namespace. If this does not work for you, you may be able
     * to set a timeout lower than 2 seconds, depending on script size,
     * complexity and execution time.
     *
     * Replace with custom method to listen to the "load" event.
     */
    onload : function(){
    },
    /**
     * Event handler for XHR event "loadend" that is fired on retrieval.
     *
     * Note: This handler is called even when a network error (or similar)
     * occurred.
     *
     * Replace with custom method to listen to the "loadend" event.
     */
    onloadend : function(){
    },
    /**
     * Event handler for XHR event "error" that is fired on a network error.
     *
     * Note: Some browsers do not support the "error" event.
     *
     * Replace with custom method to listen to the "error" event.
     */
    onerror : function(){
    },
    /**
    * Event handler for XHR event "abort" that is fired when request
    * is aborted.
    *
    * Replace with custom method to listen to the "abort" event.
    */
    onabort : function(){
    },
    /**
    * Event handler for XHR event "timeout" that is fired when timeout
    * interval has passed.
    *
    * Replace with custom method to listen to the "timeout" event.
    */
    ontimeout : function(){
    },
    /**
     * Get a single response header from response.
     *
     * Note: This method exists for compatibility reasons. The script
     * transport does not receive response headers.
     *
     * @param key {String}
     *  Key of the header to get the value from.
     * @return {String|null} Warning message or <code>null</code> if the request
     * is disposed
     */
    getResponseHeader : function(key){

      if(this.__dF){

        return null;
      };
      if(this.__dM("qx.debug")){

        qx.Bootstrap.debug("Response header cannot be determined for " + "requests made with script transport.");
      };
      return "unknown";
    },
    /**
     * Get all response headers from response.
     *
     * Note: This method exists for compatibility reasons. The script
     * transport does not receive response headers.
     * @return {String|null} Warning message or <code>null</code> if the request
     * is disposed
     */
    getAllResponseHeaders : function(){

      if(this.__dF){

        return null;
      };
      if(this.__dM("qx.debug")){

        qx.Bootstrap.debug("Response headers cannot be determined for" + "requests made with script transport.");
      };
      return "Unknown response headers";
    },
    /**
     * Determine if loaded script has expected impact on global namespace.
     *
     * The function is called once the script was loaded and must return a
     * boolean indicating if the response is to be considered successful.
     *
     * @param check {Function} Function executed once the script was loaded.
     *
     */
    setDetermineSuccess : function(check){

      this.__dB = check;
    },
    /**
     * Dispose object.
     */
    dispose : function(){

      var script = this.__dG;
      if(!this.__dF){

        // Prevent memory leaks
        if(script){

          script.onload = script.onreadystatechange = null;
          this.__dL();
        };
        if(this.__dE){

          window.clearTimeout(this.__dE);
        };
        this.__dF = true;
      };
    },
    /**
     * Check if the request has already beed disposed.
     * @return {Boolean} <code>true</code>, if the request has been disposed.
     */
    isDisposed : function(){

      return !!this.__dF;
    },
    /*
    ---------------------------------------------------------------------------
      PROTECTED
    ---------------------------------------------------------------------------
    */
    /**
     * Get URL of request.
     *
     * @return {String} URL of request.
     */
    _getUrl : function(){

      return this.__dD;
    },
    /**
     * Get script element used for request.
     *
     * @return {Element} Script element.
     */
    _getScriptElement : function(){

      return this.__dG;
    },
    /**
     * Handle timeout.
     */
    _onTimeout : function(){

      this.__dI();
      if(!this.__dJ()){

        this._emit("error");
      };
      this._emit("timeout");
      if(!this.__dJ()){

        this._emit("loadend");
      };
    },
    /**
     * Handle native load.
     */
    _onNativeLoad : function(){

      var script = this.__dG,determineSuccess = this.__dB,that = this;
      // Aborted request must not fire load
      if(this.__dC){

        return;
      };
      // BUGFIX: IE < 9
      // When handling "readystatechange" event, skip if readyState
      // does not signal loaded script
      if(this.__dM("engine.name") === "mshtml" && this.__dM("browser.documentmode") < 9){

        if(!(/loaded|complete/).test(script.readyState)){

          return;
        } else {

          if(this.__dM("qx.debug.io")){

            qx.Bootstrap.debug(qx.bom.request.Script, "Received native readyState: loaded");
          };
        };
      };
      if(this.__dM("qx.debug.io")){

        qx.Bootstrap.debug(qx.bom.request.Script, "Received native load");
      };
      // Determine status by calling user-provided check function
      if(determineSuccess){

        // Status set before has higher precedence
        if(!this.status){

          this.status = determineSuccess() ? 200 : 500;
        };
      };
      if(this.status === 500){

        if(this.__dM("qx.debug.io")){

          qx.Bootstrap.debug(qx.bom.request.Script, "Detected error");
        };
      };
      if(this.__dE){

        window.clearTimeout(this.__dE);
      };
      window.setTimeout(function(){

        that._success();
        that._readyStateChange(4);
        that._emit("load");
        that._emit("loadend");
      });
    },
    /**
     * Handle native error.
     */
    _onNativeError : function(){

      this.__dI();
      this._emit("error");
      this._emit("loadend");
    },
    /*
    ---------------------------------------------------------------------------
      PRIVATE
    ---------------------------------------------------------------------------
    */
    /**
     * @type {Element} Script element
     */
    __dG : null,
    /**
     * @type {Element} Head element
     */
    __dA : null,
    /**
     * @type {String} URL
     */
    __dD : "",
    /**
     * @type {Function} Bound _onNativeLoad handler.
     */
    __dx : null,
    /**
     * @type {Function} Bound _onNativeError handler.
     */
    __dy : null,
    /**
     * @type {Function} Bound _onTimeout handler.
     */
    __dz : null,
    /**
     * @type {Number} Timeout timer iD.
     */
    __dE : null,
    /**
     * @type {Boolean} Whether request was aborted.
     */
    __dC : null,
    /**
     * @type {Boolean} Whether request was disposed.
     */
    __dF : null,
    /*
    ---------------------------------------------------------------------------
      HELPER
    ---------------------------------------------------------------------------
    */
    /**
     * Initialize properties.
     */
    __dH : function(){

      this.readyState = 0;
      this.status = 0;
      this.statusText = "";
    },
    /**
     * Change readyState.
     *
     * @param readyState {Number} The desired readyState
     */
    _readyStateChange : function(readyState){

      this.readyState = readyState;
      this._emit("readystatechange");
    },
    /**
     * Handle success.
     */
    _success : function(){

      this.__dL();
      this.readyState = 4;
      // By default, load is considered successful
      if(!this.status){

        this.status = 200;
      };
      this.statusText = "" + this.status;
    },
    /**
     * Handle failure.
     */
    __dI : function(){

      this.__dL();
      this.readyState = 4;
      this.status = 0;
      this.statusText = null;
    },
    /**
     * Looks up whether browser supports error handler.
     *
     * @return {Boolean} Whether browser supports error handler.
     */
    __dJ : function(){

      var isLegacyIe = this.__dM("engine.name") === "mshtml" && this.__dM("browser.documentmode") < 9;
      var isOpera = this.__dM("engine.name") === "opera";
      return !(isLegacyIe || isOpera);
    },
    /**
     * Create and configure script element.
     *
     * @return {Element} Configured script element.
     */
    __dK : function(){

      var script = this.__dG = document.createElement("script");
      script.src = this.__dD;
      script.onerror = this.__dy;
      script.onload = this.__dx;
      // BUGFIX: IE < 9
      // Legacy IEs do not fire the "load" event for script elements.
      // Instead, they support the "readystatechange" event
      if(this.__dM("engine.name") === "mshtml" && this.__dM("browser.documentmode") < 9){

        script.onreadystatechange = this.__dx;
      };
      return script;
    },
    /**
     * Remove script element from DOM.
     */
    __dL : function(){

      var script = this.__dG;
      if(script && script.parentNode){

        this.__dA.removeChild(script);
      };
    },
    /**
     * Proxy Environment.get to guard against env not being present yet.
     *
     * @param key {String} Environment key.
     * @return {var} Value of the queried environment key
     * @lint environmentNonLiteralKey(key)
     */
    __dM : function(key){

      if(qx && qx.core && qx.core.Environment){

        return qx.core.Environment.get(key);
      } else {

        if(key === "engine.name"){

          return qx.bom.client.Engine.getName();
        };
        if(key === "browser.documentmode"){

          return qx.bom.client.Browser.getDocumentMode();
        };
        if(key == "qx.debug.io"){

          return false;
        };
        throw new Error("Unknown environment key at this phase");
      };
    }
  },
  defer : function(){

    if(qx && qx.core && qx.core.Environment){

      qx.core.Environment.add("qx.debug.io", false);
    };
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/**
 * Basic implementation for an event emitter. This supplies a basic and
 * minimalistic event mechanism.
 */
qx.Bootstrap.define("qx.event.Emitter", {
  extend : Object,
  statics : {
    /** Static storage for all event listener */
    __dN : []
  },
  members : {
    __dO : null,
    __dP : null,
    /**
     * Attach a listener to the event emitter. The given <code>name</code>
     * will define the type of event. Handing in a <code>'*'</code> will
     * listen to all events emitted by the event emitter.
     *
     * @param name {String} The name of the event to listen to.
     * @param listener {Function} The function execute on {@link #emit}.
     * @param ctx {var?Window} The context of the listener.
     * @return {Integer} An unique <code>id</code> for the attached listener.
     */
    on : function(name, listener, ctx){

      var id = qx.event.Emitter.__dN.length;
      this.__dQ(name).push({
        listener : listener,
        ctx : ctx,
        id : id
      });
      qx.event.Emitter.__dN.push({
        name : name,
        listener : listener,
        ctx : ctx
      });
      return id;
    },
    /**
     * Attach a listener to the event emitter which will be executed only once.
     * The given <code>name</code> will define the type of event. Handing in a
     * <code>'*'</code> will listen to all events emitted by the event emitter.
     *
     * @param name {String} The name of the event to listen to.
     * @param listener {Function} The function execute on {@link #emit}.
     * @param ctx {var?Window} The context of the listener.
     * @return {Integer} An unique <code>id</code> for the attached listener.
     */
    once : function(name, listener, ctx){

      var id = qx.event.Emitter.__dN.length;
      this.__dQ(name).push({
        listener : listener,
        ctx : ctx,
        once : true,
        id : id
      });
      qx.event.Emitter.__dN.push({
        name : name,
        listener : listener,
        ctx : ctx
      });
      return id;
    },
    /**
     * Remove a listener from the event emitter. The given <code>name</code>
     * will define the type of event.
     *
     * @param name {String} The name of the event to listen to.
     * @param listener {Function} The function execute on {@link #emit}.
     * @param ctx {var?Window} The context of the listener.
     * @return {Integer|null} The listener's id if it was removed or
     * <code>null</code> if it wasn't found
     */
    off : function(name, listener, ctx){

      var storage = this.__dQ(name);
      for(var i = storage.length - 1;i >= 0;i--){

        var entry = storage[i];
        if(entry.listener == listener && entry.ctx == ctx){

          storage.splice(i, 1);
          qx.event.Emitter.__dN[entry.id] = null;
          return entry.id;
        };
      };
      return null;
    },
    /**
     * Removes the listener identified by the given <code>id</code>. The id
     * will be return on attaching the listener and can be stored for removing.
     *
     * @param id {Integer} The id of the listener.
     * @return {Integer|null} The listener's id if it was removed or
     * <code>null</code> if it wasn't found
     */
    offById : function(id){

      var entry = qx.event.Emitter.__dN[id];
      if(entry){

        this.off(entry.name, entry.listener, entry.ctx);
      };
      return null;
    },
    /**
     * Alternative for {@link #on}.
     * @param name {String} The name of the event to listen to.
     * @param listener {Function} The function execute on {@link #emit}.
     * @param ctx {var?Window} The context of the listener.
     * @return {Integer} An unique <code>id</code> for the attached listener.
     */
    addListener : function(name, listener, ctx){

      return this.on(name, listener, ctx);
    },
    /**
     * Alternative for {@link #once}.
     * @param name {String} The name of the event to listen to.
     * @param listener {Function} The function execute on {@link #emit}.
     * @param ctx {var?Window} The context of the listener.
     * @return {Integer} An unique <code>id</code> for the attached listener.
     */
    addListenerOnce : function(name, listener, ctx){

      return this.once(name, listener, ctx);
    },
    /**
     * Alternative for {@link #off}.
     * @param name {String} The name of the event to listen to.
     * @param listener {Function} The function execute on {@link #emit}.
     * @param ctx {var?Window} The context of the listener.
     */
    removeListener : function(name, listener, ctx){

      this.off(name, listener, ctx);
    },
    /**
     * Alternative for {@link #offById}.
     * @param id {Integer} The id of the listener.
     */
    removeListenerById : function(id){

      this.offById(id);
    },
    /**
     * Emits an event with the given name. The data will be passed
     * to the listener.
     * @param name {String} The name of the event to emit.
     * @param data {var?undefined} The data which should be passed to the listener.
     */
    emit : function(name, data){

      var storage = this.__dQ(name);
      for(var i = 0;i < storage.length;i++){

        var entry = storage[i];
        entry.listener.call(entry.ctx, data);
        if(entry.once){

          storage.splice(i, 1);
          i--;
        };
      };
      // call on any
      storage = this.__dQ("*");
      for(var i = storage.length - 1;i >= 0;i--){

        var entry = storage[i];
        entry.listener.call(entry.ctx, data);
      };
    },
    /**
     * Returns the internal attached listener.
     * @internal
     * @return {Map} A map which has the event name as key. The values are
     *   arrays containing a map with 'listener' and 'ctx'.
     */
    getListeners : function(){

      return this.__dO;
    },
    /**
     * Internal helper which will return the storage for the given name.
     * @param name {String} The name of the event.
     * @return {Array} An array which is the storage for the listener and
     *   the given event name.
     */
    __dQ : function(name){

      if(this.__dO == null){

        this.__dO = {
        };
      };
      if(this.__dO[name] == null){

        this.__dO[name] = [];
      };
      return this.__dO[name];
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Basic runtime detection for qooxdoo.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 *
 * @ignore(environment)
 * @ignore(process)
 * @ignore(Titanium)
 */
qx.Bootstrap.define("qx.bom.client.Runtime", {
  statics : {
    /**
     * Checks for the name of the runtime and returns it. In general, it checks
     * for rhino and node.js and if that could not be detected, it falls back
     * to the browser name defined by {@link qx.bom.client.Browser#getName}.
     * @return {String} The name of the current runtime.
     * @internal
     * @ignore(environment, process, Titanium.*)
     */
    getName : function(){

      var name = "";
      // check for the Rhino runtime
      if(typeof environment !== "undefined"){

        name = "rhino";
      } else if(typeof process !== "undefined"){

        name = "node.js";
      } else if(typeof Titanium !== "undefined" && typeof Titanium.userAgent !== "undefined"){

        name = "titanium";
      } else {

        // otherwise, we think its a browser
        name = qx.bom.client.Browser.getName();
      };;
      return name;
    }
  },
  defer : function(statics){

    qx.core.Environment.add("runtime.name", statics.getName);
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */
/* ************************************************************************
 ************************************************************************ */
/**
 * Automated GUI test of a qooxdoo application using QxSelenium. Provides access
 * to the AUT's log messages and any exceptions caught by qooxdoo's global error
 * handling. Also supports event testing.
 *
 * @ignore(environment)
 */
qx.Class.define("simulator.Simulation", {
  extend : qx.core.Object,
  type : "singleton",
  /**
   * @param options {Map} Configuration settings
   */
  construct : function(){

    this.__dR = {
      autHost : qx.core.Environment.get("simulator.autHost"),
      autPath : qx.core.Environment.get("simulator.autPath"),
      threadSafe : qx.core.Environment.get("simulator.threadSafe") || false,
      applicationLog : qx.core.Environment.get("simulator.applicationLog") || false,
      globalErrorLogging : qx.core.Environment.get("simulator.globalErrorLogging") || false,
      testEvents : qx.core.Environment.get("simulator.testEvents") || false
    };
    this.startDate = new Date();
    // for backwards compatibility:
    this.qxSelenium = simulator.QxSelenium.getInstance();
  },
  statics : {
    AUTWINDOW : 'selenium.qxStoredVars["autWindow"]',
    QXAPPLICATION : 'qx.core.Init.getApplication()'
  },
  members : {
    __dR : null,
    /**
     * Starts the QxSelenium session, opens the AUT in the browser and waits
     * until the qooxdoo application is ready. Also makes the necessary
     * preparations to enable global error logging and/or application log
     * extraction if these options are configured.
     */
    startSession : function(){

      if(!this.__dR.threadSafe){

        // Using Selenium Grid's ThreadSafeSeleniumSessionStorage, session
        // should already be started.
        simulator.QxSelenium.getInstance().start();
      };
      var autUri = this.__dR.autHost + "" + this.__dR.autPath;
      this.qxOpen(autUri);
      this.waitForQxApplication();
      this._includeFeatures();
    },
    /**
     * Includes and initializes features as configured by settings
     */
    _includeFeatures : function(){

      if(this.__dR.globalErrorLogging || this.__dR.testEvents){

        qx.Class.include(simulator.Simulation, simulator.MGlobalErrorHandling);
        this._addGlobalErrorHandler();
        this._addGlobalErrorGetter();
      };
      if(this.__dR.applicationLog || this.__dR.disposerDebug){

        qx.Class.include(simulator.Simulation, simulator.MApplicationLogging);
        this._addAutLogStore();
        this._addAutLogGetter();
      };
      if(this.__dR.testEvents){

        qx.Class.include(simulator.Simulation, simulator.MEventSupport);
        this._addListenerSupport();
      };
    },
    /**
     * Waits until qx.core.Init.getApplication() in the AUT window returns
     * something.
     *
     * @param timeout {Integer} Time to wait (in milliseconds). Default: 3000
     * @param window {DOMWindow} Window the qooxdoo application is running in
     * @throws {Error} If the application isn't ready within the timeout
     */
    waitForQxApplication : function(timeout, window){

      var qxWin = window || simulator.Simulation.AUTWINDOW;
      var qxAppReady = 'var qxReady = false; try { if (' + qxWin + '.' + simulator.Simulation.QXAPPLICATION + ') { qxReady = true; } } catch(e) {} qxReady;';
      simulator.QxSelenium.getInstance().waitForCondition(qxAppReady, timeout || 30000);
    },
    /**
         * Uses the given locator to search the AUT for a qooxdoo widget. If found,
         * the return value of its toString method is returned. Otherwise, null is
         * returned.
         *
         * @param locator {String} (Qx)Selenium locator string
         * @return {String|null} String representation of the widget or null
         */
    getWidgetOrNull : function(locator){

      var snippet = 'selenium.getQxWidgetByLocator("' + locator + '")';
      var widget;
      try{

        widget = String(simulator.QxSelenium.getInstance().getEval(snippet));
      } catch(ex) {

        widget = null;
      };
      return widget;
    },
    /**
     * Uses the given locator to search the AUT for a qooxdoo widget. If found,
     * the getter function for the property with the given name is called
     * and the value is returned. If no widget is found or the property does not
     * exist, null is returned.
     *
     * @param locator {String} (Qx)Selenium locator string
     * @param property {String} Name of a qooxdoo property
     * @return {String|null} Property value string or null
     */
    getWidgetPropertyValueOrNull : function(locator, property){

      var propertyName = qx.lang.String.firstUp(property);
      var snippet = 'selenium.getQxObjectFunction("' + locator + '", "get' + propertyName + '")';
      var propertyValue;
      try{

        propertyValue = String(simulator.QxSelenium.getInstance().getEval(snippet));
      } catch(ex) {

        propertyValue = null;
      };
      return propertyValue;
    },
    /**
     * Repeatedly tries to find a visible widget using the given locator until
     * the timeout is reached.
     *
     * @param locator {String} (Qx)Selenium locator string
     * @param timeout {Integer?} Timeout in milliseconds. Default: 5000
     */
    waitForWidget : function(locator, timeout){

      locator = locator.replace(/\"/g, '\\"');
      var snippet = '(function() {\
        try {\
          var widget = selenium.getQxWidgetByLocator("' + locator + '");\
        } catch(ex) {\
          return false;\
        }\
        return widget.isVisible();\
      })()';
      var timeout = timeout || 5000;
      try{

        simulator.QxSelenium.getInstance().waitForCondition(snippet, timeout.toString());
      } catch(ex) {

        if(ex.toString().match(/Timed out after/)){

          // Use a more meaningful error message
          throw new Error("waitForWidget: No visible widget found for locator " + locator + " in " + timeout + "ms!");
        } else {

          //something else went wrong
          throw ex;
        };
      };
    },
    /**
     * Adds a map to the global selenium object in the AUT that is used to store
     * testing-related data. Also stores a reference to the AUT's window object
     * that is used to avoid calling
     * <code>selenium.browserbot.getCurrentWindow()</code> repeatedly.
     * This method must called be whenever a qooxdoo application is (re)loaded.
     */
    _setupEnvironment : function(){

      /*
       * Store the AUT window object to avoid calling
       * selenium.browserbot.getCurrentWindow() repeatedly.
       */
      simulator.QxSelenium.getInstance().getEval('selenium.qxStoredVars = {}');
      this._storeEval('selenium.browserbot.getCurrentWindow()', 'autWindow');
      this._prepareNameSpace();
    },
    /**
     * Attaches a "Simulation" namespace object to the specified window's qx
     * object. This will be used to store custom methods added by the testing
     * framework using {@see #_addOwnFunction}. If no window is specified, the
     * AUT's window is used.
     *
     * @param win {String?} JavaScript snippet that evaluates as a Window object
     * accessible from the current Selenium instance. Default: The AUT's window.
     */
    _prepareNameSpace : function(win){

      var targetWin = win || 'selenium.qxStoredVars["autWindow"]';
      var ns = String(simulator.QxSelenium.getInstance().getEval(targetWin + '.qx.Simulation'));
      if(ns == "null" || ns == "undefined"){

        simulator.QxSelenium.getInstance().getEval(targetWin + '.qx.Simulation = {};');
      };
    },
    /**
     * Evaluates a JavaScript snippet and stores the result in the
     * "qxStoredVars" map attached to the AUT's global selenium object.
     * Stored values can be retrieved through Selenium.getEval:
     * <code>getEval('selenium.qxStoredVars["keyName"]')</code>
     *
     * @param code {String} JavaScript snippet to be evaluated
     * @param keyName {String} The name for the key the eval result will be
     * stored under.
     */
    _storeEval : function(code, keyName){

      if(!code){

        throw new Error("No code specified for _storeEval()");
      };
      if(!keyName){

        throw new Error("No key name specified for _storeEval()");
      };
      simulator.QxSelenium.getInstance().getEval('selenium.qxStoredVars["' + keyName + '"] = ' + String(code));
    },
    /**
     * Adds a user-defined function to the "qx.Simulation" namespace of the
     * application under test. This function can then be called using
     * <code>selenium.getEval("selenium.browserbot.getCurrentWindow().qx.Simulation.funcName();")</code>
     *
     * @param funcName {String} name of the function to be added
     * @param func {Function|String} the function to be added
     */
    _addOwnFunction : function(funcName, func){

      if(!funcName){

        throw new Error("Please choose a name for the function to be added.");
      };
      if(!func){

        throw new Error("No function specified.");
      };
      if(typeof func != "string"){

        func = func.toString();
      };
      func = func.replace(/\n/, '');
      func = func.replace(/\r/, '');
      simulator.QxSelenium.getInstance().getEval('selenium.browserbot.getCurrentWindow().qx.Simulation.' + funcName + ' = ' + func);
    },
    /**
     * Adds a user-defined function to the "qx.Simulation" namespace of the
     * application under test. This function can then be called using
     * <code>selenium.getEval("selenium.browserbot.getCurrentWindow().qx.Simulation[functionName]();")</code>
     *
     * In contrast to {@link _addOwnFunction}, the AUT window's Function object is
     * used to instantiate a "local" function. This is necessary e.g. in FF6+,
     * where function obejcts from other windows don't have the same properties
     * and methods, meaning e.g. they can't be used as qx event listener callbacks.
     *
     * @internal
     * @param name {String} name of the function to be added
     * @param func {Function} The function to be added
     * @param args {String[]?} Optional list of arguments for the function
     */
    addFunctionToAut : function(name, func, args){

      if(qx.core.Environment.get("qx.debug")){

        qx.core.Assert.assertString(name, "simulator.Simulation.addFunctionToAut: First argument must be a String!");
        qx.core.Assert.assertFunction(func, "simulator.Simulation.addFunctionToAut: Second argument must be a function!");
      };
      // replace newlines and double quotes
      func = func.toString().replace(/\n/g, "").replace(/\r/g, "").replace(/"/g, '\\"');
      var match = /\((.*?)\)\s*?\{(.*)\}/.exec(func);
      if(!match || !match[2]){

        throw new Error("simulator.Simulation.addFunctionToAut: Couldn't parse function " + func);
      };
      var argStr = args ? '"' + args.join('", "') + '", ' : "";
      var body = match[2];
      var code = '(function() {var autWin = selenium.browserbot.getCurrentWindow(); autWin.qx.Simulation.' + name + ' = new autWin.Function(' + argStr + ' "' + body + '")})()';
      simulator.QxSelenium.getInstance().getEval(code);
    },
    /**
     * Logs the Simulation's start date, URL of the AUT and the operating system
     * platform.
     *
     * @ignore(environment)
     */
    logEnvironment : function(){

      this.info("Simulator run on " + this.startDate.toUTCString());
      this.info("Application under test: " + this.__dR.autHost + unescape(this.__dR.autPath));
      this.info("Platform: " + environment["os.name"]);
    },
    /**
     * Logs the test browser's user agent string.
     */
    logUserAgent : function(){

      var agent = simulator.QxSelenium.getInstance().getEval('navigator.userAgent');
      this.info("User agent: " + agent);
    },
    /**
     * Logs disposer debug messages, exceptions caught by qooxdoo's global error
     * handling and/or the AUT's log messages, depending on the test
     * configuration used.
     * Note: Disposer debug logging will shut down the qx application so this
     * should be the last action of the test case.
     */
    logResults : function(){

      if(this.__dR.disposerDebug){

        var getDisposerDebugLevel = simulator.Simulation.AUTWINDOW + ".qx.core.Environment.get('qx.debug.dispose.level')";
        var disposerDebugLevel = simulator.QxSelenium.getInstance().getEval(getDisposerDebugLevel);
        if(parseInt(disposerDebugLevel, 10) > 0){

          this.qxShutdown();
        } else {

          this.warn("Dispose logging is active but the application's disposer debug level is 0!");
        };
      };
      if(this.__dR.globalErrorLogging){

        this.logGlobalErrors();
      };
      if(this.__dR.applicationLog || this.__dR.disposerDebug){

        this.logAutLogEntries();
      };
    },
    /**
     * Logs the total duration of this simulation.
     */
    logRunTime : function(){

      var stopDate = new Date();
      var elapsed = stopDate.getTime() - this.startDate.getTime();
      elapsed = (elapsed / 1000);
      var min = Math.floor(elapsed / 60);
      var sec = Math.round(elapsed % 60);
      if(sec < 10){

        sec = "0" + sec;
      };
      this.info("Simulator run finished in: " + min + " minutes " + sec + " seconds.");
    },
    /**
     * Pauses test execution for a given amount of time.
     *
     * @param interval {Integer} Time (in milliseconds) to wait.
     */
    wait : function(interval){

      Packages.java.lang.Thread.sleep(interval);
    },
    /**
     * Shuts down the AUT's qooxdoo application.
     */
    qxShutdown : function(){

      simulator.QxSelenium.getInstance().getEval(simulator.Simulation.AUTWINDOW + '.qx.core.ObjectRegistry.shutdown()', "Shutting down qooxdoo application");
    },
    /**
     * Loads a qooxdoo application in the test browser and prepares
     * it for testing. If no URI is given, the current AUT is reloaded.
     *
     * @param uri {String?} Optional URI of the qooxdoo application to be
     * loaded. Default: The AUT host/path defined in the settings.
     */
    qxOpen : function(uri){

      var openUri = uri || this.__dR.autHost + "" + this.__dR.autPath;
      simulator.QxSelenium.getInstance().open(openUri);
      simulator.QxSelenium.getInstance().waitForCondition("selenium.browserbot.getCurrentWindow().qx", 5000);
      this._setupEnvironment();
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */
/**
 * Imports the com.thoughtworks.selenium.QxSelenium Java class and creates
 * an instance. If the "simulator.threadSafe" setting is active, a session
 * created by Selenium Grid's ThreadSafeSeleniumSessionStorage is returned
 * instead.
 *
 * QxSelenium extends DefaultSelenium (see {@link http://jarvana.com/jarvana/view/org/seleniumhq/selenium/selenium-rc-documentation/1.0/selenium-rc-documentation-1.0-doc.zip!/java/com/thoughtworks/selenium/DefaultSelenium.html}),
 * adding the qooxdoo-specific commands documented below.
 *
 * Commands that simulate mouse clicks such as {@link #qxClick} take a
 * parameter that allows configuring the generated events. The value  must be a
 * string of comma-separated __key=value pairs__. The following settings are
 * supported:
 *
 *  <pre>double: fire a "dblclick" event
 *   - possible values: true, false
 *   - default value  : false
 *  button: the mouse button to be pressed
 *   - possible values: left, right, middle
 *   - default value  : left
 *  clientX and clientY: mouse coordinates
 *   - possible values: any positive integer
 *   - default value  : 0
 *  shiftKey, altKey, metaKey: additional modifier keys being pressed while
 *  clicking
 *   - possible values: true, false
 *   - default value  : false</pre>
 *
 * Getter commands will always return a Java string object. This should always
 * be converted to a JavaScript string for comparisons or string operations,
 * e.g. by calling String(qxSeleniumReturnValue)
 *
 * @ignore(importClass)
 * @ignore(QxSelenium)
 * @ignore(ThreadSafeSeleniumSessionStorage.*)
 */
qx.Class.define("simulator.QxSelenium", {
  extend : qx.core.Object,
  type : "singleton",
  construct : function(){

    qx.core.Object.call(this);
    var server = qx.core.Environment.get("simulator.selServer");
    var port = qx.core.Environment.get("simulator.selPort");
    var browser = qx.core.Environment.get("simulator.testBrowser");
    var host = qx.core.Environment.get("simulator.autHost");
    var threadSafe = qx.core.Environment.get("simulator.threadSafe");
    if(threadSafe){

      try{

        importClass(Packages.com.thoughtworks.selenium.grid.tools.ThreadSafeSeleniumSessionStorage);
      } catch(ex) {

        throw new Error("Couldn't import ThreadSafeSeleniumSessionStorage class!\n\
         Make sure the Selenium Grid Tools are available.\n" + ex);
      };
      // Create and configure QxSelenium instance
      ThreadSafeSeleniumSessionStorage.startSeleniumSession(server, port, browser, host);
      return ThreadSafeSeleniumSessionStorage.session();
    } else {

      // Basic sanity check: No sense in continuing without QxSelenium.
      try{

        importClass(Packages.com.thoughtworks.selenium.QxSelenium);
      } catch(ex) {

        throw new Error("Couldn't import QxSelenium class! Make sure the qooxdoo " + "Selenium user extensions are installed in your Selenium client.\n" + ex);
      };
      // Create and configure QxSelenium instance
      return new QxSelenium(server, port, browser, host);
    };
  },
  /*
  *****************************************************************************
     These stubs are for documentation purposes only, the actual implementation
     is in the user extensions for Selenium
     (component/simulator/tool/user-extension/user-extensions.js)
  *****************************************************************************
  */
  members : {
    /**
     * Clicks on a qooxdoo widget.
     * Always synthesizes the following events: __mouseover__, __mousedown__,
     * __mouseup__.
     * Additionally, __click__, __dblclick__ or __contextmenu__ will be fired
     * depending on the specified params
     *
     * @param locator {String} an element locator that finds a qooxdoo widget's
     * DOM element
     * @param params {String} comma-separated list of additional parameters
     */
    qxClick : function(locator, params){
    },
    /**
     * Clicks on a qooxdoo widget, adding the widget's coordinates to the
     * generated events.
     *
     * @param locator {String} an element locator that finds a qooxdoo widget's
     * DOM element
     * @param params {String} comma-separated list of additional parameters
     */
    qxClickAt : function(locator, params){
    },
    /**
     * Uses the given locator to find a {@link qx.ui.table.Table}, then
     * simulates a click on the table at the given row/column position.
     * Note, your locator should only find the table itself. Sub-widgets, e.g.
     * Composite/Scroller/Clipper will be automatically added to the locator as
     * required.
     *
     * <p>
     * The column to click can be located using the index, ID or name as defined
     * in the table model by adding one of the __col__, __colId__ or __colName__
     * parameters to the "params" string.
     * Alternatively, a specific cell can be located by RegExp matching its
     * content using the __cellValue__ parameter.
     * *NOTE*: This currently only works with tables using a Simple table model
     * ({@link qx.ui.table.model.Simple})!
     *
     * <p>
     * Supported params keys:
     * <pre>- All mouse event parameters
     * - row: Index of the table row to click
     * - col: Index of the table column to click
     * - colId: ID of the column to click
     * - colName: Name of the column to click
     * - cellValue: Content of a (text) cell to click</pre>
     *
     * @param locator {String} an element locator that finds a qooxdoo table's
     * DOM element
     * @param params {String} comma-separated list of additional parameters
     */
    qxTableClick : function(locator, params){
    },
    /**
     * Simulates clicking a header cell of a {@link qx.ui.table.Table}.
     *
     * The column to click can be located using the index, ID or name as defined
     * in the table model by adding one of the __col__, __colId__ or __colName__
     * parameters to the "params" string.
     *
     * @param locator {String} an element locator that finds a qooxdoo table's
     * DOM element
     * @param params {String} comma-separated list of additional parameters
     */
    qxTableHeaderClick : function(locator, params){
    },
    /**
     * Simulates user interaction with editable table cells. *NOTE*: The
     * target cell's editing mode must be activated immediately before this
     * command is used, e.g. by executing a double click on it using the
     * {@link #qxTableClick} command with "double=true" added to the params.
     * <p>
     * The following cell editor types are supported:
    
     * *Text fields* ({@link qx.ui.table.celleditor.PasswordField},
     * {@link qx.ui.table.celleditor.TextField},
     * {@link qx.ui.table.celleditor.ComboBox}): Use either the __type__ or
     * __typeKeys__ parameters (see {@link #qxType} and {@link #qxTypeKeys}).
     * Examples:
     * <pre>qxSelenium.qxEditTableCell("qxh=qx.ui.table.Table", "type=Some text");
     * qxSelenium.qxEditTableCell("myTable", "typeKeys=Lots of events");</pre>
     * <p>
     * *Select boxes* ({@link qx.ui.table.celleditor.SelectBox},
     * {@link qx.ui.table.celleditor.ComboBox}): Use the __selectFromBox__
     * parameter. The value must be a qxh locator step that identifies the list
     * item to be clicked.
     * Examples:
     * <pre>qxSelenium.qxEditTableCell("qxh=qx.ui.table.Table", "selectFromBox=[@label=Germany]");
     * qxSelenium.qxEditTableCell("qxh=qx.ui.table.Table", "selectFromBox=child[2]");</pre>
     * <p>
     * *Checkboxes* ({@link qx.ui.table.celleditor.CheckBox}): Use the
     * __toggleCheckBox__ parameter.
     * Example:
     * <pre>qxSelenium.qxEditTableCell("qxh=qx.ui.table.Table", "toggleCheckBox=foo");</pre>
     * (toggleCheckBox needs a value to be recognized as a valid parameter even
     * though it is ignored.)
     *
     * @param locator {String} an element locator that finds a qooxdoo table's
     * DOM element
     * @param params {String} comma-separated list of additional parameters
     */
    qxEditTableCell : function(locator, params){
    },
    /**
     * Uses the standard qx locators to find a table, then returns the number of
     * rows defined in the table model.
     *
     * @param locator {String} an element locator that finds a qooxdoo table's
     * DOM element
     * @return {Object} The number of rows defined in the table model
     */
    getQxTableRowCount : function(locator){
    },
    /**
     * Uses the standard qx locators to find a table, then returns the number of
     * columns from the table model.
     *
     * @param locator {String} an element locator that finds a qooxdoo table's
     * DOM element
     * @return {Object} The number of columns defined in the table model
     */
    getQxTableModelColCount : function(locator){
    },
    /**
     * Uses the standard qx locators to find a table, then returns the number of
     * currently visible columns.
     *
     * @param locator {String} an element locator that finds a qooxdoo table's
     * DOM element
     * @return {Object} The number of visible columns
     */
    getQxTableVisibleColCount : function(locator){
    },
    /**
     * Uses the standard qx locators to find a table, then returns the value
     * of the specified cell from the table model.
     *
     * @param locator {String} an element locator that finds a qooxdoo table's
     * DOM element
     * @param params {String} A string that should contain row and column
     * identifers (see {@link #qxTableClick}
     * @return {Object} The value of the cell. Primitive types will be returned
     * as strings, Objects will be serialized using JSON.
     */
    getQxTableValue : function(locator, params){
    },
    /**
     * Uses the standard qx locators to find a table then returns a semicolon-
     * separated list of column IDs from the table model. Note that this can
     * differ from the columns that are actually visible in the table.
     *
     * @param locator {String} an element locator that finds a qooxdoo table's
     * DOM element
     * @return {Object} A list of column IDs
     */
    getQxTableModelColumnIds : function(locator){
    },
    /**
     * Uses the standard qx locators to find a table then returns a semicolon-
     * separated list of column IDs. Only visible columns are included.
     *
     * @param locator {String} an element locator that finds a qooxdoo table's
     * DOM element
     * @return {Object} A list of column IDs
     */
    getQxTableVisibleColumnIds : function(locator){
    },
    /**
     * Searches the given table for a column with the given name and returns the
     * visible column index. Note that this can differ from the column's index
     * in the table model if there are invisible columns and/or the column order
     * has been changed.
     *
     * @param locator {String} an element locator that finds a qooxdoo table's
     * DOM element
     * @param name {String} name The column name to be searched for
     * @return {Object} The found column index
     */
    getQxTableColumnIndexByName : function(locator, name){
    },
    /**
     * Returns a qooxdoo table's selected row data (an array of rows which are
     * arrays of cell values). Data will be returned as a JSON string if a JSON
     * implementation is available (either the browser's or qooxdoo's).
     * Otherwise, the return value is a comma-separated string that must be
     * parsed by the caller.
     *
     * @param locator {String} an element locator that finds a qooxdoo table's
     * DOM element
     */
    getQxTableSelectedRowData : function(locator){
    },
    /**
     * Executes the given function of a qooxdoo widget identified by a locator.
     * If the widget does not contain the referenced function, an exception will
     * be thrown.
     *
     * @param locator {String} an element locator that finds a qooxdoo widget's
     * DOM element
     * @param functionName {String} The name of the function to be called
     * @return {Object} The function's return value
     */
    getQxObjectFunction : function(locator, functionName){
    },
    /**
     * Creates a new function with the value of the __script__ parameter as body.
     * This function is bound to the context of the qooxdoo widget returned by
     * the given locator, i.e. __this__ within the script will refer to the
     * widget. The function is then called and the return value is serialized in
     * JSON format (unless it is a string or number) and returned.
     *
     * @param locator {String} an element locator that finds a qooxdoo widget's
     * DOM element
     * @param script {String} JavaScript snippet
     * @return {Object} Return value of the generated function
     */
    getRunInContext : function(locator, script){
    },
    /**
     * Returns a qooxdoo object's ID as generated by qx.core.ObjectRegistry.
     * If only the __locator__ parameter is given, the hash code of the widget
     * it identifies will be returned. If the optional __script__ parameter is
     * given, its value will be executed as a function in the widget's context
     * and the hash of the object it returns will be returned instead. Example:
     *
     * <pre>getQxObjectHash("myTable", "return this.getTableModel();");</pre>
     *
     * will find a qooxdoo table with the HTML ID "myTable" and return the hash
     * of its table model.
     *
     * @param locator {String} an element locator that finds a qooxdoo widget's
     * DOM element
     * @param script {String?} Optional JavaScript snippet to be executed in the
     * widget's context
     * @return {Object} the object's hash code
     */
    getQxObjectHash : function(locator, script){
    },
    /**
     * Simulates dragging an element a certain distance and then dropping it.
     * Optionally executes __mouseover__, __mousemove__ and __mouseup __on a
     * second element specified by __targetLocator__
     *
     * @param locator {String} an element locator that finds a qooxdoo widget's
     * DOM element
     * @param offset {String} offset in pixels from the current location to
     * which the element should be moved, e.g., "+70,-300"
     * @param targetLocator {String?} (optional) locator for the drop target.
     */
    qxDragAndDrop : function(locator, offset, targetLocator){
    },
    /**
     * Simulates dragging an element and dropping it on another element. The
     * second parameter is the locator of the drop target element, e.g.:
     *
     * <pre>qxDragAndDropToObject("qxhv=/qx.ui.form.List/child[0]",
     * "qxhv=qx.ui.form.TextArea");</pre>
     *
     * For qx.ui.table.Table and widgets that inherit from it, drag operations
     * starting from a specific table cell are supported. In this case, the
     * parameters string must contain the information needed to target a cell,
     * as expected by {@link qxTableClick}. Also, the drop target locator must
     * be prefaced with "target=", e.g.:
     *
     * <pre>qxDragAndDropToObject("qxhv=/qx.ui.table.Table",
     * "target=qxhv=qx.ui.form.TextArea,row=5,cell=3");</pre>
     *
     * @param locator {String} an element locator that finds a qooxdoo widget's
     * DOM element
     * @param destination {String} locator for an element whose location (i.e., whose
     * center-most pixel) will be the point where the dragged element is dropped
     */
    qxDragAndDropToObject : function(locator, destination){
    },
    /**
     * Sets the value of a qooxdoo text field widget which can either be the
     * widget returned by the given locator, or one of its child widgets (i.e.
     * for {@link qx.ui.form.ComboBox}).
     * Does *not* simulate key events - only the HTML text field's __value__
     * attribute is set.
     *
     * @param locator {String} an element locator that finds a qooxdoo widget's
     * DOM element
     * @param value {String} the value to set
     */
    qxType : function(locator, value){
    },
    /**
     * Simulates a user entering text into any qooxdoo widget that either
     * inherits from {@link qx.ui.form.AbstractField}  or has a child control
     * that does. __keydown__, __keypress__ and __keyup__ events are fired for
     * each character in the given value.
     *
     * @param locator {String} an element locator that finds a qooxdoo widget's
     * DOM element
     * @param value {String} the value to type
     */
    qxTypeKeys : function(locator, value){
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */
/**
 * Allows GUI tests to access exceptions caught by the tested application's
 * global error handler.
 */
qx.Mixin.define("simulator.MGlobalErrorHandling", {
  members : {
    /**
     * Creates a global error handler that stores JavaScript exceptions thrown
     * in the specified window. Global Error Handling must be enabled in the
     * AUT.
     *
     * @param win {String?} JavaScript snippet that evaluates as a Window object
     * accessible from the current Selenium instance. Default: The AUT's window.
     * @ignore(selenium.qxStoredVars)
     */
    _addGlobalErrorHandler : function(win){

      var qxWin = win || "selenium.qxStoredVars['autWindow']";
      simulator.QxSelenium.getInstance().getEval(qxWin + ".qx.Simulation.errorStore = [];");
      var addHandler = function(autWin){

        var targetWin = autWin || selenium.qxStoredVars['autWindow'];
        targetWin.qx.event.GlobalError.setErrorHandler(function(ex){

          var exString = "";
          if(ex instanceof targetWin.qx.core.GlobalError){

            ex = ex.getSourceException();
          };
          if(ex instanceof targetWin.qx.core.WindowError){

            exString = ex.toString() + " in " + ex.getUri() + " line " + ex.getLineNumber();
          } else {

            exString = ex.name + ": " + ex.message;
            if(ex.fileName){

              exString += " in file " + ex.fileName;
            };
            if(ex.lineNumber){

              exString += " line " + ex.lineNumber;
            };
            if(ex.description){

              exString += " Description: " + ex.description;
            };
            try{

              exString += "Stack: " + targetWin.qx.dev.StackTrace.getStackTraceFromError(ex);
            } catch(e) {

              if(e.stack){

                exString += "Stack: " + e.stack;
              };
            };
          };
          targetWin.qx.Simulation.errorStore.push(exString);
        });
      };
      this.addFunctionToAut("addGlobalErrorHandler", addHandler, ["autWin"]);
      simulator.QxSelenium.getInstance().getEval("selenium.qxStoredVars['autWindow'].qx.Simulation.addGlobalErrorHandler(" + qxWin + ");");
    },
    /**
     * Adds a helper function to the AUT window that reads the contents of the
     * global error store and returns them as a pipe-separated string so they
     * can be read by the test script.
     *
     * @param win {String?} JavaScript snippet that evaluates as a Window object
     * accessible from the current Selenium instance. Default: The AUT's window.
     *
     * @ignore(selenium.qxStoredVars)
     */
    _addGlobalErrorGetter : function(win){

      var getGlobalErrors = function(win){

        var targetWin = win || selenium.qxStoredVars['autWindow'];
        var exceptions = targetWin.qx.Simulation.errorStore;
        var exString = exceptions.join("|");
        return exString;
      };
      this._addOwnFunction("getGlobalErrors", getGlobalErrors);
    },
    /**
     * Returns the error messages of any exceptions caught by the AUT's global
     * error handler.
     *
     * @param win {String?} JavaScript snippet that evaluates as a Window object
     * accessible from the current Selenium instance. Default: The AUT's window.
     * @return {String[]} A list of error messages
     */
    getGlobalErrors : function(win){

      var qxWin = win || "selenium.qxStoredVars['autWindow']";
      var exceptions = simulator.QxSelenium.getInstance().getEval("selenium.qxStoredVars['autWindow'].qx.Simulation.getGlobalErrors(" + qxWin + ")");
      exceptions = String(exceptions);
      if(!exceptions.length > 0){

        return [];
      };
      var globalErrors = String(exceptions).split("|");
      return globalErrors;
    },
    /**
     * Goes through the AUT's global error store and throws an exception for
     * each entry.
     *
     * @param win {String?} JavaScript snippet that evaluates as a Window object
     * accessible to the current Selenium instance. Default: The AUT's window.
     */
    throwGlobalErrors : function(win){

      var globalErrors = this.getGlobalErrors(win);
      for(var i = 0;i < globalErrors.length;i++){

        throw new Error(globalErrors[i]);
      };
    },
    /**
     * Empties the given window's global exception store.
     *
     * @param win {String?} JavaScript snippet that evaluates as a Window object
     * accessible to the current Selenium instance. Default: The AUT's window.
     */
    clearGlobalErrorStore : function(win){

      var targetWin = win || "selenium.qxStoredVars['autWindow']";
      simulator.QxSelenium.getInstance().getEval(targetWin + ".qx.Simulation.errorStore = [];");
    },
    /**
     * Retrieves all exceptions caught by the AUT's global error handling and
     * logs them.
     *
     * @param win {String?} JavaScript snippet that evaluates as a Window object
     * accessible from the current Selenium instance. Default: The AUT's window.
     */
    logGlobalErrors : function(win){

      var globalErrors = this.getGlobalErrors(win);
      for(var i = 0,l = globalErrors.length;i < l;i++){

        if(globalErrors[i].length > 0){

          this.error(globalErrors[i]);
        };
      };
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */
/* ************************************************************************
************************************************************************ */
/**
 * Provides functionality to capture the log messages of a tested qooxdoo
 * application.
 */
qx.Mixin.define("simulator.MApplicationLogging", {
  members : {
    /**
     * Adds a function to the AUT that retrieves all messages from the logger
     * created by {@link #addAutLogStore}.
     * @ignore(selenium.qxStoredVars)
     */
    _addAutLogGetter : function(){

      var getRingBufferEntries = function(autWin){

        var targetWin = autWin || selenium.qxStoredVars['autWindow'];
        var entries = selenium.qxStoredVars['ringBuffer'].getAllLogEvents();
        var entryArray = [];
        for(var i = 0,l = entries.length;i < l;i++){

          try{

            var entry = targetWin.qx.log.appender.Util.toText(entries[i]);
            entryArray.push(entry);
          } catch(ex) {

            var entry = entries[i].level + ':';
            for(var j = 0,m = entries[i].items.length;j < m;j++){

              entry += entries[i].items[j].text + ' ';
            };
            entryArray.push(entry);
          };
        };
        return entryArray.join('|');
      };
      this._addOwnFunction("getRingBufferEntries", getRingBufferEntries);
    },
    /**
     * Creates a new qx.log.appender.RingBuffer in the AUT and registers it.
     * This can be used to access the AUT's log messages from the test code.
     *
     * @param win {String} JavaScript snippet that evaluates as a Window object
     * accessible to the current Selenium instance. Default: The AUT's window.
     */
    _addAutLogStore : function(win){

      var qxWin = win || "selenium.qxStoredVars['autWindow']";
      var rb = "(function() { var rb = " + qxWin + ".qx.log.appender.RingBuffer; return new rb(); })()";
      //var rb = "new " + qxWin + ".qx.log.appender.RingBuffer()";
      this._storeEval(rb, "ringBuffer");
      simulator.QxSelenium.getInstance().getEval(qxWin + ".qx.log.Logger.register(selenium.qxStoredVars['ringBuffer'])");
    },
    /**
     * Returns the contents of the RingBuffer storing the AUT's log messages.
     *
     * @param win {String?} JavaScript snippet that evaluates as a Window object
     *
     * @return {String[]} Array of AUT log messages
     */
    getAutLogEntries : function(win){

      var qxWin = win || "selenium.qxStoredVars['autWindow']";
      var debugLog = simulator.QxSelenium.getInstance().getEval("selenium.qxStoredVars['autWindow']" + ".qx.Simulation.getRingBufferEntries(" + qxWin + ")");
      debugLog = String(debugLog);
      if(!debugLog.length > 0){

        return [];
      };
      return debugLog.split("|");
    },
    /**
     * Removes all entries from the AUT-side logger.
     */
    clearAutLogStore : function(){

      simulator.QxSelenium.getInstance().getEval("selenium.qxStoredVars['ringBuffer'].clear();");
    },
    /**
     * Retrieves all messages from the AUT-side logger created by
     * {@link simulator.MApplicationLogging#addRingBuffer} and writes them to
     * the simulation log.
     */
    logAutLogEntries : function(){

      var debugLogArray = this.getAutLogEntries();
      for(var i = 0,l = debugLogArray.length;i < l;i++){

        this.info(debugLogArray[i]);
      };
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */
/* ************************************************************************
************************************************************************ */
/**
 * Provides event testing support.
 */
qx.Mixin.define("simulator.MEventSupport", {
  members : {
    /**
     * Adds utility functions to the AUT that allow attaching and removing event
     * listeners to qooxdoo objects identified by their object registry hash.
     *
     * @ignore(selenium.qxStoredVars)
     */
    _addListenerSupport : function(){

      simulator.QxSelenium.getInstance().getEval('selenium.qxStoredVars["autWindow"].qx.Simulation.eventStore = [];');
      var addListener = function(objectHash, event, callback, context){

        var context = context || selenium.qxStoredVars['autWindow'].qx.core.Init.getApplication();
        var qxObj = selenium.qxStoredVars['autWindow'].qx.core.ObjectRegistry.fromHashCode(objectHash);
        return qxObj.addListener(event, callback, context);
      };
      this._addOwnFunction("addListener", addListener);
      var removeListenerById = function(objectHash, listenerId){

        var qxObj = selenium.qxStoredVars['autWindow'].qx.core.ObjectRegistry.fromHashCode(objectHash);
        return qxObj.removeListenerById(listenerId);
      };
      this._addOwnFunction("removeListenerById", removeListenerById);
    },
    /**
     * Adds an event listener to a qooxdoo object in the AUT.
     *
     * @param locator {String} A (Qx)Selenium locator string that finds a
     * qooxdoo widget
     * @param event {String} Name of the event to listen for
     * @param callback {Function} Function to be executed if the event is
     * fired. The local variable "ev" will reference the event object
     * @param script {String?} JavaScript snippet to be executed in the context
     * of the widget determined by the locator. The listener will be attached
     * to the object returned by this snippet
     * @return {String} the generated listener's ID
     */
    addListener : function(locator, event, callback, script){

      if(script){

        var objectHash = simulator.QxSelenium.getInstance().getQxObjectHash(locator, script);
      } else {

        var objectHash = simulator.QxSelenium.getInstance().getQxObjectHash(locator);
      };
      var callbackName = event + "_" + new Date().getTime();
      this.addFunctionToAut(callbackName, callback, ["ev"]);
      var callbackInContext = 'selenium.qxStoredVars["autWindow"].qx.Simulation["' + callbackName + '"]';
      var cmd = 'selenium.qxStoredVars["autWindow"].qx.Simulation.addListener("' + objectHash + '", "' + event + '", ' + callbackInContext + ')';
      return simulator.QxSelenium.getInstance().getEval(cmd);
    },
    /**
     * Removes an event listener from a qooxdoo widget in the AUT.
     *
     * @param locator {String} A (Qx)Selenium locator string that finds a
     * qooxdoo widget
     * @param listenerId {String}  The listener's ID as returned by
     * {@see #addListener}
     * @return {Boolean} Whether the listener was
     * removed successfully
     */
    removeListenerById : function(locator, listenerId){

      listenerId = String(listenerId).replace(/"/, '\\"');
      var objectHash = simulator.QxSelenium.getInstance().getQxObjectHash(locator);
      var cmd = 'selenium.qxStoredVars["autWindow"].qx.Simulation.removeListenerById("' + objectHash + '", "' + listenerId + '")';
      var result = simulator.QxSelenium.getInstance().getEval(cmd);
      return String(result) == "true";
    },
    /**
     * Attaches a listener to a qooxdoo object that clones the incoming event
     * object and adds it to the event store.
     *
     * @param locator {String} A (Qx)Selenium locator string that finds a
     * qooxdoo widget
     * @param event {String} The name of the event to listen for
     * @param script {String?} Javascript snippet to be executed in the widget's
     * context.
     * @return {String} The listener's ID as returned by addListener
     *
     * @ignore(qx.Simulation.eventStore.push)
     */
    storeEvent : function(locator, event, script){

      var callback = function(ev){

        qx.Simulation.eventStore.push(ev.clone());
      };
      return this.addListener(locator, event, callback, script);
    },
    /**
     * Executes a JavaScript snippet on a stored event and returns the result.
     *
     * @param index {Integer} Index of the event in the store
     * @param detailString {String} Code snippet to execute, e.g.
     * "getTarget().classname"
     * @return {String} The result of the executed code
     */
    getStoredEventDetail : function(index, detailString){

      var cmd = 'selenium.qxStoredVars["autWindow"].qx.Simulation.eventStore[' + index + ']';
      if(detailString[0] != "[" && detailString[0] != "."){

        cmd += ".";
      };
      cmd += detailString;
      return String(simulator.QxSelenium.getInstance().getEval(cmd));
    },
    /**
     * Empties the event store.
     */
    clearEventStore : function(){

      simulator.QxSelenium.getInstance().getEval('selenium.qxStoredVars["autWindow"].qx.Simulation.eventStore = []');
    },
    /**
     * Returns the number of entries in the event store.
     *
     * @return {Integer} The event count
     */
    getStoredEventCount : function(){

      var storedEvents = simulator.QxSelenium.getInstance().getEval('selenium.qxStoredVars["autWindow"].qx.Simulation.eventStore.length');
      return parseInt(storedEvents, 10);
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006-2011 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */
/**
 * Log appender for qooxdoo applications running in Mozilla Rhino. Writes log
 * messages to a text file.
 */
qx.Class.define("qx.log.appender.RhinoFile", {
  statics : {
    /**
     * Path/name of the log file to use, relative to the directory Rhino was
     * called from.
     */
    FILENAME : null,
    __dS : null,
    /**
     * Writes a message to the file.
     *
     * @param logMessage {String} Message to be logged
     * @param level {String} Log level. One of "debug", "info", "warn", "error"
     */
    log : function(logMessage, level){

      if(!qx.log.appender.RhinoFile.__dS){

        qx.log.appender.RhinoFile.create();
      };
      var logFile = qx.log.appender.RhinoFile.__dS;
      logFile.write(logMessage);
      logFile.newLine();
      logFile.flush();
    },
    /**
     * Logs a debug message
     *
     * @param logMessage {String} Message to be logged
     */
    debug : function(logMessage){

      this.log(logMessage, "debug");
    },
    /**
     * Logs an info message
     *
     * @param logMessage {String} Message to be logged
     */
    info : function(logMessage){

      this.log(logMessage, "info");
    },
    /**
     * Logs a warning message
     *
     * @param logMessage {String} Message to be logged
     */
    warn : function(logMessage){

      this.log(logMessage, "warn");
    },
    /**
     * Logs an error message
     *
     * @param logMessage {String} Message to be logged
     */
    error : function(logMessage){

      this.log(logMessage, "error");
    },
    /**
     * Process a log entry object from qooxdoo's logging system.
     *
     * @param entry {Map} Log entry object
     */
    process : function(entry){

      var level = entry.level || "info";
      for(var prop in entry){

        if(prop == "items"){

          var items = entry[prop];
          for(var p = 0,l = items.length;p < l;p++){

            var item = items[p];
            this[level](item.text);
          };
        };
      };
    },
    /**
     * Creates a new log file using the value of {@link #FILENAME} as the
     * file path/name.
     */
    create : function(){

      if(qx.log.appender.RhinoFile.__dS){

        qx.log.appender.RhinoFile.__dS.close();
      };
      if(!qx.log.appender.RhinoFile.FILENAME){

        qx.log.appender.RhinoFile.FILENAME = "qooxdoo.log";
      };
      var fstream = new java.io.FileWriter(qx.log.appender.RhinoFile.FILENAME, true);
      qx.log.appender.RhinoFile.__dS = new java.io.BufferedWriter(fstream);
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */
/**
 * Common base class for TestRunner views.
 */
qx.Class.define("testrunner.view.Abstract", {
  type : "abstract",
  extend : qx.core.Object,
  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */
  events : {
    /** Event fired to instruct the TestRunner to start running the test suite */
    runTests : "qx.event.type.Event",
    /** Event fired to instruct the TestRunner to stop running the test suite */
    stopTests : "qx.event.type.Event"
  },
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties : {
    /** Status message to be displayed in the view */
    status : {
      init : "",
      check : "String",
      apply : "_applyStatus"
    },
    /** The test suite's current state, synchronized with
      {@link testrunner.runner.TestRunner#testSuiteState} */
    testSuiteState : {
      init : "init",
      apply : "_applyTestSuiteState",
      event : "changeTestSuiteState"
    },
    /** Number of configured tests that haven't run yet. */
    testCount : {
      init : null,
      nullable : true,
      apply : "_applyTestCount",
      event : "changeTestCount"
    },
    /** Model object representing the test namespace. */
    testModel : {
      init : null,
      nullable : true,
      apply : "_applyTestModel"
    },
    /** List of tests selected by the user */
    selectedTests : {
      init : null,
      nullable : true,
      event : "changeSelectedTests"
    },
    /** URI of the application containing the test classes */
    autUri : {
      check : "String",
      nullable : true,
      event : "changeAutUri",
      apply : "_applyAutUri"
    }
  },
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members : {
    /**
     * Add a listener to a TestResultData object to be informed of state changes.
     * @param testResultData {testrunner.unit.TestResultData}
     * Test result data object
     */
    addTestResult : function(testResultData){

      testResultData.addListener("changeState", function(ev){

        this._onTestChangeState(testResultData);
      }, this);
    },
    /**
     * Visualize TestResultData state changes.
     * @param testResultData {testrunner.unit.TestResultData}
     * Test result data object
     */
    _onTestChangeState : function(testResultData){

      this.error("Missing implementation of _onTestChangeState!");
    },
    /**
     * Displays a status message.
     *
     * @param value {String} The message to be displayed
     * @param old {String} Previous value
     */
    _applyStatus : function(value, old){

      this.info(value);
    },
    /**
     * Visualizes the current state of the test suite.
     *
     * @param value {String} The test suite's state, one of "init", "loading",
     * "ready", "running", "finished", "aborted", "error"
     * @param old {String} Previous value
     */
    _applyTestSuiteState : function(value, old){

      this.info("Test suite state: " + value);
    },
    /**
     * Visualizes the amount of tests remaining.
     *
     * @param value {Integer} Number of pending tests
     * @param old {Integer} Previous value
     */
    _applyTestCount : function(value, old){

      this.info(value + " tests pending.");
    },
    /**
     * Apply the test model: Build a list of tests in the GUI etc.
     *
     * @param value {Object} Test model object
     * @param old {Object} Previous value
     */
    _applyTestModel : function(value, old){

      this.error("Missing implementation of _applyTestModel!");
    },
    /**
     * Applies the AUT's URI, e.g. by setting an Iframe's source
     *
     * @param value {String} AUT URI
     * @param old {String} Previous value
     */
    _applyAutUri : function(value, old){
    }
  },
  destruct : function(){

    this.removeAllBindings();
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */
/**
 * Testrunner view intended for browserless environments, e.g. node.js, Rhino
 */
qx.Class.define("testrunner.view.Basic", {
  extend : testrunner.view.Abstract,
  members : {
    __dT : null,
    /**
     * Tells the TestRunner to run all configured tests.
     */
    run : function(){

      this.__dT = {
      };
      this.fireEvent("runTests");
    },
    /**
     * Tells the TestRunner to stop running any pending tests.
     */
    stop : function(){

      this.fireEvent("stopTests");
    },
    /**
     * Returns the test result counts by type. Failed tests and tests with
     * unexpected errors are both listed as "failed".
     *
     * @return {String} Results summary
     */
    getSummary : function(){

      var count = {
        pass : 0,
        fail : 0,
        skip : 0
      };
      for(var test in this.__dT){

        var state = this.__dT[test].state;
        switch(state){case "success":
        count.pass += 1;
        break;case "skip":
        count.skip += 1;
        break;default:
        count.fail += 1;};
      };
      return count.pass + " passed, " + count.fail + " failed, " + count.skip + " skipped.";
    },
    /**
     * Writes a status message to the browser's logging console.
     *
     * @param value {String} New status value
     * @param old {String} Previous status value
     */
    _applyStatus : function(value, old){

      if(!value[0] || (value === old)){

        return;
      };
      this.info(value);
    },
    /**
     * Log the test suite's current status.
     *
     * @param value {String} New testSuiteState
     * @param value {String} Previous testSuiteState
     */
    _applyTestSuiteState : function(value, old){

      switch(value){case "init":
      this.setStatus("Waiting for tests");
      break;case "loading":
      this.setStatus("Loading tests...");
      break;case "ready":
      this.setStatus(this.getSelectedTests().length + " tests ready");
      break;case "error":
      this.setStatus("Error loading test suite or no tests in suite!");
      break;case "running":
      this.setStatus("Running tests...");
      break;case "finished":
      this.setStatus("Test suite finished.");
      this.info(this.getSummary());
      break;case "aborted":
      this.setStatus("Test run aborted");
      break;};
    },
    _applyTestModel : function(value, old){

      if(!value){

        return;
      };
      var testList = testrunner.runner.ModelUtil.getItemsByProperty(value, "type", "test");
      this.setSelectedTests(new qx.data.Array(testList));
    },
    _applyTestCount : function(value, old){
    },
    /**
     * Logs state changes in testResultData objects.
     *
     * @param testResultData {testrunner.unit.TestResultData} Test result data
     * object
     */
    _onTestChangeState : function(testResultData){

      var testName = testResultData.getFullName();
      var state = testResultData.getState();
      var exceptions = testResultData.getExceptions();
      //Update test results map
      if(!this.__dT[testName]){

        this.__dT[testName] = {
        };
      };
      this.__dT[testName].state = state;
      if(exceptions){

        this.__dT[testName].exceptions = exceptions;
        var messages = [];
        for(var i = 0,l = exceptions.length;i < l;i++){

          var message = exceptions[i].exception.toString() + "\n";
          //message += testResultData.getStackTrace(exceptions[i].exception);
          messages.push(message);
        };
        this.__dT[testName].messages = messages;
      };
      var level;
      var msg;
      switch(state){case "start":
      level = "debug";
      msg = "RESUME";
      break;case "skip":
      level = "warn";
      msg = "SKIP  ";
      break;case "error":
      level = "error";
      msg = "ERROR ";
      break;case "failure":
      level = "error";
      msg = "FAIL  ";
      break;case "success":
      level = "info";
      msg = "PASS  ";
      break;case "wait":
      level = "debug";
      msg = "WAIT  ";
      break;default:
      level = "error";
      msg = "UNKNOWN STATE " + state;};
      this[level](msg + " " + testName);
      if(this.__dT[testName].messages){

        this.error(this.__dT[testName].messages.join("\n"));
      };
    },
    /**
     * Returns the results of all tests that have been executed.
     *
     * @param exceptions {Boolean} Include an array of Error objects for any
     * test with exceptions
     *
     * @return {Map} Key: The test's full name. Value: Map containing two keys:
     * state (The test's result) and (if applicable) exceptions (array of errors
     * that occured during the test's run).
     */
    getTestResults : function(exceptions){

      if(exceptions){

        return this.__dT;
      };
      var readableResults = {
      };
      var res = this.__dT;
      for(var key in res){

        if(res.hasOwnProperty(key)){

          readableResults[key] = {
            state : res[key].state
          };
          if(res[key].messages){

            readableResults[key].messages = res[key].messages;
          };
        };
      };
      return readableResults;
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */
/**
 * Base class for integration tests.
 */
qx.Class.define("simulator.unit.TestCase", {
  extend : qx.dev.unit.TestCase,
  include : [qx.core.MAssert],
  members : {
    /** {@link simulator.QxSelenium} instance */
    __dU : null,
    /** {@link simulator.Simulation} instance */
    __dV : null,
    /**
     * Returns a Simulation instance.
     *
     * @return {simulator.Simulation} Simulation object
     */
    getSimulation : function(){

      if(!this.__dV){

        this.__dV = simulator.Simulation.getInstance();
      };
      return this.__dV;
    },
    /**
     * Returns a QxSelenium instance.
     *
     * @return {simulator.selenium.QxSelenium} QxSelenium object
     */
    getQxSelenium : function(){

      if(!this.__dU){

        this.__dU = simulator.QxSelenium.getInstance();
      };
      return this.__dU;
    }
  }
});

/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */
/**
 * This class demonstrates how to define simulated interaction tests for your 
 * application. See the manual for details:
 * {@link http://manual.qooxdoo.org/3.5/pages/development/simulator.html}
 */
qx.Class.define("skel.simulation.DemoSimulation", {
  extend : simulator.unit.TestCase,
  members : {
    /*
    ---------------------------------------------------------------------------
      TESTS
    ---------------------------------------------------------------------------
    */
    /** Check if a widget is present (part of the DOM) */
    testButtonPresent : function(){

      this.assertNotNull(this.getSimulation().getWidgetOrNull("qxh=qx.ui.form.Button"), "Button widget not present!");
    },
    /** Click a button and check if an alert box pops up */
    testButtonClick : function(){

      this.getQxSelenium().qxClick("qxh=qx.ui.form.Button");
      this.assertEquals("true", String(this.getQxSelenium().isAlertPresent()));
    }
  }
});


if (typeof exports != "undefined") {
    for (var key in qx) {
        exports[key] = qx[key];
    }
}

qx.$$loader.init();

