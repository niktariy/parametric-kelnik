import postcssMediaMinmax from 'postcss-media-minmax'
import postcssPresetEnv from 'postcss-preset-env'

/** @type {import('postcss').ProcessOptions} */
export default {
  plugins: [
    postcssMediaMinmax(), // сначала minmax, чтобы preset-env уже получил преобразованный код
    postcssPresetEnv({
      stage: 3, // включает многие современные фичи CSS
      autoprefixer: { grid: true },
      features: {
        'media-query-ranges': true, // включает преобразование диапазонов
      },
    }),
  ],
}
