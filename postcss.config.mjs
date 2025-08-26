import postcssMediaMinmax from 'postcss-media-minmax'
import postcssPresetEnv from 'postcss-preset-env'

/** @type {import('postcss').ProcessOptions} */
export default {
  plugins: [
    postcssMediaMinmax(),
    postcssPresetEnv({
      stage: 3,
      autoprefixer: { grid: true },
      features: {
        'media-query-ranges': true,
      },
    }),
  ],
}
