defmodule TodoAppWeb.TodosChannel do
  use LiveState.Channel, web_module: TodoAppWeb

  alias TodoApp.Todos
  alias LiveState.Event

  @impl true
  def init(_channel, _payload, _socket) do
    Phoenix.PubSub.subscribe(TodoApp.PubSub, "todos")
    {:ok, %{todos: list_todos()}}
  end

  @impl true
  def handle_event("add_todo", todo_params, %{todos: todos}) do
    case Todos.create_todo(todo_params) do
      {:ok, t} ->
        data = todo(t)
        {:reply, [%Event{name: "todo_created", detail: data}], %{todos: todos ++ [data]}}
    end
  end

  def handle_event("toggle_todo", %{"id" => id}, %{todos: todos}) do
    case id |> Todos.get_todo!() |> Todos.toggle_todo() do
      {:ok, t} ->
        %{id: id} = data = todo(t)
        todos = Enum.map(todos, fn
          %{id: ^id} = todo -> data
          todo -> todo
        end)
        {:reply, [%Event{name: "todo_updated", detail: data}], %{todos: todos}}
    end
  end

  @impl true
  def handle_message({:todo_created, todo}, state) do
    {:reply, [%Event{name: "todo_added", detail: todo}],
     state |> Map.put(:todos, list_todos())}
  end

  defp list_todos() do
    Todos.list_todos()
    |> Enum.map(&todo/1)
  end

  defp todo(%Todos.Todo{} = todo), do: Map.take(todo, [:id, :title, :completed])
end
