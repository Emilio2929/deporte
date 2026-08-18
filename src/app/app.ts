import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit {
  constructor(private cdr: ChangeDetectorRef) {}

  activeModal: string | null = null;
  processDetail: { title: string, icon: string, desc: string } | null = null;
  mobileMenuOpen: boolean = false;

  // Calculator State
  selectedProject: number = 900;
  projectName: string = 'Web Informativa';
  
  selectedDesign: number = 0;
  designName: string = 'Plantilla Premium';
  
  selectedExtras: { [key: string]: boolean } = {
    'pagos': false,
    'chat': false,
    'admin': false
  };

  get totalEstimado(): number {
    let total = this.selectedProject + this.selectedDesign;
    if (this.selectedExtras['pagos']) total += 450;
    if (this.selectedExtras['chat']) total += 150;
    if (this.selectedExtras['admin']) total += 500;
    return total;
  }

  setProject(value: number, name: string) {
    this.selectedProject = value;
    this.projectName = name;
  }

  setDesign(value: number, name: string) {
    this.selectedDesign = value;
    this.designName = name;
  }

  toggleExtra(key: string) {
    this.selectedExtras[key] = !this.selectedExtras[key];
  }

  solicitarSimulador() {
    let extrasText = '';
    if (this.selectedExtras['pagos']) extrasText += '- Pasarela de Pagos\n';
    if (this.selectedExtras['chat']) extrasText += '- Chat / WhatsApp Bot\n';
    if (this.selectedExtras['admin']) extrasText += '- Panel Administrativo\n';
    if (extrasText === '') extrasText = '- Ninguno\n';

    const textoMensaje = `*¡Hola Marivic Soft!* 👋🏼\nAcabo de usar el simulador de su página web y me interesa iniciar este proyecto:\n\n*💻 Tipo:* ${this.projectName}\n*🎨 Diseño:* ${this.designName}\n*⚙️ Extras:*\n${extrasText}\n*💰 Presupuesto Estimado:* S/ ${this.totalEstimado.toLocaleString('es-PE')} PEN\n\nMe gustaría agendar una reunión o recibir más detalles.`;
    
    const numeroWhatsApp = "51930144555"; 
    window.open("https://wa.me/" + numeroWhatsApp + "?text=" + encodeURIComponent(textoMensaje), '_blank');
  }

  // Chat State & Gemini AI
  isChatOpen: boolean = false;
  chatInput: string = '';
  isAiTyping: boolean = false;
  chatMessages: {role: string, text: string}[] = [
    {role: 'ai', text: '¡Hola! Soy el asistente virtual de Marivic Soft. ¿En qué puedo ayudarte hoy?'}
  ];
  @ViewChild('chatScroll') chatScroll!: ElementRef;
  
  private geminiKey = (window as any).process?.env?.GEMINI_API_KEY || '';
  private genAI: GoogleGenerativeAI | null = null;
  private chatModel: any;
  private chatSession: any;

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  ngAfterViewInit() {
    // Scroll Animation Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('!opacity-100', '!translate-y-0');
          // Optional: stop observing once animated
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });
  }

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
    
    const empresaInput = document.getElementById('empresa') as HTMLInputElement;
    const servicioInput = document.getElementById('servicio') as HTMLSelectElement;
    const descripcionInput = document.getElementById('descripcion') as HTMLTextAreaElement;
    
    if (empresaInput && servicioInput && descripcionInput) {
        const empresa = empresaInput.value;
        const servicio = servicioInput.value;
        const descripcion = descripcionInput.value;
        
        const textoMensaje = "*¡Hola Marivic Soft!* 👋🏼%0ADeseo solicitar una cotización para un nuevo proyecto.%0A%0A*🏢 Empresa/Proyecto:* " + encodeURIComponent(empresa) + "%0A*💻 Servicio de interés:* " + encodeURIComponent(servicio) + "%0A*📝 Descripción:* " + encodeURIComponent(descripcion) + "%0A%0AQuedo a la espera de su respuesta.";
        const numeroWhatsApp = "51930144555"; 
        window.open("https://wa.me/" + numeroWhatsApp + "?text=" + textoMensaje, '_blank');
        
        this.closeModal();
        form.reset();
    }
  }

  // ==========================================
  // Chatbot Gemini Logic
  // ==========================================
  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      if (!this.chatSession) this.initChat();
      this.scrollToBottom();
    }
  }

  cleanMarkdownText(text: string): string {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^\s*[\*\-]\s+/gm, '• ')
      .replace(/\*/g, '');
  }

  initChat(modelName: string = 'gemini-3.5-flash-lite') {
    try {
      const key = (window as any).process?.env?.GEMINI_API_KEY || this.geminiKey || '';
      if (!key) return;
      if (!this.genAI) {
        this.genAI = new GoogleGenerativeAI(key);
      }
      this.chatModel = this.genAI.getGenerativeModel({ model: modelName });
      this.chatSession = this.chatModel.startChat({
        history: [
          { 
            role: 'user', 
            parts: [{ 
              text: 'Actúa como un representante de ventas amigable, persuasivo y experto de la agencia de software "Marivic Soft" en Perú. ' +
                    'REGLA DE PRECIOS: Todas las estimaciones DEBEN ser EXCLUSIVAMENTE en Soles Peruanos (S/ o PEN). NUNCA menciones ni uses dólares (USD). ' +
                    'REGLA DE FORMATO: Escribe en texto plano limpio. NUNCA uses asteriscos (* ni **) ni formato markdown en tus respuestas. ' +
                    'Precios de referencia competitivos: Web Informativa desde S/ 900 PEN, Tienda Online / E-commerce desde S/ 1,500 PEN, Sistemas a medida desde S/ 2,500 PEN. ' +
                    'MANTÉN EL CONTEXTO: Recuerda todo lo que el cliente te ha dicho previamente en la conversación. ' +
                    'Responde a los clientes de forma muy breve, profesional y directa (máximo 2 párrafos) e invítalos a usar el simulador de la página o escribir por WhatsApp.' 
            }] 
          },
          { 
            role: 'model', 
            parts: [{ 
              text: '¡Entendido perfectamente! Hola, soy el Asistente Virtual de Marivic Soft. Todos nuestros presupuestos están expresados en Soles (S/ PEN) con precios competitivos. ¿En qué tipo de proyecto tecnológico te gustaría cotizar hoy?' 
            }] 
          }
        ]
      });
    } catch (err) {
      console.error('Error inicializando modelo:', err);
    }
  }

  async sendMessage() {
    if (!this.chatInput.trim() || this.isAiTyping) return;
    
    const userText = this.chatInput.trim();
    this.chatMessages.push({ role: 'user', text: userText });
    this.chatInput = '';
    this.isAiTyping = true;
    this.cdr.detectChanges();
    this.scrollToBottom();

    if (!this.chatSession) {
      this.initChat('gemini-3.5-flash-lite');
    }

    try {
      const result = await this.chatSession.sendMessage(userText);
      let responseText = result.response.text();
      responseText = this.cleanMarkdownText(responseText);
      this.chatMessages.push({ role: 'ai', text: responseText });
      this.isAiTyping = false;
      this.cdr.detectChanges();
      this.scrollToBottom();
      return;
    } catch (e: any) {
      console.warn('Error enviando mensaje con sesión actual, reintentando con fallback...', e);
      const fallbackModels = ['gemini-3.1-flash-lite', 'gemini-3.6-flash'];
      for (const m of fallbackModels) {
        try {
          this.initChat(m);
          const result = await this.chatSession.sendMessage(userText);
          let responseText = result.response.text();
          responseText = this.cleanMarkdownText(responseText);
          this.chatMessages.push({ role: 'ai', text: responseText });
          this.isAiTyping = false;
          this.cdr.detectChanges();
          this.scrollToBottom();
          return;
        } catch (err) {
          console.warn(`Fallback con ${m} falló:`, err);
        }
      }
    }

    // Fallback si la API key es inválida o todos los intentos fallan
    this.chatMessages.push({
      role: 'ai',
      text: '¡Hola! Por el momento no pude procesar el mensaje. Te invitamos a dar clic en "Solicitar Cotización" o escribirnos por WhatsApp 🟢 para atenderte de inmediato.'
    });
    this.isAiTyping = false;
    this.cdr.detectChanges();
    this.scrollToBottom();
  }

  onChatKeydown(event: any) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  scrollToBottom() {
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.chatScroll && this.chatScroll.nativeElement) {
        this.chatScroll.nativeElement.scrollTop = this.chatScroll.nativeElement.scrollHeight;
      }
    }, 30);
  }
}
