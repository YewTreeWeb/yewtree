/**
 * Define variables for gulpfile.
 *
 */

var paths = {};

// Directory locations.
paths.assetsDir        = './_assets/';                            // The files Gulp will handle.
paths.siteDir          = './_site/';                              // The resulting static site.
paths.jekyllAssetsDir  = './assets/';                             // The asset files Jekyll will handle.
paths.siteAssetsDir    = paths.siteDir + 'assets/'; // The resulting static site's assets.

// Folder naming conventions.
paths.layoutFoldeName  = '_layouts';
paths.postFolderName   = '_posts';
paths.pageFolderName   = '_pages';
paths.draftFolderName  = '_drafts';
paths.includeFoldeName = '_includes';
paths.dataFolderName   = '_data';
paths.fontFolderName   = 'fonts';
paths.imageFolderName  = 'images';
paths.scriptFolderName = 'js';
paths.stylesFolderName = 'sass';
paths.cssFolderName    = 'css';
paths.vendorFolderName = 'vendor';


// Asset files locations.
paths.sassFiles       = paths.assetsDir + paths.stylesFolderName;
paths.cssFiles        = paths.assetsDir + paths.cssFolderName;
paths.jsFiles         = paths.assetsDir + paths.scriptFolderName;
paths.sassVendorFiles = paths.assetsDir + paths.stylesFolderName + '/' + paths.vendorFolderName;
paths.vendorFiles     = paths.assetsDir + paths.scriptFolderName + '/' + paths.vendorFolderName;
paths.imageFiles      = paths.assetsDir + paths.imageFolderName;
paths.fontFiles       = paths.assetsDir + paths.fontFolderName;
paths.dataFiles       = paths.assetsDir + paths.dataFolderName;
paths.mdFiles         = paths.assetsDir + paths.postFolderName;

// Jekyll asset files locations.
paths.jekyllVendorFiles = paths.jekyllAssetsDir + paths.scriptFolderName + '/' + paths.vendorFolderName;
paths.jekyllVendorSCSSFiles = paths.jekyllAssetsDir + paths.stylesFolderName + '/' + paths.vendorFolderName;
paths.jekyllJsFiles  = paths.jekyllAssetsDir + paths.scriptFolderName;
paths.jekyllCssFiles = paths.jekyllAssetsDir + paths.cssFolderName;
paths.jekyllFontFiles = paths.jekyllAssetsDir + paths.fontFolderName;

// Glob patterns by file type.
paths.allPattern      = '/**/*';
paths.scssPattern     = '/**/*.scss';
paths.sassPattern     = '/**/*.sass';
paths.cssPattern      = '/**/*.css';
paths.jsPattern       = '/**/*.js';
paths.imagePattern    = '/**/*.+(jpg|JPG|jpeg|JPEG|png|PNG|svg|SVG|gif|GIF|tif|TIF)';
paths.markdownPattern = '/**/*.+(md|MD|markdown|MARKDOWN)';
paths.htmlPattern     = '/**/*.html';
paths.xmlPattern      = '/**/*.xml';
paths.jsonPattern     = '/**/*.json';
paths.ymlPattern      = '/**/*.+(yml|yaml)';

// Asset files globs
paths.scssFilesGlob  = paths.sassFiles  + paths.scssPattern;
paths.sassFilesGlob  = paths.sassFiles  + paths.sassPattern;
paths.cssFilesGlob   = paths.cssFiles  + paths.cssPattern;
paths.jsFilesGlob    = paths.jsFiles    + paths.jsPattern;
paths.imageFilesGlob = paths.imageFiles + paths.imagePattern;
paths.ymlFilesGlob   = paths.dataFiles  + paths.ymlPattern;
paths.jsonFilesGlob  = paths.dataFiles  + paths.jsonPattern;
paths.xmlFilesGlob   = paths.dataFiles  + paths.xmlPattern;
paths.mdFilesGlob    = paths.mdFiles    + paths.markdownPattern;

// Site files globs
paths.siteHtmlFilesGlob = paths.siteDir + paths.htmlPattern;

// HTML pages to run through the accessibility test.
paths.htmlTestFiles = [
  '_site/**/*.html',
];

module.exports = paths;