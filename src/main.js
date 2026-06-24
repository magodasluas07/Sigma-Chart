const databases = [
  {
    id: 'personagens-rpg',
    name: 'Personagens RPG',
    rows: [
      { Nome: 'Aventureiro Sigma', Classe: 'Guardião Arcano', Força: 8, Destreza: 7, Inteligência: 9, Carisma: 6, Constituição: 8, Sabedoria: 7 },
      { Nome: 'Lyra Noctis', Classe: 'Ladina', Força: 5, Destreza: 10, Inteligência: 7, Carisma: 8, Constituição: 6, Sabedoria: 6 },
      { Nome: 'Borin Martelo', Classe: 'Guerreiro', Força: 10, Destreza: 5, Inteligência: 4, Carisma: 5, Constituição: 10, Sabedoria: 6 },
    ],
  },
  {
    id: 'skills-time',
    name: 'Skills do Time',
    rows: [
      { Nome: 'Produto', Pesquisa: 9, Design: 8, Dados: 7, Estratégia: 9, Execução: 8, Comunicação: 8 },
      { Nome: 'Engenharia', Pesquisa: 6, Design: 5, Dados: 9, Estratégia: 7, Execução: 10, Comunicação: 7 },
      { Nome: 'Marketing', Pesquisa: 8, Design: 7, Dados: 8, Estratégia: 9, Execução: 7, Comunicação: 10 },
    ],
  },
];

const defaultConfig = {
  databaseId: 'personagens-rpg',
  rowIndex: 0,
  labelProperty: 'Nome',
  metricProperties: ['Força', 'Destreza', 'Inteligência', 'Carisma', 'Constituição', 'Sabedoria'],
  maxValue: 10,
  theme: 'light',
};

const state = loadConfigFromUrl();
const svgNamespace = 'http://www.w3.org/2000/svg';
const chartGeometry = {
  center: { x: 280, y: 215 },
  radius: 142,
  labelRadiusRatio: 1.28,
  steps: 5,
};

const elements = {
  form: document.querySelector('#chart-config-form'),
  databaseSelect: document.querySelector('#database-select'),
  rowSelect: document.querySelector('#row-select'),
  labelPropertySelect: document.querySelector('#label-property-select'),
  metricCheckboxes: document.querySelector('#metric-checkboxes'),
  maxValueInput: document.querySelector('#max-value-input'),
  themeSelect: document.querySelector('#theme-select'),
  embedUrl: document.querySelector('#embed-url'),
  chartCard: document.querySelector('#chart-card'),
  chartHeading: document.querySelector('#chart-heading'),
  chartSource: document.querySelector('#chart-source'),
  chartTitle: document.querySelector('#chart-title'),
  chartTotal: document.querySelector('#chart-total'),
  grid: document.querySelector('#radar-grid'),
  polygon: document.querySelector('#radar-polygon'),
  points: document.querySelector('#radar-points'),
  labels: document.querySelector('#radar-labels'),
  metricList: document.querySelector('#metric-list'),
};

function getActiveDatabase() {
  return databases.find((database) => database.id === state.databaseId) ?? databases[0];
}

function getActiveRow() {
  const database = getActiveDatabase();
  return database.rows[state.rowIndex] ?? database.rows[0];
}

function getProperties(row) {
  return Object.keys(row);
}

function getNumericProperties(row) {
  return getProperties(row).filter((property) => Number.isFinite(Number(row[property])));
}

function normalizeStateForDatabase() {
  const database = getActiveDatabase();
  const row = getActiveRow();
  const properties = getProperties(row);
  const numericProperties = getNumericProperties(row);

  if (!database.rows[state.rowIndex]) {
    state.rowIndex = 0;
  }

  if (!properties.includes(state.labelProperty)) {
    state.labelProperty = properties[0];
  }

  state.metricProperties = state.metricProperties.filter((property) => numericProperties.includes(property));

  if (state.metricProperties.length < 3) {
    state.metricProperties = numericProperties.slice(0, 6);
  }

  if (!Number.isFinite(state.maxValue) || state.maxValue <= 0) {
    state.maxValue = 10;
  }
}

function loadConfigFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const metricProperties = params.get('metrics')?.split(',').filter(Boolean) ?? defaultConfig.metricProperties;

  return {
    databaseId: params.get('database') ?? defaultConfig.databaseId,
    rowIndex: Number(params.get('row') ?? defaultConfig.rowIndex),
    labelProperty: params.get('label') ?? defaultConfig.labelProperty,
    metricProperties,
    maxValue: Number(params.get('max') ?? defaultConfig.maxValue),
    theme: params.get('theme') ?? defaultConfig.theme,
  };
}

function buildEmbedUrl() {
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('database', state.databaseId);
  url.searchParams.set('row', String(state.rowIndex));
  url.searchParams.set('label', state.labelProperty);
  url.searchParams.set('metrics', state.metricProperties.join(','));
  url.searchParams.set('max', String(state.maxValue));
  url.searchParams.set('theme', state.theme);

  return url.toString();
}

function createOption(value, label, selectedValue) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  option.selected = String(value) === String(selectedValue);
  return option;
}

