import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Room2Component } from './room2.component';

describe('Room2Component', () => {
  let component: Room2Component;
  let fixture: ComponentFixture<Room2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Room2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Room2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
