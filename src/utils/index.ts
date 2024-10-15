//eslint-disable-next-line
export const createPropHtml = (title: string, prop: Record<string, any>) => {
  return `
        <div class="title"><b>${title}</b></div>
        <div class="content">
          ${Object.keys(prop)
            .map(key => `${`<p><b>${key}: </b>${prop[key]}</p>`}`)
            .join('')}
        </div>
      `
}
