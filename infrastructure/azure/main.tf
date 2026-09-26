resource "azurerm_resource_group" "lab" {
  name = "${var.project_name}-rg"
  location = var.location
}

resource "azurerm_servicebus_namespace" "lab" {
  name = "${var.project_name}-sb"
  location = azurerm_resource_group.lab.location
  resource_group_name = azurerm_resource_group.lab.name
  sku = "Basic"
}

resource "azurerm_servicebus_queue" "events" {
  name = "events"
  namespace_id = azurerm_servicebus_namespace.lab.id
}

output "service_bus_namespace" {
  value = azurerm_servicebus_namespace.lab.name
}
