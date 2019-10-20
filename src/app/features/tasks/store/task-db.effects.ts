import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {TaskActionTypes} from './task.actions';
import {select, Store} from '@ngrx/store';
import {tap, withLatestFrom} from 'rxjs/operators';
import {PersistenceService} from '../../../core/persistence/persistence.service';
import {selectTaskFeatureState} from './task.selectors';
import {selectCurrentProjectId} from '../../project/store/project.reducer';
import {NotifyService} from '../../../core/notify/notify.service';
import {TaskService} from '../task.service';
import {AttachmentActionTypes} from '../../attachment/store/attachment.actions';
import {ElectronService} from 'ngx-electron';
import {ReminderService} from '../../reminder/reminder.service';
import {GlobalConfigService} from '../../config/global-config.service';
import {TaskRepeatCfgActionTypes} from '../../task-repeat-cfg/store/task-repeat-cfg.actions';
import {BannerService} from '../../../core/banner/banner.service';
import {SnackService} from '../../../core/snack/snack.service';
import {Router} from '@angular/router';

@Injectable()
export class TaskDbEffects {
  @Effect({dispatch: false}) updateTask$: any = this._actions$
    .pipe(
      ofType(
        TaskActionTypes.AddTask,
        TaskActionTypes.RestoreTask,
        TaskActionTypes.AddTimeSpent,
        TaskActionTypes.RemoveTaskReminder,
        TaskActionTypes.DeleteTask,
        TaskActionTypes.UndoDeleteTask,
        TaskActionTypes.AddSubTask,
        TaskActionTypes.SetCurrentTask,
        TaskActionTypes.StartFirstStartable,
        TaskActionTypes.UnsetCurrentTask,
        TaskActionTypes.UpdateTask,
        TaskActionTypes.Move,
        TaskActionTypes.MoveToArchive,
        TaskActionTypes.MoveToOtherProject,
        TaskActionTypes.MoveToBacklog,
        TaskActionTypes.MoveToToday,
        TaskActionTypes.ToggleStart,

        AttachmentActionTypes.DeleteAttachment,
        AttachmentActionTypes.AddAttachment,

        TaskRepeatCfgActionTypes.AddTaskRepeatCfgToTask,
      ),
      withLatestFrom(
        this._store$.pipe(select(selectCurrentProjectId)),
        this._store$.pipe(select(selectTaskFeatureState)),
      ),
      tap(this._saveToLs.bind(this)),
      tap(this._updateLastActive.bind(this)),
    );

  @Effect({dispatch: false}) updateTaskUi$: any = this._actions$
    .pipe(
      ofType(
        TaskActionTypes.UpdateTaskUi,
        TaskActionTypes.ToggleTaskShowSubTasks,
      ),
      withLatestFrom(
        this._store$.pipe(select(selectCurrentProjectId)),
        this._store$.pipe(select(selectTaskFeatureState)),
      ),
      tap(this._saveToLs.bind(this))
    );

  constructor(private _actions$: Actions,
              private _store$: Store<any>,
              private _notifyService: NotifyService,
              private _taskService: TaskService,
              private _configService: GlobalConfigService,
              private _bannerService: BannerService,
              private _reminderService: ReminderService,
              private _router: Router,
              private _snackService: SnackService,
              private _electronService: ElectronService,
              private _persistenceService: PersistenceService) {
  }

  private _updateLastActive() {
    this._persistenceService.saveLastActive();
  }

  private _saveToLs([action, currentProjectId, taskState]) {
    if (currentProjectId && taskState.isDataLoaded) {
      // this._persistenceService.task.save(currentProjectId, taskState);
    } else {
      throw new Error('No current project id or data not loaded yet');
    }
  }
}


