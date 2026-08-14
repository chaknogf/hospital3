const PurgeCSS = require('@fullhuman/postcss-purgecss').default;

module.exports = {
  plugins: [
    require('autoprefixer'),
    PurgeCSS({
      content: ['./src/**/*.html', './src/**/*.ts'],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: [
        'form-floating', 'btn-group', 'btn', 'btn-group-vertical',
        // Selectores de temas (atributo data-theme en el elemento raíz)
        /^data-theme/,
        /^data-bs-theme/,
        /^:root/,
        /^html\[data-theme/,
        /^body\[data-bs-theme/,
        /^\.theme-/]
    })
  ]
};
