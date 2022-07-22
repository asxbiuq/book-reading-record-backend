//.eslintrc.js
module.exports = {
  env: {
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'prettier',
    //确保prettier是扩展数组中定义的最后一个配置，
    //因为配置的顺序决定了处理不同配置中的重复规则（后面的配置会覆盖以前的配置）
  ],
  rules: {
    // override/add rules settings here, such as:
    // 'vue/no-unused-vars': 'error'
  },
}
