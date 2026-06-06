@description('Name prefix for all resources')
param prefix string = 'safeground'

@description('Location for Azure resources')
param location string = resourceGroup().location

@description('Container image name and tag')
param imageName string = '${prefix}:latest'

@description('Supabase URL')
param supabaseUrl string

@description('Supabase Anon Key')
@secure()
param supabaseAnonKey string

@description('Supabase Service Role Key')
@secure()
param supabaseServiceRoleKey string

@description('Gemini API Key')
@secure()
param geminiApiKey string

@description('Gemini Model')
param geminiModel string = 'gemini-2.0-flash'

@description('Admin Secret Key')
@secure()
param adminSecretKey string

@description('Admin Emails')
param adminEmails string = 'admin@safeground.app'

// ── App Service Plan ──
resource appPlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: '${prefix}-asp'
  location: location
  kind: 'linux'
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  properties: {
    reserved: true
  }
}

// ── App Service (Node.js) ──
resource appService 'Microsoft.Web/sites@2023-01-01' = {
  name: '${prefix}-app'
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appPlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|22-lts'
      appSettings: [
        { name: 'NODE_ENV', value: 'production' }
        { name: 'NEXT_PUBLIC_SUPABASE_URL', value: supabaseUrl }
        { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: supabaseAnonKey }
        { name: 'SUPABASE_SERVICE_ROLE_KEY', value: supabaseServiceRoleKey }
        { name: 'GEMINI_API_KEY', value: geminiApiKey }
        { name: 'GEMINI_MODEL', value: geminiModel }
        { name: 'ADMIN_SECRET_KEY', value: adminSecretKey }
        { name: 'ADMIN_EMAILS', value: adminEmails }
        { name: 'NEXT_PUBLIC_SITE_URL', value: 'https://${prefix}-app.azurewebsites.net' }
        { name: 'WEBSITE_NODE_DEFAULT_VERSION', value: '22-lts' }
        { name: 'PORT', value: '3000' }
      ]
      alwaysOn: true
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      healthCheckPath: '/api/stats'
    }
    httpsOnly: true
  }
}

// ── Log Analytics (optional, for insights) ──
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${prefix}-logs'
  location: location
  properties: {
    retentionInDays: 30
    sku: { name: 'PerGB2018' }
  }
}

// ── Application Insights ──
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${prefix}-ai'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

// ── Outputs ──
output appUrl string = 'https://${appService.properties.defaultHostName}'
output appServiceName string = appService.name
output appInsightsKey string = appInsights.properties.InstrumentationKey
