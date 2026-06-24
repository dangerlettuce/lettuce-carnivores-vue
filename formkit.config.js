import { generateClasses } from '@formkit/themes';
import { createAutoHeightTextareaPlugin } from '@formkit/addons';

const config = {
  plugins: [createAutoHeightTextareaPlugin()],
  config: {
    classes: generateClasses({
      // global: {
      //   outer: '$reset',
      //   input: '',
      //   label: '',
      //   help: '',
      // },
      // checkbox: {
      //   outer: '',
      //   label: '',
      //   input: '$reset',
      // },
      // submit: {
      //   outer: '$reset mt-3',
      //   input: '$reset',
      // },
    }),
  },
};

export default config;
