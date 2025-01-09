const AuthList = ['admin', 'user']

export const AuthComponents = (auth: string, component: any) => {
  return new Promise((resolve, reject) => {
    const components = AuthList.includes(auth) ? component : null
    if (!!components) resolve(components)
    reject()
  })
}
