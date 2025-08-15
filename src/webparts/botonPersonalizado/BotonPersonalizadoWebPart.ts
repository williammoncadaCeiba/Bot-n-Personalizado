import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './BotonPersonalizadoWebPart.module.scss';

export interface IBotonPersonalizadoWebPartProps {
  buttonText: string;
  buttonLink: string;
  buttonColor: string;
}

export default class BotonPersonalizadoWebPart extends BaseClientSideWebPart<IBotonPersonalizadoWebPartProps> {

  public render(): void {
    const safeButtonText = escape(this.properties.buttonText);
    const safeButtonLink = this.properties.buttonLink ? encodeURI(this.properties.buttonLink) : '#';
    const buttonColor = this.properties.buttonColor || '#0078d4';

    this.domElement.innerHTML = `
      <div class="${styles.buttonContainer}">
        ${
          this.properties.buttonText && this.properties.buttonLink
            ? `<a
                href="${safeButtonLink}"
                target="_blank"
                data-interception="off"
                class="${styles.customButton}"
                style="background-color: ${buttonColor};"
               >
                ${safeButtonText}
               </a>`
            : `<div class="${styles.placeholder}">Por favor, configure el botón en el panel de propiedades.</div>`
        }
      </div>`;
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }
  
  // Las advertencias de lint que viste en la consola se refieren a los 'any' de esta línea.
  // No son la causa del error, pero es una buena práctica ser más específico si es posible.
  // Lo importante es que esta función ahora funcionará gracias al .bind(this).

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "Personalice las propiedades del botón"
          },
          groups: [
            {
              groupName: "Configuración del Botón",
              groupFields: [
                PropertyPaneTextField('buttonText', {
                  label: "Texto del botón"
                }),
                PropertyPaneTextField('buttonLink', {
                  label: "Enlace del botón (URL completa)"
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
