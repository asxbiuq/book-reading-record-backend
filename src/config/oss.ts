import OSS from 'ali-oss'


if (!process.env.ossAccessKeyId && !process.env.ossAccessKeySecret) {
  throw new Error(
    `process.env.ossAccessKeyId is ${process.env.ossAccessKeyId ?? null
    }, process.env.ossAccessKeySecret is ${process.env.ossAccessKeySecret ?? null
    }`
  )
}
export const client = new OSS({
  // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  region: process.env.ossRegion,
  // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
  accessKeyId: process.env.ossAccessKeyId!,
  accessKeySecret: process.env.ossAccessKeySecret!,
  // 填写Bucket名称。
  bucket: process.env.ossBucket,
})



