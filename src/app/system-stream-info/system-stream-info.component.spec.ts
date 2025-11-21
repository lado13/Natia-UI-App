import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemStreamInfoComponent } from './system-stream-info.component';

describe('SystemStreamInfoComponent', () => {
  let component: SystemStreamInfoComponent;
  let fixture: ComponentFixture<SystemStreamInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemStreamInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SystemStreamInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