function syncControls() {
  const database = getActiveDatabase();
  const row = getActiveRow();

  elements.databaseSelect.replaceChildren(
    ...databases.map((item) => createOption(item.id, item.name, state.databaseId)),
  );

  elements.rowSelect.replaceChildren(
    ...database.rows.map((item, index) => createOption(index, item[state.labelProperty] ?? `Linha ${index + 1}`, state.rowIndex)),
  );

  elements.labelPropertySelect.replaceChildren(
    ...getProperties(row).map((property) => createOption(property, property, state.labelProperty)),
  );

  elements.metricCheckboxes.replaceChildren(
    ...getNumericProperties(row).map((property) => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      const text = document.createElement('span');

      label.className = 'metric-toggle';
      input.type = 'checkbox';
      input.value = property;
      input.checked = state.metricProperties.includes(property);
      text.textContent = property;
      label.append(input, text);

      return label;
    }),
  );

  elements.maxValueInput.value = state.maxValue;
  elements.themeSelect.value = state.theme;
  elements.embedUrl.textContent = buildEmbedUrl();
}

function polarPoint(index, total, valueRatio = 1) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const distance = chartGeometry.radius * valueRatio;

  return {
    x: chartGeometry.center.x + Math.cos(angle) * distance,
    y: chartGeometry.center.y + Math.sin(angle) * distance,
  };
}

function createSvgElement(tagName, attributesMap = {}) {
  const element = document.createElementNS(svgNamespace, tagName);

  Object.entries(attributesMap).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
}

function pointsToString(points) {
  return points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ');
}

function clearChart() {
  elements.grid.replaceChildren();
  elements.points.replaceChildren();
  elements.labels.replaceChildren();
  elements.metricList.replaceChildren();
}

function renderGrid(metrics) {
  for (let step = 1; step <= chartGeometry.steps; step += 1) {
    const ratio = step / chartGeometry.steps;
    const polygonPoints = metrics.map((_, index) => polarPoint(index, metrics.length, ratio));

    elements.grid.appendChild(
      createSvgElement('polygon', {
        points: pointsToString(polygonPoints),
        fill: step % 2 === 0 ? 'var(--grid-fill)' : 'transparent',
        stroke: 'var(--grid-stroke)',
        'stroke-width': '1.2',
      }),
    );
  }

  metrics.forEach((_, index) => {
    const edge = polarPoint(index, metrics.length);

    elements.grid.appendChild(
      createSvgElement('line', {
        x1: chartGeometry.center.x,
        y1: chartGeometry.center.y,
        x2: edge.x,
        y2: edge.y,
        stroke: 'var(--grid-stroke)',
        'stroke-width': '1',
      }),
    );
  });
}

function renderRadar(metrics) {
  const radarPoints = metrics.map((metric, index) => polarPoint(index, metrics.length, metric.value / state.maxValue));
  elements.polygon.setAttribute('points', pointsToString(radarPoints));

  radarPoints.forEach((point, index) => {
    elements.points.appendChild(
      createSvgElement('circle', {
        cx: point.x,
        cy: point.y,
        r: 5,
        fill: '#ffffff',
        stroke: 'var(--accent)',
        'stroke-width': 3,
      }),
    );

    const labelPoint = polarPoint(index, metrics.length, chartGeometry.labelRadiusRatio);
    const label = createSvgElement('text', {
      x: labelPoint.x,
      y: labelPoint.y,
      fill: 'var(--card-muted)',
      'font-size': '14',
      'font-weight': '700',
      'text-anchor': labelPoint.x < chartGeometry.center.x - 10 ? 'end' : labelPoint.x > chartGeometry.center.x + 10 ? 'start' : 'middle',
      'dominant-baseline': 'middle',
    });

    label.textContent = metrics[index].label;
    elements.labels.appendChild(label);
  });
}

function renderMetricList(metrics) {
  const items = metrics.map((metric) => {
    const item = document.createElement('li');
    const label = document.createElement('span');
    const value = document.createElement('strong');

    item.className = 'metric-pill';
    label.textContent = metric.label;
    value.textContent = `${metric.value}/${state.maxValue}`;
    item.append(label, value);

    return item;
  });

  elements.metricList.replaceChildren(...items);
}

function renderChart() {
  normalizeStateForDatabase();
  const database = getActiveDatabase();
  const row = getActiveRow();
  const metrics = state.metricProperties.map((property) => ({
    label: property,
    value: Math.min(Number(row[property]) || 0, state.maxValue),
  }));

  clearChart();
  elements.chartCard.dataset.theme = state.theme;
  elements.chartHeading.textContent = row[state.labelProperty] ?? 'Radar chart';
  elements.chartSource.textContent = `${database.name} · ${state.metricProperties.length} campos numéricos`;
  elements.chartTitle.textContent = row[state.labelProperty] ?? 'Radar chart';
  elements.chartTotal.textContent = `máx. ${state.maxValue}`;

  if (metrics.length >= 3) {
    renderGrid(metrics);
    renderRadar(metrics);
    renderMetricList(metrics);
  } else {
    elements.polygon.setAttribute('points', '');
  }

  syncControls();
}

function handleConfigChange(event) {
  const target = event.target;

  if (target === elements.databaseSelect) {
    state.databaseId = target.value;
    state.rowIndex = 0;
    const row = getActiveRow();
    state.labelProperty = getProperties(row)[0];
    state.metricProperties = getNumericProperties(row).slice(0, 6);
  }

  if (target === elements.rowSelect) {
    state.rowIndex = Number(target.value);
  }

  if (target === elements.labelPropertySelect) {
    state.labelProperty = target.value;
  }

  if (target === elements.maxValueInput) {
    state.maxValue = Number(target.value);
  }

  if (target === elements.themeSelect) {
    state.theme = target.value;
  }

  if (target.matches('#metric-checkboxes input[type="checkbox"]')) {
    const checkedMetrics = [...elements.metricCheckboxes.querySelectorAll('input:checked')].map((input) => input.value);
    state.metricProperties = checkedMetrics;
  }

  renderChart();
}

elements.form.addEventListener('change', handleConfigChange);
elements.form.addEventListener('input', handleConfigChange);
renderChart();
