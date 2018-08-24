'use strict';

var parseBuildBlock = require('./parseBuildBlock'),
  bb = {};

module.exports = {
  setBuildBlock: function (block, options) {
    var props = parseBuildBlock(block),
      transformTargetPath = options.transformTargetPath;

    bb.handler = options && options[props.type];
    bb.host = options.host || '';
    bb.target = props.target || 'replace';
    bb.type = props.type;
    bb.attbs = props.attbs;
    bb.alternateSearchPaths = props.alternateSearchPaths;

    // transform target file path
    if (typeof transformTargetPath === 'function') {
      bb.target = transformTargetPath(bb.target, bb.type);
    }
  },

  transformCSSRefs: function (block, host, target, attbs) {
    var ref = '';
    var rel = 'rel="stylesheet" ';

    // css link element regular expression
    // TODO: Determine if 'href' attribute is present.
    var regcss = /<?link.*?(?:>|\))/gim;

    // rel attribute regular expression
    var regrel = /(^|\s)rel=/i;

    // if rel exists in attributes, set the default one empty
    if (regrel.test(attbs)) {
      rel = '';
    }

    // Check to see if there are any css references at all.
    if (block.search(regcss) !== -1) {
      if (attbs) {
        ref = '<link ' + rel + 'href="' + host + target + '" ' + attbs + '>';
      } else {
        ref = '<link ' + rel + 'href="' + host + target + '">';
      }
    }

    return ref;
  },

  transformJSRefs: function (block, host, target, attbs) {
    var ref = '';

    // script element regular expression
    // TODO: Detect 'src' attribute.
    var regscript = /<?script\(?\b[^<]*(?:(?!<\/script>|\))<[^<]*)*(?:<\/script>|\))/gim;

    // Check to see if there are any js references at all.
    if (block.search(regscript) !== -1) {
      if (attbs) {
        ref = '<script src="' + host + target + '" ' + attbs + '></script>';
      } else {
        ref = '<script src="' + host + target + '"></script>';
      }
    }

    return ref;
  },

  getRef: function (block, blockContent, options) {
    var ref = '';

    this.setBuildBlock(block, options);

    if (bb.type === 'css') {
      ref = this.transformCSSRefs(blockContent, bb.host, bb.target, bb.attbs);
    } else if (bb.type === 'js') {
      ref = this.transformJSRefs(blockContent, bb.host, bb.target, bb.attbs);
    } else if (bb.type === 'remove') {
      ref = '';
    } else if (bb.handler) {
      ref = bb.handler(
        blockContent,
        bb.target,
        bb.attbs,
        bb.alternateSearchPaths
      );
    } else {
      ref = null;
    }

    return ref;
  }
};
