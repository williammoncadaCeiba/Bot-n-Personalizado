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
    const buttonColor = this.properties.buttonColor || '#5013c2ff';
    // MODIFICACIÓN: Se añade un ID único al elemento 'a' para poder seleccionarlo fácilmente después.
    const buttonId = `custom-button-${this.instanceId}`;

    this.domElement.innerHTML = `
      <div class="${styles.buttonContainer}">
        ${
          this.properties.buttonText && this.properties.buttonLink
            ? `<a
                href="${safeButtonLink}"
                id="${buttonId}"
                target="_blank"
                data-interception="off"
                class="${styles.customButton}"
                style="background-color: ${buttonColor};"
                title="Haz clic para copiar el enlace del documento"
              >
                ${safeButtonText}
              </a>`
            : `<div class="${styles.placeholder}">Por favor, configure el botón en el panel de propiedades.</div>`
        }
      </div>`;

      // Contenedor de toast
      if (!document.querySelector('#custom-toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'custom-toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
      }

    // MODIFICACIÓN: Se llama a una nueva función para añadir el detector de eventos de clic al botón.
    this._setButtonEventListener(buttonId);
  }

  private _showToast(message: string): void {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.background = '#4caf50';
    toast.style.color = '#fff';
    toast.style.padding = '10px 16px';
    toast.style.borderRadius = '6px';
    toast.style.marginTop = '8px';
    toast.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
    toast.style.opacity = '1';
    toast.style.transition = 'opacity 0.5s ease';
    
    const container = document.querySelector('#custom-toast-container');
    container?.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 500);
    }, 2000);
  }


  // MODIFICACIÓN: Se crea una nueva función privada para manejar la lógica del clic.
  private _setButtonEventListener(buttonId: string): void {
    // MODIFICACIÓN: Se busca el botón en el DOM usando el ID que le asignamos.
    const button = this.domElement.querySelector(`#${buttonId}`);
    
    // MODIFICACIÓN: Se comprueba si el botón existe para evitar errores.
    if (button) {
      // MODIFICACIÓN: Se añade un "escuchador" para el evento 'click'.
      button.addEventListener('click', (event) => {
        // MODIFICACIÓN: Se previene el comportamiento por defecto del enlace (que es solo navegar).
        event.preventDefault();
        
        // MODIFICACIÓN: Se accede a la API del portapapeles del navegador.
        navigator.clipboard.writeText(this.properties.buttonLink).then(() => {
          // MODIFICACIÓN: Esto se ejecuta si el texto se copió correctamente.
          console.log('Enlace copiado al portapapeles:', this.properties.buttonLink);

          // Mostrar alerta informativa (ALERTA NATIVA)
          //alert('✅ El enlace ha sido copiado al portapapeles');

          // Mostrar alerta informativa (ALERTA PERSONALIZADA)
          this._showToast('✅ El enlace ha sido copiado al portapapeles');
          
          // MODIFICACIÓN: Una vez copiado, se abre el enlace en una nueva pestaña, que era el comportamiento original.
          window.open(this.properties.buttonLink, '_blank');
        }).catch(err => {
          // MODIFICACIÓN: Esto se ejecuta si hubo un error al copiar (por ejemplo, por permisos del navegador).
          console.error('Error al copiar al portapapeles: ', err);

          // MODIFICACIÓN: Aunque falle el copiado, igualmente se intenta abrir el enlace para no perder la funcionalidad principal.
          window.open(this.properties.buttonLink, '_blank');
        });
      });
    }
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

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