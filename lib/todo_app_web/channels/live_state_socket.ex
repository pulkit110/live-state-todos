defmodule TodoAppWeb.LiveStateSocket do
  use Phoenix.Socket

  channel "todos:*", TodoAppWeb.TodosChannel
  @impl true
  def connect(_params, socket), do: {:ok, socket}

  @impl true
  def id(_), do: "todos:*"
end
