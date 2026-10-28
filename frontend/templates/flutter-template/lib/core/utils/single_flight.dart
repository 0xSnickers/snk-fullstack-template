/// 同一时间只执行一次的异步任务，并发调用复用同一个 Future。
/// 用于 Token 刷新：多个请求同时 401 只刷新一次。
class SingleFlight<T> {
  SingleFlight(this._task);

  final Future<T> Function() _task;
  Future<T>? _inFlight;

  Future<T> call() {
    return _inFlight ??= _task().whenComplete(() => _inFlight = null);
  }
}
