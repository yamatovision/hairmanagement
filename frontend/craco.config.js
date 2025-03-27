const path = require('path');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          path: false, 
          fs: false
        }
      }
    }
  }
};