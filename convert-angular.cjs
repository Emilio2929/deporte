const fs = require('fs');

const html = fs.readFileSync('old_index.html', 'utf8');

// Extract body content
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (!bodyMatch) {
  console.error('No body found');
  process.exit(1);
}

let body = bodyMatch[1];

// Strip out old scripts
body = body.replace(/<script>[\s\S]*?<\/script>/gi, '');

// Convert interactions to Angular bindings
let template = body;

// Cotizacion
template = template.replace(/class="([^"]*)btn-cotizar([^"]*)"/g, 'class="$1btn-cotizar$2" (click)="$event.preventDefault(); openModal(\'cotizacion\')"');
template = template.replace(/id="cotizacion-modal" class="([^"]*) modal-hidden"/g, 'id="cotizacion-modal" [class]="\'$1 \' + (activeModal === \'cotizacion\' ? \'modal-visible\' : \'modal-hidden\')"');
template = template.replace(/id="cotizacion-panel" class="([^"]*) panel-hidden"/g, 'id="cotizacion-panel" [class]="\'$1 \' + (activeModal === \'cotizacion\' ? \'panel-visible\' : \'panel-hidden\')"');
template = template.replace(/class="([^"]*)close-cotizacion-btn([^"]*)"/g, 'class="$1close-cotizacion-btn$2" (click)="closeModal()"');
template = template.replace(/class="([^"]*)close-cotizacion-backdrop([^"]*)"/g, 'class="$1close-cotizacion-backdrop$2" (click)="closeModal()"');
template = template.replace(/id="cotizacion-form" class="p-6 space-y-5"/g, 'id="cotizacion-form" class="p-6 space-y-5" (submit)="handleCotizacionSubmit($event)"');

// Privacidad
template = template.replace(/class="([^"]*)btn-privacidad([^"]*)"/g, 'class="$1btn-privacidad$2" (click)="$event.preventDefault(); openModal(\'privacidad\')"');
template = template.replace(/id="privacidad-modal" class="([^"]*) modal-hidden"/g, 'id="privacidad-modal" [class]="\'$1 \' + (activeModal === \'privacidad\' ? \'modal-visible\' : \'modal-hidden\')"');
template = template.replace(/id="privacidad-panel" class="([^"]*) panel-hidden"/g, 'id="privacidad-panel" [class]="\'$1 \' + (activeModal === \'privacidad\' ? \'panel-visible\' : \'panel-hidden\')"');
template = template.replace(/class="([^"]*)close-privacidad-btn([^"]*)"/g, 'class="$1close-privacidad-btn$2" (click)="closeModal()"');
template = template.replace(/class="([^"]*)close-privacidad-backdrop([^"]*)"/g, 'class="$1close-privacidad-backdrop$2" (click)="closeModal()"');

// Terminos
template = template.replace(/class="([^"]*)btn-terminos([^"]*)"/g, 'class="$1btn-terminos$2" (click)="$event.preventDefault(); openModal(\'terminos\')"');
template = template.replace(/id="terminos-modal" class="([^"]*) modal-hidden"/g, 'id="terminos-modal" [class]="\'$1 \' + (activeModal === \'terminos\' ? \'modal-visible\' : \'modal-hidden\')"');
template = template.replace(/id="terminos-panel" class="([^"]*) panel-hidden"/g, 'id="terminos-panel" [class]="\'$1 \' + (activeModal === \'terminos\' ? \'panel-visible\' : \'panel-hidden\')"');
template = template.replace(/class="([^"]*)close-terminos-btn([^"]*)"/g, 'class="$1close-terminos-btn$2" (click)="closeModal()"');
template = template.replace(/class="([^"]*)close-terminos-backdrop([^"]*)"/g, 'class="$1close-terminos-backdrop$2" (click)="closeModal()"');

// Proceso
template = template.replace(/<button type="button" class="([^"]*)btn-proceso([^"]*)"\s*data-title="([^"]*)"\s*data-icon="([^"]*)"\s*data-desc="([^"]*)">/g, 
  '<button type="button" class="$1btn-proceso$2" (click)="openProcessModal(\'$3\', \'$4\', \'$5\')">');

template = template.replace(/id="detalle-proceso-modal" class="([^"]*) modal-hidden"/g, 'id="detalle-proceso-modal" [class]="\'$1 \' + (activeModal === \'proceso\' ? \'modal-visible\' : \'modal-hidden\')"');
template = template.replace(/id="detalle-proceso-panel" class="([^"]*) panel-hidden"/g, 'id="detalle-proceso-panel" [class]="\'$1 \' + (activeModal === \'proceso\' ? \'panel-visible\' : \'panel-hidden\')"');
template = template.replace(/class="([^"]*)close-proceso-btn([^"]*)"/g, 'class="$1close-proceso-btn$2" (click)="closeModal()"');
template = template.replace(/class="([^"]*)close-proceso-backdrop([^"]*)"/g, 'class="$1close-proceso-backdrop$2" (click)="closeModal()"');

template = template.replace(/<span id="proceso-icono" class="material-symbols-outlined text-\[32px\] text-primary">info<\/span>/g, '<span id="proceso-icono" class="material-symbols-outlined text-[32px] text-primary">{{ processDetail?.icon || "info" }}</span>');
template = template.replace(/<h3 id="proceso-titulo" class="font-headline-md text-2xl font-bold text-on-background mb-4">Etapa<\/h3>/g, '<h3 id="proceso-titulo" class="font-headline-md text-2xl font-bold text-on-background mb-4">{{ processDetail?.title || "Etapa" }}</h3>');
template = template.replace(/<p id="proceso-descripcion" class="font-body-md text-on-surface-variant leading-relaxed">\s*Descripción de la etapa...\s*<\/p>/g, '<p id="proceso-descripcion" class="font-body-md text-on-surface-variant leading-relaxed">{{ processDetail?.desc || "Descripción de la etapa..." }}</p>');

fs.writeFileSync('src/app/app.component.html', template);
console.log('app.component.html generated successfully.');

const tsCode = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  activeModal: string | null = null;
  processDetail: { title: string, icon: string, desc: string } | null = null;

  openModal(modalName: string) {
    this.activeModal = modalName;
  }

  closeModal() {
    this.activeModal = null;
  }

  openProcessModal(title: string, icon: string, desc: string) {
    this.processDetail = { title, icon, desc };
    this.activeModal = 'proceso';
  }

  handleCotizacionSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    
    // Safely access elements with specific IDs
    const empresaInput = document.getElementById('empresa') as HTMLInputElement;
    const servicioInput = document.getElementById('servicio') as HTMLSelectElement;
    const descripcionInput = document.getElementById('descripcion') as HTMLTextAreaElement;
    
    if (empresaInput && servicioInput && descripcionInput) {
        const empresa = empresaInput.value;
        const servicio = servicioInput.value;
        const descripcion = descripcionInput.value;
        
        const textoMensaje = \`*¡Hola Marivic Soft!* 👋🏼\\nDeseo solicitar una cotización para un nuevo proyecto.\\n\\n*🏢 Empresa/Proyecto:* \${empresa}\\n*💻 Servicio de interés:* \${servicio}\\n*📝 Descripción:* \${descripcion}\\n\\nQuedo a la espera de su respuesta.\`;
        const numeroWhatsApp = "51930144555"; 
        window.open(\`https://wa.me/\${numeroWhatsApp}?text=\${encodeURIComponent(textoMensaje)}\`, '_blank');
        
        this.closeModal();
        form.reset();
    }
  }
}
`;

fs.writeFileSync('src/app/app.component.ts', tsCode);
console.log('app.component.ts generated successfully.');
