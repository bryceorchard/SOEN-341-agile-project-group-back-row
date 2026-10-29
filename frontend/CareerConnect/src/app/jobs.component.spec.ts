import { buildJobsQuery } from './jobs.component';

describe('buildJobsQuery', () => {
  it('returns an empty object when no filters are set', () => {
    expect(buildJobsQuery({ keyword: '', location: '', category: '' })).toEqual({});
  });

  it('includes only the filters that have a value', () => {
    expect(buildJobsQuery({ keyword: 'backend', location: '', category: '' })).toEqual({
      keyword: 'backend',
    });
  });

  it('includes all three filters when all are set', () => {
    expect(buildJobsQuery({ keyword: 'backend', location: 'Montreal', category: 'Engineering' })).toEqual({
      keyword: 'backend',
      location: 'Montreal',
      category: 'Engineering',
    });
  });

  it('treats null/undefined filters the same as empty', () => {
    expect(buildJobsQuery({ keyword: null, location: undefined, category: '' })).toEqual({});
  });
});
