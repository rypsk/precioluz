import { Component, OnInit, inject, ViewChild, AfterViewInit, ElementRef, ChangeDetectionStrategy, signal, effect, PLATFORM_ID } from '@angular/core';
import { EsiosReeApiService } from '../../services/esios-ree-api.service';
import { Value } from '../../models/value';
import { Chart } from 'chart.js/auto';
import { DatePipe, DecimalPipe, CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EsiosApiResponse } from '../../models/esios-api-response';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['hour', 'price'];
  dataSource: Value[] = [];
  private readonly esiosReeApiService = inject(EsiosReeApiService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly themeService = inject(ThemeService);
  requestDate: string = new Date().toISOString().split('T')[0];
  maxDate: string = new Date().toISOString().split('T')[0];
  prices: number[] = [];
  pricesAux: number[] = [];
  colorMap: Map<number, string> = new Map();
  minPrice: any;
  maxPrice: any;
  minPriceHour!: any;
  maxPriceHour!: any;
  errorMessage = signal<string | null>(null);

  @ViewChild('myChart') myChart!: ElementRef;

  chart!: Chart;

  prices2 = signal<number[]>([]);
  dataSource2 = signal<Value[]>([]);

  constructor() {
    // Escuchar cambios de tema para actualizar el gráfico
    if (this.isBrowser) {
      effect(() => {
        const isDark = this.themeService.isDarkMode();
        if (this.chart) {
          this.updateChartTheme(isDark);
        }
      });
    }
  }

  ngOnInit() {
    this.fillColorMap();
    this.maxDateCalculate();
    this.getData();
  }

  ngAfterViewInit() {
    this.createChart();
  }

  maxDateCalculate() {
    let now = new Date();
    if (now.getHours() >= 21) {
       const tomorrow = new Date(now);
       tomorrow.setDate(tomorrow.getDate() + 1);
       this.maxDate = tomorrow.toISOString().split('T')[0];
    } else {
      this.maxDate = now.toISOString().split('T')[0];
    }
  }

  onChangeDatePicker(event: any) {
    this.requestDate = event.target.value;
    this.reset();
  }

  fillColorMap() {
    this.colorMap.set(1, '10b981'); // emerald-500
    this.colorMap.set(2, '10b981');
    this.colorMap.set(3, '34d399');
    this.colorMap.set(4, '34d399');
    this.colorMap.set(5, '6ee7b7');
    this.colorMap.set(6, '6ee7b7');
    this.colorMap.set(7, 'fbbf24'); // amber-400
    this.colorMap.set(8, 'fbbf24');
    this.colorMap.set(9, 'f59e0b');
    this.colorMap.set(10, 'f59e0b');
    this.colorMap.set(11, 'fb923c');
    this.colorMap.set(12, 'fb923c');
    this.colorMap.set(13, 'f97316'); // orange-500
    this.colorMap.set(14, 'f97316');
    this.colorMap.set(15, 'ea580c');
    this.colorMap.set(16, 'ea580c');
    this.colorMap.set(17, 'f43f5e'); // rose-500
    this.colorMap.set(18, 'f43f5e');
    this.colorMap.set(19, 'e11d48');
    this.colorMap.set(20, 'e11d48');
    this.colorMap.set(21, 'be123c');
    this.colorMap.set(22, 'be123c');
    this.colorMap.set(23, '9f1239');
    this.colorMap.set(24, '881337');
  }

  getData() {
    this.errorMessage.set(null);
    this.esiosReeApiService.getData(this.requestDate).subscribe({
      next: (data: EsiosApiResponse) => {
        this.dataSource = data.indicator.values;
        this.dataSource.forEach((value: Value) => {
          let price = value.value / 1000;
          value.color = 'red';
          this.prices.push(Math.round(price * 100000) / 100000);
          this.pricesAux.push(Math.round(price * 100000) / 100000);
          let pricesSorted: number[] = [];
          pricesSorted = [...this.pricesAux].sort((a, b) => a - b);
          let pricesMap = new Map<number, number>();
          let i: number = 1;

          pricesSorted.forEach((value: number) => {
            pricesMap.set(value, i)
            i++;
          })

          this.dataSource.forEach(value => {
            let price = value.value / 1000;
            value.position = pricesMap.get((Math.round(price * 100000) / 100000))!;
            value.color = this.colorMap.get(value.position)!;
            if (value.position == 1) { this.minPriceHour = value.datetime; }
            if (value.position == 24) { this.maxPriceHour = value.datetime; }
          })

          this.maxPrice = Math.max(...this.prices);
          this.minPrice = Math.min(...this.prices);
          this.dataSource2.set(this.dataSource);
          this.prices2.set(this.prices);
        });
        this.createChart();
      },
      error: (error: any) => {
        console.error('Error fetching data', error);
        if (error.message.includes('403')) {
          this.errorMessage.set('Acceso denegado (403). Por favor, verifica tu token de la API de ESIOS en el archivo de configuración.');
        } else {
          this.errorMessage.set('No se pudieron cargar los datos. Por favor, inténtalo de nuevo más tarde.');
        }
      }
    });
  }

  reset() {
    this.dataSource = [];
    this.prices = [];
    this.pricesAux = [];
    this.getData();
  }

  getClassColor(element: Value): string {
    let currentHour = new Date().getHours();
    let elementHour = new Date(element.datetime).getHours();
    let isNow = currentHour == elementHour;
    let bold = isNow ? " bold" : "";
    return 'color-' + element.position + bold;
  }

  isCurrentHour(datetime: string | Date): boolean {
    const now = new Date();
    const date = new Date(datetime);
    return now.getHours() === date.getHours() &&
           now.getDate() === date.getDate() &&
           now.getMonth() === date.getMonth() &&
           now.getFullYear() === date.getFullYear();
  }

  updateChartTheme(isDark: boolean) {
    const textColor = isDark ? '#f1f5f9' : '#1e293b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

    if (this.chart.options.scales?.['x']) {
      this.chart.options.scales['x'].grid = { color: gridColor };
      this.chart.options.scales['x'].ticks = { color: textColor };
    }
    if (this.chart.options.scales?.['y']) {
      this.chart.options.scales['y'].grid = { color: gridColor };
      if (this.chart.options.scales['y'].ticks) {
        this.chart.options.scales['y'].ticks.color = textColor;
      }
    }

    if (this.chart.options.plugins?.['legend']?.labels) {
      this.chart.options.plugins['legend'].labels.color = textColor;
    }

    if (this.chart.options.plugins?.['tooltip']) {
      this.chart.options.plugins['tooltip'].backgroundColor = isDark ? '#1e293b' : 'rgba(255, 255, 255, 0.9)';
      this.chart.options.plugins['tooltip'].titleColor = isDark ? '#f1f5f9' : '#1e293b';
      this.chart.options.plugins['tooltip'].bodyColor = isDark ? '#f1f5f9' : '#1e293b';
    }

    this.chart.update();
  }

  createChart() {
    if (!this.isBrowser || !this.myChart) {
      return;
    }
    if(this.chart){
      this.chart.destroy();
    }

    const isDark = this.themeService.isDarkMode();
    const textColor = isDark ? '#f1f5f9' : '#1e293b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

    this.chart = new Chart(this.myChart.nativeElement, {
      type: 'line',
      data: {
        labels: ['00h', '01h', '02h', '03h', '04h', '05h', '06h', '07h', '08h', '09h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h', '21h', '22h', '23h'],
        datasets: [{
          label: 'Precio (€/kWh)',
          data: this.prices2(),
          borderColor: '#3b82f6',
          backgroundColor: (context) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return;
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
            return gradient;
          },
          borderWidth: 3,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointHoverRadius: 6,
          pointRadius: 4,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : 'rgba(255, 255, 255, 0.9)',
            titleColor: isDark ? '#f1f5f9' : '#1e293b',
            bodyColor: isDark ? '#f1f5f9' : '#1e293b',
            padding: 12,
            bodyFont: { size: 14 },
            callbacks: {
              label: (item: any) => ` ${item.parsed.y?.toFixed(5)} €/kWh`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              display: true,
              color: gridColor
            },
            ticks: {
              color: textColor,
              callback: (value) => value + ' €'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: textColor
            }
          }
        }
      }
    });
  }
}
