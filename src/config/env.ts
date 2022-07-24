// config/env.js

import { resolve } from 'path'
import { realpathSync } from 'fs'
import { config } from 'dotenv'

// 先构造出.env*文件的绝对路径
const appDirectory = realpathSync(process.cwd())
const resolveApp = (relativePath: any) => resolve(appDirectory, relativePath)
const pathsDotenv = resolveApp('.env')

// 按优先级由高到低的顺序加载.env文件
config({ path: `${pathsDotenv}.local` }) // 加载.env.local
config({ path: `${pathsDotenv}.development` }) // 加载.env.development
config({ path: `${pathsDotenv}.development.local` }) // 加载.env.development.local
config({ path: `${pathsDotenv}` }) // 加载.env

// 打印一下此时的process.env
// console.log(process.env.NAME); // zhangsan
// console.log(process.env.AGE); // 20
// console.log(process.env.COUNTRY); // China
// console.log(process.env.LOCAL_ENV); // local
