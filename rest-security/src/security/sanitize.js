const mongoSanitize = require('express-mongo-sanitize');
const sanitizeHtml = require('sanitize-html');

function mongoInjectionProtection() {
  return mongoSanitize({
    replaceWith: '_',
    allowDots: false,
  });
}

function sanitizeUserHtml(input, { allowedTags, allowedAttributes }) {
  return sanitizeHtml(input || '', {
    allowedTags: allowedTags || [],
    allowedAttributes: allowedAttributes || {},
    disallowedTagsMode: 'discard',
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
  });
}

const htmlPolicies = {
  none: { allowedTags: [], allowedAttributes: {} },
  review: {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
    allowedAttributes: { a: ['href', 'rel', 'target'] },
  },
  postLimited: {
    allowedTags: ['b', 'i', 'em', 'strong', 'a'],
    allowedAttributes: { a: ['href', 'rel', 'target'] },
  },
  richText: {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'h1', 'h2', 'h3'],
    allowedAttributes: { a: ['href', 'rel', 'target'] },
  },
};

module.exports = { mongoInjectionProtection, sanitizeUserHtml, htmlPolicies };
